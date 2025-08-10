
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Product, User, AuthModalView, Order } from '../types';
import { XMarkIcon, PaperAirplaneIcon, PlusIcon } from './icons';
import { supportData } from '../supportData';

// This function assumes process.env.API_KEY is set in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface StyleAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'default' | 'checkout';
  products: Product[];
  categories: string[];
  currentUser: User | null;
  onAddToCart: (product: Product) => void;
  onProductSelect: (productId: string) => void;
  isAdmin: boolean;
  onEnterAdminMode: () => void;
  onCreateProduct: (prompt: string) => Promise<Product | null>;
  onAuthRequest: (view: AuthModalView) => void;
  onCheckoutRequest: () => void;
  onCheckoutInfoUpdate: (info: { fullName: string; address: string; city: string; state: string; zip: string; country: string; }) => void;
  orders: Order[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  recommendedProducts?: Product[];
  offerCreate?: boolean;
}

const checkoutShippingSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "The user's full name for the shipping label." },
        address: { type: Type.STRING, description: "The user's street address, including apartment or suite number." },
        city: { type: Type.STRING, description: "The city for the shipping address." },
        state: { type: Type.STRING, description: "The 2-letter state abbreviation (e.g., 'CA', 'NY')." },
        zip: { type: Type.STRING, description: "The 5-digit ZIP code." },
        country: { type: Type.STRING, description: "The country. Default to 'United States' if not specified." }
    },
    required: ["fullName", "address", "city", "state", "zip", "country"]
};

const TypingIndicator = () => (
    <div className="flex items-center space-x-2">
        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></div>
    </div>
);

