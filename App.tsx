
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, CartItem, PageSection, PageContent, EditableProduct, User, CheckoutInfo, AuthModalView, Currency, Order } from './types';
import { fetchProducts, generateSingleProduct, fetchForYouProductIds } from './services/geminiService';
import { auth, db } from './services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import Header from './components/Header';
import ShoppingCart from './components/ShoppingCart';
import Footer from './Footer';
import Hero from './components/Hero';
import StyleAdvisor from './components/StyleAdvisor';
import StyleAdvisorButton from './components/StyleAdvisorButton';
import AboutUs from './components/AboutUs';
import OurCommitment from './components/OurCommitment';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import ContactUs from './components/ContactUs';
import ProductPage from './components/ProductPage';
import HorizontalProductSection from './components/FeaturedProducts';
import VerticalProductSection from './components/VerticalProductSection';
import AdminToolbar from './components/AdminToolbar';
import AdminSectionWrapper from './components/AdminSectionWrapper';
import ProductEditorModal from './components/ProductEditorModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import AuthModal from './components/AuthModal';
import CheckoutPage from './components/CheckoutPage';
import AdminDashboard from './components/AdminDashboard';
import SearchModal from './components/SearchModal';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === 'undefined') return initialValue;
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};

const initialPageContent: PageContent = {
    hero: { title: 'Style, Unboxed.', subtitle: 'Discover our new collection of hand-picked items, designed for the modern trendsetter.', cta: 'Shop The Collection' },
    about: { title: 'About OLADIZZ', p1: 'Founded on the principle of "Style, Unboxed," OLADIZZ is more than just a store—it\'s a destination for the modern tastemaker. We believe that great design should be accessible to everyone.', p2: 'Our journey began with a simple idea: to curate a collection of unique, high-quality products that you won\'t find anywhere else. Each item in our catalog is hand-picked by our team of expert curators, ensuring it meets our high standards of craftsmanship, style, and sustainability.' },
    commitment: { title: 'Our Commitment', description: 'We are committed to more than just aesthetics. Our philosophy is built on three core pillars: exceptional quality, timeless design, and a sustainable future.', items: [ {id: 'c1', text: '<strong>Quality Craftsmanship:</strong> We partner with the best artisans and manufacturers to ensure every product is not only beautiful but also built to last.'}, {id: 'c2', text: '<strong>Conscious Consumption:</strong> We advocate for mindful purchasing by creating durable pieces and using eco-friendly materials wherever possible.'}, {id: 'c3', text: '<strong>Timeless Style:</strong> We focus on curating items that transcend fleeting trends, offering you style that is both modern and enduring.'} ]},
    whyChooseUs: { title: 'Why Shop With Us?', description: 'We\'re not just another store. We\'re dedicated to providing a superior shopping experience from start to finish.', features: [ { id: 'f1', name: 'Curated Quality', description: 'Every item is hand-picked for its exceptional quality and modern design, ensuring you only get the best.', icon: 'ShieldCheckIcon' }, { id: 'f2', name: 'Fast Shipping', description: 'We know you can\'t wait. That\'s why we offer fast, reliable shipping on all orders to get your items to you quickly.', icon: 'TruckIcon' }, { id: 'f3', name: 'Exceptional Support', description: 'Our dedicated support team is here to help with any questions or concerns, making your experience seamless.', icon: 'ChatBubbleLeftRightIcon' } ] },
    testimonials: { title: 'From Our Customers', description: 'See what our community is saying about their OLADIZZ experience.', items: [ { id: 't1', quote: "The quality of the products is simply outstanding. You can feel the craftsmanship. My new favorite online store!", author: "Jessica M.", location: "New York, NY" }, { id: 't2', quote: "I was looking for unique home decor and OLADIZZ delivered. The style is modern yet timeless. Customer for life!", author: "Daniel K.", location: "London, UK" }, { id: 't3', quote: "Shopping was a breeze, and my order arrived faster than I expected. The AI Style Advisor is a fantastic feature!", author: "Chloe S.", location: "Sydney, AU" } ] },
    contact: { title: 'Get In Touch', description: 'Have a question or a suggestion? We\'d love to hear from you. Our team is always ready to help.', cta: 'Contact Support' },
};

