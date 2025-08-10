
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from '../types';

// This function assumes process.env.API_KEY is set in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const productSchema = (currencyCode: string) => ({
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: 'A unique UUID for the product.' },
    name: { type: Type.STRING, description: 'The name of the product.' },
    description: { type: Type.STRING, description: 'A brief, appealing description of the product.' },
    price: { type: Type.NUMBER, description: `The price of the product in ${currencyCode}.` },
    category: { type: Type.STRING, description: 'The product category from the provided list.' },
    details: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 3-5 bullet points detailing key features or benefits.' },
    materials: { type: Type.STRING, description: 'A short description of the materials used.' },
    careInstructions: { type: Type.STRING, description: 'Instructions on how to care for the product.' },
    dimensions: { type: Type.STRING, description: 'The dimensions of the product (e.g., "10cm x 5cm x 2cm" or "Fits true to size").' }
  },
  required: ['id', 'name', 'description', 'price', 'category', 'details', 'materials', 'careInstructions', 'dimensions'],
});

export const fetchProducts = async (generateImages: boolean, categories: string[], currencyCode: string): Promise<Product[]> => {
  try {
    if (categories.length === 0) {
        console.warn("Category list is empty. Using default mock products.");
        return getMockProducts();
    }
      
    const currentSchema = productSchema(currencyCode);

    // 1. Fetch product text data
    const generateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 24 diverse and modern e-commerce products. The prices must be appropriate for the currency ${currencyCode}. Ensure they fall into the following categories: ${categories.join(', ')}. Each product must have a unique id generated using a UUID format. For each product, provide all the required fields as per the schema, including detailed information.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            ...currentSchema,
            properties: {
                ...currentSchema.properties,
                category: { ...currentSchema.properties.category, enum: categories },
            }
          },
        },
      },
    });

    const productsJson: Omit<Product, 'imageUrl'>[] = JSON.parse(generateContentResponse.text);

    // 2. Conditionally generate images for each product
    if (!generateImages) {
        // If image generation is off, return products with placeholders
        return productsJson.map(product => ({
            ...product,
            imageUrl: `https://picsum.photos/seed/${product.id}/600/600`,
        }));
    }
    
    // If image generation is on, generate them sequentially to avoid rate limiting.
    const productsWithImages: Product[] = [];
    for (const product of productsJson) {
        try {
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: `A professional, high-quality e-commerce photograph of a ${product.name}. ${product.description}. The product is centered on a clean, minimalist background, with soft studio lighting.`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            });
            
            const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

            productsWithImages.push({
                ...product,
                imageUrl,
            });
        } catch (imageError) {
            console.error(`Error generating image for product: ${product.name}`, imageError);
            // Fallback to a placeholder if image generation for a single product fails
            productsWithImages.push({
                ...product,
                imageUrl: `https://picsum.photos/seed/${product.id}/600/600`,
            });
        }
    }
    
    return productsWithImages;

  } catch (error) {
    console.error("Error fetching products from Gemini API:", error);
    // Fallback to mock data if API fails
    return getMockProducts();
  }
};

export const generateSingleProduct = async (prompt: string, categories: string[], currencyCode: string): Promise<Product> => {
    try {
        console.log(`Generating product for prompt: "${prompt}" in currency ${currencyCode}`);
        
        const currentSchema = productSchema(currencyCode);

        // 1. Generate Product Text Data
        const generateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `A user is asking for a product described as: "${prompt}". Based on this, generate a single e-commerce product. Create a product name, description, price, and other details that match the request. The price should be appropriate for the currency ${currencyCode}. Assign it to the most relevant category from this list: ${categories.join(', ')}. The product ID must be a unique UUID.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    ...currentSchema,
                    properties: {
                        ...currentSchema.properties,
                        category: { ...currentSchema.properties.category, enum: categories },
                    }
                },
            },
        });
        
        const productTextData: Omit<Product, 'imageUrl'> = JSON.parse(generateContentResponse.text);
        console.log("Generated product text data:", productTextData);

        // 2. Generate Product Image
        console.log(`Generating image for: ${productTextData.name}`);
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `A professional, high-quality e-commerce photograph of a ${productTextData.name}. ${productTextData.description}. The product is centered on a clean, minimalist background, with soft studio lighting.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        console.log("Image generated successfully.");

        // 3. Combine and return
        const newProduct: Product = {
            ...productTextData,
            imageUrl,
        };

        return newProduct;
    } catch (error) {
        console.error("Error in generateSingleProduct:", error);
        throw new Error("Failed to generate the custom product.");
    }
};