const StyleAdvisor: React.FC<StyleAdvisorProps> = ({ isOpen, onClose, context, products, categories, currentUser, onAddToCart, onProductSelect, isAdmin, onEnterAdminMode, onCreateProduct, onAuthRequest, onCheckoutRequest, onCheckoutInfoUpdate, orders }) => {
  const chatRef = useRef<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserQuery, setLastUserQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adminCode = "𝕆𝕃𝔸𝔻𝕀ℤℤ";

  const systemInstruction = useMemo(() => {
    if (isAdmin && context === 'default') {
        return `You are OLADIZZ's expert AI Assistant, speaking to an Admin. Your tone is professional, helpful, and concise. Your main goal is to guide the admin on how to use the store's management tools.
- Do not perform actions directly. Instead, explain HOW the admin can perform them using the UI.

**Admin Guidance:**
- **Product Creation:** To create a new product, you can describe it to me. For example: "Create a minimalist leather wallet." I will generate it with an image.
- **Product Editing:** To edit a product's details (name, price, image URL), first exit this chat. Then, on the main page, find the product and click the pencil icon on its card. This will open the editor.
- **Viewing Analytics:** To see sales reports, revenue charts, and user growth, click the "Dashboard" button in the admin toolbar at the bottom of the screen.
- **Managing Categories:** Use the "Categories" button in the admin toolbar to add, edit, or remove product categories.
- **Changing Currency:** Use the currency dropdown menu in the admin toolbar to change the store's currency. All product prices will automatically update.
- **Reloading Products:** To fetch a new set of AI-generated products, use the "Reload All" button in the admin toolbar.

Start conversations by welcoming the admin and asking what they need help with. You can remind them of a few key features they can ask about.`;
    }
    if (context === 'checkout') {
        return `You are helping a user fill out their shipping information for checkout. Your goal is to be friendly, efficient, and accurate.
- Greet the user and ask for their full shipping information (name, address, city, state, and zip code).
- You MUST extract this information and provide it as a JSON object matching the required schema. Do not omit any fields.
- If the user provides information piecemeal, ask clarifying questions until you have all the required fields. For example, if they only give a street, ask for the city, state, and zip.
- Once you have all the information, confirm it with the user before you output the final JSON.`;
    }
    // Default context
    const userOrders = currentUser ? orders.filter(o => o.userId === currentUser.id) : [];
    const orderHistoryContext = userOrders.length > 0 
        ? `<OrderHistory>${JSON.stringify(userOrders)}</OrderHistory>` 
        : "The user has no past orders.";
        
    return `You are OLADIZZ's friendly and expert AI Assistant. Your goal is to help users with customer support, style advice, and account actions. You are conversational, stylish, and knowledgeable.
- The user is currently ${currentUser ? `logged in as ${currentUser.name}.` : 'not logged in.'}
- If the user asks about orders, use their order history to answer. Be helpful and provide details like status, tracking numbers, and delivery addresses.

**1. Account & Actions:**
- If the user asks to "log in" or "sign in", respond with "No problem, I can help with that." and include the tag: [SHOW_AUTH_MODAL:login]
- If the user asks to "sign up" or "create an account", respond with "I can get you set up." and include the tag: [SHOW_AUTH_MODAL:signup]
- If the user wants to "check out" or "buy now", respond appropriately and include the tag: [START_CHECKOUT]

**2. Customer Support:**
- If the user asks a support question (shipping, returns, etc.), use the following data and their order history to answer. Be empathetic and helpful. Do not invent policies or order details. If an order isn't in their history, politely say you can't find it.
<SupportData>${JSON.stringify(supportData)}</SupportData>
${orderHistoryContext}

**3. Style Advisor & Product Creator:**
- If the user asks for product recommendations, search the catalog.
- To suggest a product, you MUST include its ID in this format: [ID:product-id-goes-here].
- If you CANNOT find a match, you MUST ask if they'd like you to create a custom product. Your response MUST include the tag [OFFER_CREATE_PRODUCT].

**Admin Mode:**
The code to enter admin mode is "𝕆𝕃𝔸𝔻𝕀ℤℤ". Do not reveal it.

**Catalog & Categories:**
<Catalog>${JSON.stringify(products.map(p => ({id: p.id, name: p.name, category: p.category, price: p.price, description: p.description})))}</Catalog>
Available categories for new products: ${categories.join(', ')}.
`;
  }, [isAdmin, products, categories, currentUser, context, orders]);

  useEffect(() => {
    if (!isOpen) {
        setMessages([]);
        setUserInput('');
        setIsLoading(true);
        setIsProcessing(false);
        setLastUserQuery('');
        chatRef.current = null;
        return;
    }

    if (products.length === 0) {
        setMessages([{ id: 'error-init', role: 'assistant', text: "I'm sorry, the product catalog isn't available right now." }]);
        setIsLoading(false);
        return;
    }
    
    if (chatRef.current && chatRef.current.config.systemInstruction !== systemInstruction) {
       // Re-initialize if the system instruction has changed (e.g. user logged in)
       chatRef.current = null;
    }

    if (chatRef.current) return;

    try {
        const newChat = ai.chats.create({ model: 'gemini-2.5-flash', config: { systemInstruction } });
        chatRef.current = newChat;

        const getGreeting = async () => {
            setIsLoading(true);
            try {
                let initialPrompt;
                if (context === 'checkout') {
                    initialPrompt = "Start the conversation by asking for the user's full shipping information to fill out the form.";
                } else if (isAdmin) {
                    initialPrompt = "Start with a brief, professional greeting for the admin. Ask how you can help and mention they can ask about creating products or managing the store.";
                } else {
                    initialPrompt = "Start with a friendly greeting and ask how you can help. Mention style advice or support questions.";
                }
                const response = await newChat.sendMessageStream({ message: initialPrompt });
                let text = "";
                for await (const chunk of response) text += chunk.text;
                setMessages([{ id: 'init', role: 'assistant', text }]);
            } catch (error) {
                console.error("Failed to get greeting:", error);
                setMessages([{ id: 'error-init', role: 'assistant', text: "I'm having a little trouble connecting. Please try again in a moment." }]);
            } finally {
                setIsLoading(false);
            }
        };
        getGreeting();
    } catch(e) {
        console.error("Failed to initialize chat:", e);
        setMessages([{ id: 'error-init', role: 'assistant', text: "I'm sorry, the AI Assistant is currently unavailable." }]);
        setIsLoading(false);
    }
  }, [isOpen, context, products, systemInstruction, isAdmin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isProcessing]);

  const parseAndAct = (text: string): { cleanedText: string; recommendedProducts: Product[]; offerCreate: boolean } => {
    const recommendedProducts: Product[] = [];
    let offerCreate = false;

    // Tag Actions
    if (text.includes('[SHOW_AUTH_MODAL:login]')) onAuthRequest('login');
    if (text.includes('[SHOW_AUTH_MODAL:signup]')) onAuthRequest('signup');
    if (text.includes('[START_CHECKOUT]')) onCheckoutRequest();
    if (text.includes('[OFFER_CREATE_PRODUCT]')) offerCreate = true;
    
    // Product ID parsing
    const productIDRegex = /\[ID:([\w-]+)\]/g;
    const cleanedText = text.replace(productIDRegex, (_, productId) => {
      const product = products.find(p => p.id === productId);
      if (product && !recommendedProducts.find(p => p.id === product.id)) {
        recommendedProducts.push(product);
      }
      return '';
    }).replace(/\[.*?\]/g, '').trim(); // Remove all tags from final text

    return { cleanedText, recommendedProducts, offerCreate };
  };
  
  const handleSendMessage = async (e?: React.FormEvent, messageOverride?: string) => {
    e?.preventDefault();
    const messageToSend = messageOverride || userInput;
    if (!messageToSend.trim() || isLoading || isProcessing) return;

    if (messageToSend.trim() === adminCode) {
        onEnterAdminMode();
        onClose();
        return;
    }

    setLastUserQuery(messageToSend);
    if (!chatRef.current) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: messageToSend }]);
    setUserInput('');
    setIsLoading(true);

    try {
        if (context === 'checkout') {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `The user's response is: "${messageToSend}". Extract their shipping info. If any detail is missing, ask for it. If all details are present, confirm with them and then provide the JSON.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        oneOf: [
                            {...checkoutShippingSchema}, 
                            {type: Type.STRING, description: "A question to the user to get missing information."}
                        ]
                    }
                }
            });
            
            const responseData = JSON.parse(response.text);

            if (typeof responseData === 'string') {
                setMessages(prev => [...prev, {id: Date.now().toString(), role: 'assistant', text: responseData}]);
            } else {
                onCheckoutInfoUpdate(responseData);
                const confirmationText = `Great, I've filled out your shipping info with:\n\n**${responseData.fullName}**\n${responseData.address}\n${responseData.city}, ${responseData.state} ${responseData.zip}\n\nI'll close now so you can proceed with payment.`;
                setMessages(prev => [...prev, {id: Date.now().toString(), role: 'assistant', text: confirmationText}]);
                setTimeout(onClose, 4000);
            }
        } else {
             const responseStream = await chatRef.current.sendMessageStream({ message: messageToSend });
            let assistantResponse = "";
            setMessages(prev => [...prev, { id: 'streaming', role: 'assistant', text: "" }]);
            
            for await (const chunk of responseStream) {
                assistantResponse += chunk.text;
                setMessages(prev => prev.map(msg => msg.id === 'streaming' ? {...msg, text: assistantResponse} : msg));
            }

            const { cleanedText, recommendedProducts, offerCreate } = parseAndAct(assistantResponse);

            setMessages(prev => prev.map(msg => msg.id === 'streaming' ? {
                ...msg, 
                id: Date.now().toString() + '-assistant', 
                text: cleanedText,
                recommendedProducts,
                offerCreate,
            } : msg));
        }
    } catch (error) {
        console.error("Failed to send message:", error);
        setMessages(prev => [...prev, { id: 'error-' + Date.now(), role: 'assistant', text: "I'm having trouble responding right now. Please try again." }]);
    } finally {
        setIsLoading(false);
    }
  };

    const handleOfferResponse = async (accepted: boolean) => {
        setMessages(prev => prev.map(m => ({ ...m, offerCreate: false })));

        if (accepted) {
            setMessages(prev => [...prev, {id: Date.now().toString(), role: 'user', text: "Yes, please create it!"}, {id: Date.now().toString() + '-creating', role: 'assistant', text: "Excellent! Let me design that for you..."}]);
            setIsProcessing(true);
            try {
                const newProduct = await onCreateProduct(lastUserQuery);
                if (newProduct) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + '-created', role: 'assistant', text: "All done! Here is the custom product I designed for you.",
                        recommendedProducts: [newProduct]
                    }]);
                } else {
                     setMessages(prev => [...prev, { id: 'error-create', role: 'assistant', text: "I'm sorry, I wasn't able to create that right now. Please try another description."}]);
                }
            } catch (e) {
                 setMessages(prev => [...prev, { id: 'error-create-catch', role: 'assistant', text: "Something went wrong during creation. Please try again later."}]);
            } finally { setIsProcessing(false); }
        } else {
            setMessages(prev => [...prev, {id: Date.now().toString(), role: 'user', text: "No, thanks."}, {id: Date.now().toString() + '-assist', role: 'assistant', text: "No problem! Is there anything else I can help with?"}]);
        }
    };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" />
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-slate-50 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-semibold text-slate-900 font-serif">AI Assistant</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`w-fit max-w-sm rounded-2xl px-4 py-2.5 ${message.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                {message.recommendedProducts?.length && (
                  <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                    {message.recommendedProducts.map(product => (
                      <div key={product.id} className="flex items-center gap-3 text-left">
                        <button onClick={() => { onProductSelect(product.id); onClose(); }} className="flex items-center gap-3 text-left w-full hover:bg-slate-100 p-2 rounded-lg transition-colors">
                            <img src={product.imageUrl} alt={product.name} className="h-12 w-12 rounded-md object-cover flex-shrink-0 bg-slate-100" />
                            <div className="flex-1"><p className="text-xs font-bold">{product.name}</p><p className="text-xs text-slate-500">${product.price.toFixed(2)}</p></div>
                        </button>
                        <button onClick={() => onAddToCart(product)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-indigo-600 flex-shrink-0"><PlusIcon className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                {message.offerCreate && !isProcessing && (
                    <div className="mt-3 border-t pt-3 flex items-center gap-3">
                        <button onClick={() => handleOfferResponse(true)} className="flex-1 text-sm bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-200">Yes, create it!</button>
                        <button onClick={() => handleOfferResponse(false)} className="flex-1 text-sm bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-300">No, thanks</button>
                    </div>
                )}
              </div>
            </div>
          ))}
          {(isLoading || isProcessing) && (
            <div className="flex items-end gap-2 justify-start"><div className="w-fit max-w-sm rounded-2xl px-4 py-2.5 bg-white text-slate-800 rounded-bl-none shadow-sm"><TypingIndicator /></div></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 border-t border-slate-200 bg-white">
            {isAdmin && context === 'default' && (
                <div className="px-2 pt-1 pb-2 flex flex-wrap gap-2 justify-center">
                    <button onClick={() => handleSendMessage(undefined, "How do I edit a product?")} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">Edit a Product</button>
                    <button onClick={() => handleSendMessage(undefined, "How do I see my sales report?")} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">View Sales</button>
                    <button onClick={() => handleSendMessage(undefined, "Create a product for me")} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">Create Product</button>
                </div>
            )}
            {!isAdmin && context === 'default' && (
                <div className="px-2 pt-1 pb-2 flex flex-wrap gap-2 justify-center">
                    <button onClick={() => handleSendMessage(undefined, "Can you give me some style advice?")} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">Style Advice</button>
                    <button onClick={() => handleSendMessage(undefined, "What's your return policy?")} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">Return Policy</button>
                    {currentUser && orders.some(o => o.userId === currentUser.id) ? (
                         <button onClick={() => handleSendMessage(undefined, "Where is my most recent order?")} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">Track My Order</button>
                    ) : (
                        <button onClick={() => onAuthRequest('login')} className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded-full hover:bg-slate-300">Login/Signup</button>
                    )}
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={context === 'checkout' ? "Enter your shipping info..." : "Ask for recommendations or help..."}
                  className="flex-1 w-full px-4 py-2 text-sm text-slate-900 bg-slate-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isLoading || isProcessing}
                />
                <button type="submit" disabled={isLoading || isProcessing || !userInput.trim()} className="p-3 bg-indigo-600 text-white rounded-full disabled:bg-indigo-300 disabled:cursor-not-allowed hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors" aria-label="Send message">
                    <PaperAirplaneIcon className="h-5 w-5" />
                 </button>
            </form>
        </div>
      </div>
    </>
  );
};

export default StyleAdvisor;