const initialLayout: PageSection[] = [
    { id: 'hero', type: 'Hero', order: 1, content: { title: '', description: '' } },
    { id: 'for-you', type: 'HorizontalProductSection', order: 2, content: { title: 'Curated For You', description: 'AI-powered recommendations we think you\'ll love.' } },
    { id: 'h-prod-1', type: 'HorizontalProductSection', order: 3, content: { title: 'Featured Products', description: 'A collection of our favorite pieces, curated just for you.' }, productSlice: [0, 8] },
    { id: 'about', type: 'AboutUs', order: 4, content: { title: '', description: '' } },
    { id: 'v-prod-1', type: 'VerticalProductSection', order: 5, content: { title: 'Modern Essentials', description: 'Staple pieces to build your collection upon.' }, productSlice: [8, 12] },
    { id: 'commitment', type: 'OurCommitment', order: 6, content: { title: '', description: '' } },
    { id: 'h-prod-2', type: 'HorizontalProductSection', order: 7, content: { title: 'Trending Now', description: 'See what\'s popular and find your next favorite item.' }, productSlice: [12, 20] },
    { id: 'why-choose', type: 'WhyChooseUs', order: 8, content: { title: '', description: '' } },
    { id: 'v-prod-2', type: 'VerticalProductSection', order: 9, content: { title: 'New Arrivals', description: 'The latest additions to the OLADIZZ family.' }, productSlice: [20, 24] },
    { id: 'testimonials', type: 'Testimonials', order: 10, content: { title: '', description: '' } },
    { id: 'contact', type: 'ContactUs', order: 11, content: { title: '', description: '' } },
];

const initialCheckoutInfo: CheckoutInfo = {
    shipping: { fullName: '', address: '', city: '', state: '', zip: '', country: 'United States' },
    payment: { cardNumber: '', expiryDate: '', cvc: '' }
};

const supportedCurrencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
];