export const fetchForYouProductIds = async (allProducts: Product[]): Promise<string[]> => {
    try {
      const contentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `From the following JSON list of products, select up to 5 that would best appeal to a 'modern trendsetter with an eye for quality and unique design'. Return only a JSON array of their string IDs. Do not return anything else. \n\nPRODUCTS:\n${JSON.stringify(allProducts.map(p => ({id: p.id, name: p.name, description: p.description, category: p.category})))}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: 'The unique ID of a recommended product.'
            },
            description: 'An array of product IDs.'
          }
        }
      });
      const ids = JSON.parse(contentResponse.text);
      
      if (Array.isArray(ids) && ids.every(id => typeof id === 'string')) {
          return ids;
      }
      console.warn("Received non-array or invalid data for 'For You' recommendations:", ids);
      return [];
    } catch (error) {
      console.error("Error fetching 'For You' product IDs:", error);
      // Don't throw, just return empty so the app can fallback.
      return [];
    }
  };

export const fetchComplementaryProductIds = async (mainProduct: Product, allProducts: Product[]): Promise<string[]> => {
    try {
        const otherProducts = allProducts.filter(p => p.id !== mainProduct.id);
        if (otherProducts.length < 2) return [];

        const contentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an expert fashion stylist. A user is looking at the following product:
            
            PRODUCT: ${JSON.stringify({ id: mainProduct.id, name: mainProduct.name, description: mainProduct.description, category: mainProduct.category })}
            
            From the list of available products below, select 2 or 3 items that would best complement the main product to create a complete outfit or a matching set. Do not select the main product itself. Return only a JSON array of the matching product string IDs.
            
            AVAILABLE PRODUCTS:
            ${JSON.stringify(otherProducts.map(p => ({ id: p.id, name: p.name, description: p.description, category: p.category })))}
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: 'The unique ID of a complementary product.'
                    },
                    description: 'An array of 2-3 product IDs that complement the main product.'
                }
            }
        });

        const ids = JSON.parse(contentResponse.text);
        if (Array.isArray(ids) && ids.every(id => typeof id === 'string')) {
            return ids.slice(0, 3); // Ensure max 3 items
        }
        console.warn("AI 'Complete the Look' returned invalid data:", ids);
        return [];
    } catch (error) {
        console.error("Error fetching 'Complete the Look' product IDs:", error);
        return [];
    }
};

export const searchProducts = async (query: string, products: Product[]): Promise<string[]> => {
    try {
        const contentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an intelligent search engine for an e-commerce store. From the following JSON list of products, find the top 8 products that best match the user's search query. Consider the product name, description, and category.
            User Query: "${query}"
            
            PRODUCTS:
            ${JSON.stringify(products.map(p => ({id: p.id, name: p.name, description: p.description, category: p.category})))}
            
            Return only a JSON array of the matching product string IDs. Do not return anything else.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: 'The unique ID of a matching product.'
                    },
                    description: 'An array of product IDs that match the search query.'
                }
            }
        });

        const ids = JSON.parse(contentResponse.text);
        if (Array.isArray(ids) && ids.every(id => typeof id === 'string')) {
            return ids;
        }
        console.warn("AI search returned invalid data:", ids);
        return [];
    } catch (error) {
        console.error("Error searching products with AI:", error);
        return [];
    }
};


const getMockProducts = (): Product[] => {
    // Expanded mock data to 24 products to match the new API request count
    const baseProducts = [
        { id: '1', name: 'Wireless Noise-Cancelling Headphones', description: 'Immerse yourself in sound.', price: 249.99, category: 'Electronics', details: ['Active Noise Cancellation', '30-hour battery life', 'Built-in mic'], materials: 'Premium plastics, leatherette', careInstructions: 'Wipe clean.', dimensions: '20cm x 18cm x 8cm' },
        { id: '2', name: 'Organic Cotton T-Shirt', description: 'A soft, sustainable staple.', price: 29.99, category: 'Apparel', details: ['100% GOTS organic cotton', 'Classic fit', 'Pre-shrunk'], materials: '100% Organic Cotton', careInstructions: 'Machine wash cold.', dimensions: 'Fits true to size.' },
        { id: '3', name: 'Ceramic Pour-Over Coffee Maker', description: 'Brew the perfect cup.', price: 45.50, category: 'Home Goods', details: ['Durable ceramic', 'Spiral rib design', 'Includes wood stand'], materials: 'Ceramic, wood', careInstructions: 'Hand wash.', dimensions: '1-4 cup capacity.' },
        { id: '4', name: 'The Art of Minimalist Living', description: 'Declutter your life.', price: 19.95, category: 'Books', details: ['Hardcover linen finish', '250 pages', 'Full-color photos'], materials: 'FSC-certified paper', careInstructions: 'Keep dry.', dimensions: '8" x 10"' },
        { id: '5', name: 'Vitamin C Brightening Serum', description: 'For a radiant complexion.', price: 38.00, category: 'Beauty', details: ['15% Vitamin C', 'Reduces dark spots', 'Vegan & cruelty-free'], materials: 'Glass bottle', careInstructions: 'Apply in AM.', dimensions: '1 fl oz / 30 ml' },
        { id: '6', name: 'Portable Bluetooth Speaker', description: 'Big sound, small package.', price: 89.99, category: 'Electronics', details: ['IPX7 waterproof', '12-hour playtime', 'Bluetooth 5.0'], materials: 'Durable fabric, rubber', careInstructions: 'Rinse after salt water.', dimensions: '18cm x 7cm x 7cm' },
        { id: '7', name: 'Linen Blend Trousers', description: 'Lightweight and breathable.', price: 75.00, category: 'Apparel', details: ['Linen/cotton blend', 'Relaxed fit', 'Drawstring waist'], materials: '55% Linen, 45% Cotton', careInstructions: 'Machine wash cold.', dimensions: 'Sizes S-XL.' },
        { id: '8', name: 'Scented Soy Wax Candle', description: 'Sandalwood and vanilla.', price: 24.00, category: 'Home Goods', details: ['100% soy wax', '50-hour burn time', 'Reusable glass jar'], materials: 'Soy wax, essential oils', careInstructions: 'Trim wick before use.', dimensions: '8 oz / 226g' },
    ];

    // Duplicate and slightly modify to get 24 products for mock data
    const allProducts: Product[] = [];
    for (let i = 0; i < 3; i++) {
        baseProducts.forEach(p => {
            const newId = `${p.id}-${i}`;
            allProducts.push({
                ...p,
                id: newId,
                name: `${p.name} ${i > 0 ? `Series ${i + 1}` : ''}`.trim(),
                price: p.price + i * 5,
                imageUrl: `https://picsum.photos/seed/${newId}/600/600`
            });
        });
    }
    return allProducts;
};