const App: React.FC = () => {
    // Product & Content State
    const [products, setProducts] = useLocalStorage<Product[]>('products', []);
    const [forYouProducts, setForYouProducts] = useLocalStorage<Product[]>('forYouProducts', []);
    const [pageContent, setPageContent] = useLocalStorage<PageContent>('pageContent', initialPageContent);
    const [pageLayout, setPageLayout] = useLocalStorage<PageSection[]>('pageLayout', initialLayout);
    const [categories, setCategories] = useLocalStorage<string[]>('categories', ["Electronics", "Apparel", "Home Goods", "Books", "Beauty"]);
    const [currency, setCurrency] = useLocalStorage<Currency>('currency', supportedCurrencies[0]);
    
    // UI & App State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
    const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [assistantContext, setAssistantContext] = useState<'default' | 'checkout'>('default');
    const [scrollToSection, setScrollToSection] = useState<string | null>(null);

    // Routing State
    const [activePath, setActivePath] = useState(window.location.pathname);
    const [clickedProduct, setClickedProduct] = useState<Product | null>(null);
    const activeProductId = useMemo(() => activePath.match(/^\/product\/([\w-]+)/)?.[1] || null, [activePath]);

    // Admin State
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [generateImagesOnLoad, setGenerateImagesOnLoad] = useLocalStorage<boolean>('generateImagesOnLoad', false);
    
    // Auth & Analytics State
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalView, setAuthModalView] = useState<AuthModalView>('login');

    // Checkout State
    const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo>(initialCheckoutInfo);

    // Auth State Effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setCurrentUser(userDocSnap.data() as User);
                } else {
                    // This case might happen if user exists in Auth but not Firestore.
                    // We'll create a basic user object.
                    setCurrentUser({
                        id: user.uid,
                        email: user.email || '',
                        name: user.displayName || 'User',
                        createdAt: user.metadata.creationTime || new Date().toISOString(),
                    });
                }
            } else {
                setCurrentUser(null);
            }
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            if (isAdminMode) {
                const usersCollectionRef = collection(db, "users");
                const usersSnapshot = await getDocs(usersCollectionRef);
                const usersList = usersSnapshot.docs.map(doc => doc.data() as User);
                setUsers(usersList);
            }
        };
        fetchUsers();
    }, [isAdminMode]);

    // Routing Effect
    useEffect(() => {
        const handleLocationChange = () => setActivePath(window.location.pathname);
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);
    
    const handleNavigate = useCallback((path: string, sectionId?: string) => {
        const currentPath = window.location.pathname;
        if (path !== currentPath) {
            window.history.pushState({}, '', path);
            setActivePath(path);
        }
        if (sectionId) {
            setScrollToSection(sectionId);
        } else {
            window.scrollTo(0, 0);
        }
    }, []);

    const handleProductSelect = (product: Product) => {
        setClickedProduct(product);
        handleNavigate(`/product/${product.id}`);
    };
    
    const sortedLayout = useMemo(() => [...pageLayout].sort((a,b) => a.order - b.order), [pageLayout]);

    useEffect(() => {
        if (scrollToSection && activePath === '/') {
            const timer = setTimeout(() => {
                const element = document.querySelector(scrollToSection);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
                setScrollToSection(null);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [scrollToSection, activePath, sortedLayout]);

    useEffect(() => {
        // When we navigate away from a product page, clear the clicked product state
        if (!activeProductId) {
            setClickedProduct(null);
        }
    }, [activeProductId]);

    // Data Loading
    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedProducts = await fetchProducts(generateImagesOnLoad, categories, currency.code);
            setProducts(fetchedProducts);
            setForYouProducts([]); // Reset recommendations on reload
        } catch (err) {
            setError('Failed to fetch products. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [categories, generateImagesOnLoad, currency.code, setProducts, setForYouProducts]);

    useEffect(() => {
        if (products.length === 0 && !isLoading) loadProducts();
    }, [loadProducts, products.length, isLoading]);
    
    useEffect(() => {
        setIsLoading(true);
        loadProducts();
    }, [currency.code, loadProducts]);


    useEffect(() => {
        const getRecommendations = async () => {
            if (products.length > 0 && forYouProducts.length === 0) {
                try {
                    const productSubset = products.length > 15 ? products.slice(0, 15) : products;
                    const forYouProductIds = await fetchForYouProductIds(productSubset);
                    const recommendedProducts = products.filter(p => forYouProductIds.includes(p.id));
                    setForYouProducts(recommendedProducts);
                } catch (err) {
                    console.error("Failed to fetch 'For You' recommendations:", err);
                }
            }
        };
        getRecommendations();
    }, [products, forYouProducts.length, setForYouProducts]);

    const activeProduct = useMemo(() => {
        if (!activeProductId) return null;
        // Prioritize the just-clicked product to prevent race conditions on reload
        if (clickedProduct && clickedProduct.id === activeProductId) {
            return clickedProduct;
        }
        // Otherwise, find the product in the main lists
        return products.find(p => p.id === activeProductId) || forYouProducts.find(p => p.id === activeProductId) || null;
    }, [activeProductId, products, forYouProducts, clickedProduct]);

    // Cart handlers
    const addToCart = (productToAdd: Product) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === productToAdd.id);
            if (existingItem) {
                return prevCart.map(item => item.id === productToAdd.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prevCart, { ...productToAdd, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity } : item));
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);
    const cartItemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

    // Admin Handlers
    const openAddProductModal = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditProductModal = (product: Product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (productData: EditableProduct) => {
        if (productData.id) { 
            setProducts(prev => prev.map(p => {
                if (p.id === productData.id) {
                    const newImageUrl = productData.imageUrl || p.imageUrl;
                    return { ...p, ...productData, imageUrl: newImageUrl };
                }
                return p;
            }));

        } else { 
            const newProduct = await generateSingleProduct("A product based on user input", categories, currency.code);
            setProducts(prev => [{ ...newProduct, ...productData }, ...prev]);
        }
        setIsProductModalOpen(false);
    };

    const handleDeleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handlePageContentChange = (section: keyof PageContent, field: string, value: any) => {
        setPageContent(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));
    };
    const handleSectionContentChange = (sectionId: string, field: 'title' | 'description', value: string) => {
        setPageLayout(prev => prev.map(s => s.id === sectionId ? { ...s, content: { ...s.content, [field]: value } } : s));
    };
    const handleSectionOrderChange = (sectionId: string, order: number) => {
        setPageLayout(prev => prev.map(s => s.id === sectionId ? { ...s, order } : s));
    };

    // Auth Handlers
    const handleLogin = async (email: string, password: string): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setIsAuthModalOpen(false);
            return true;
        } catch (error) {
            console.error("Firebase Login Error:", error);
            return false;
        }
    };

    const handleSignup = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            const newUser: User = {
                id: user.uid,
                name,
                email: user.email || '',
                createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, "users", user.uid), newUser);

            setIsAuthModalOpen(false);
            return true;
        } catch (error) {
            console.error("Firebase Signup Error:", error);
            return false;
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            if (activePath === '/checkout' || activePath === '/admin/dashboard') handleNavigate('/');
        } catch (error) {
            console.error("Firebase Logout Error:", error);
        }
    };

    const handleAuthRequest = (view: AuthModalView) => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
    };

    // Checkout Handlers
    const handleCheckout = () => {
        if (!currentUser) handleAuthRequest('login');
        else { handleNavigate('/checkout'); setIsCartOpen(false); }
    };

    const handlePlaceOrder = () => {
        if (!currentUser) return;
        const newOrder: Order = {
            id: `order-${Date.now()}`,
            userId: currentUser.id,
            userName: checkoutInfo.shipping.fullName || currentUser.name,
            items: cart,
            total: cartTotal + 5.99,
            currency: currency,
            date: new Date().toISOString(),
            status: 'Processing',
            shippingAddress: checkoutInfo.shipping,
            trackingNumber: `1Z${Date.now().toString().slice(-10)}`,
        };
        setOrders(prev => [...prev, newOrder]);
        setCart([]);
        setCheckoutInfo(initialCheckoutInfo);
        alert('Thank you for your order!');
        handleNavigate('/');
    };

    const handleCreateProductFromAI = async (prompt: string): Promise<Product | null> => {
        try {
            const newProduct = await generateSingleProduct(prompt, categories, currency.code);
            setProducts(prev => [newProduct, ...prev]);
            return newProduct;
        } catch (error) { return null; }
    };

    const handleNavigateToDashboard = () => handleNavigate('/admin/dashboard');

    if (isAuthLoading || (isLoading && products.length === 0)) return <div className="h-screen flex items-center justify-center text-xl font-semibold">Loading Store...</div>;
    if (error) return <div className="h-screen flex items-center justify-center text-xl text-red-500 p-8 text-center">{error}</div>;

    const renderHomePage = () => (
        <>
            {sortedLayout.map(section => {
                const renderSection = () => {
                    switch (section.type) {
                        case 'Hero': return <Hero content={pageContent.hero} isAdmin={isAdminMode} onContentChange={(field, value) => handlePageContentChange('hero', field, value)} onNavigate={(id) => handleNavigate('/', id)} />;
                        case 'HorizontalProductSection':
                            let hProducts = section.id === 'for-you' ? forYouProducts : (section.productSlice ? products.slice(section.productSlice[0], section.productSlice[1]) : []);
                            if(section.id === 'for-you' && hProducts.length === 0) return null;
                            return <HorizontalProductSection id={section.id} title={section.content.title} description={section.content.description} products={hProducts} onAddToCart={addToCart} onProductSelect={handleProductSelect} isAdmin={isAdminMode} onEditProduct={openEditProductModal} onContentChange={(field, value) => handleSectionContentChange(section.id, field, value)} currency={currency}/>;
                        case 'VerticalProductSection':
                            const vProducts = section.productSlice ? products.slice(section.productSlice[0], section.productSlice[1]) : [];
                            return <VerticalProductSection id={section.id} title={section.content.title} description={section.content.description} products={vProducts} onAddToCart={addToCart} onProductSelect={handleProductSelect} isAdmin={isAdminMode} onEditProduct={openEditProductModal} onContentChange={(field, value) => handleSectionContentChange(section.id, field, value)} currency={currency}/>;
                        case 'AboutUs': return <AboutUs content={pageContent.about} isAdmin={isAdminMode} onContentChange={(field, value) => handlePageContentChange('about', field, value)} />;
                        case 'OurCommitment': return <OurCommitment content={pageContent.commitment} isAdmin={isAdminMode} onContentChange={(field, value) => handlePageContentChange('commitment', field, value)} />;
                        case 'WhyChooseUs': return <WhyChooseUs content={pageContent.whyChooseUs} isAdmin={isAdminMode} onContentChange={(field, value) => setPageContent(p => ({...p, whyChooseUs: {...p.whyChooseUs, [field as 'title' | 'description']: value as any}}))} />;
                        case 'Testimonials': return <Testimonials content={pageContent.testimonials} isAdmin={isAdminMode} onContentChange={(field, value) => setPageContent(p => ({...p, testimonials: {...p.testimonials, [field as 'title' | 'description']: value as any}}))} />;
                        case 'ContactUs': return <ContactUs content={pageContent.contact} isAdmin={isAdminMode} onContentChange={(field, value) => handlePageContentChange('contact', field, value)} />;
                        default: return null;
                    }
                };
                return <AdminSectionWrapper key={section.id} isAdmin={isAdminMode} section={section} onOrderChange={handleSectionOrderChange}>{renderSection()}</AdminSectionWrapper>
            })}
        </>
    );

    const renderPageContent = () => {
        if (activePath === '/checkout') {
            if (!currentUser) { 
                handleNavigate('/'); 
                return null;
            }
            return <CheckoutPage cartItems={cart} total={cartTotal} currentUser={currentUser} checkoutInfo={checkoutInfo} onCheckoutInfoChange={setCheckoutInfo} onPlaceOrder={handlePlaceOrder} onBackToCart={() => setIsCartOpen(true)} onOpenAssistant={() => { setAssistantContext('checkout'); setIsAssistantOpen(true); }} currency={currency} />;
        }
        if (activePath === '/admin/dashboard') {
             if (!isAdminMode) { 
                handleNavigate('/'); 
                return null;
            }
            return <AdminDashboard onNavigate={handleNavigate} users={users} orders={orders} currency={currency} />;
        }
        if (activeProduct) {
            return <ProductPage product={activeProduct} onAddToCart={addToCart} onBack={() => handleNavigate('/')} currency={currency} allProducts={products} onProductSelect={handleProductSelect} />;
        }
        return renderHomePage();
    };

    return (
        <div className="relative">
            {activePath !== '/admin/dashboard' && <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} onAuthClick={handleAuthRequest} onSearchClick={() => setIsSearchOpen(true)} />}
            
            <main>
                {renderPageContent()}
            </main>
            
            {activePath !== '/admin/dashboard' && <Footer onNavigate={handleNavigate} />}
            
            <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cartItems={cart} onUpdateQuantity={updateCartQuantity} onRemoveItem={removeFromCart} total={cartTotal} onCheckout={handleCheckout} currency={currency} />
            <StyleAdvisor isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} context={assistantContext} products={products} categories={categories} currentUser={currentUser} onAddToCart={addToCart} onProductSelect={(product) => {handleProductSelect(product); setIsAssistantOpen(false);}} isAdmin={isAdminMode} onEnterAdminMode={() => setIsAdminMode(true)} onCreateProduct={handleCreateProductFromAI} onAuthRequest={(view) => {setIsAssistantOpen(false); handleAuthRequest(view);}} onCheckoutRequest={() => {setIsAssistantOpen(false); handleCheckout();}} onCheckoutInfoUpdate={(info) => setCheckoutInfo(prev => ({...prev, shipping: info}))} orders={orders}/>
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} allProducts={products} onProductSelect={(product) => {handleProductSelect(product); setIsSearchOpen(false);}} currency={currency}/>
            
            {!isAdminMode && <StyleAdvisorButton onClick={() => { setAssistantContext('default'); setIsAssistantOpen(true); }} />}
            
            {isAdminMode && <AdminToolbar onAddProduct={openAddProductModal} onManageCategories={() => setIsCategoryModalOpen(true)} onExitAdminMode={() => setIsAdminMode(false)} onReloadProducts={loadProducts} generateImages={generateImagesOnLoad} onToggleGenerateImages={setGenerateImagesOnLoad} onNavigateToDashboard={handleNavigateToDashboard} supportedCurrencies={supportedCurrencies} currentCurrency={currency} onCurrencyChange={setCurrency} />}
            
            <ProductEditorModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} onDelete={handleDeleteProduct} product={editingProduct} categories={categories} />
            <CategoryManagerModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} categories={categories} setCategories={setCategories}/>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} view={authModalView} setView={setAuthModalView} onLogin={handleLogin} onSignup={handleSignup} />
        </div>
    );
};

export default App;
