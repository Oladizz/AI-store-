import { db } from '../firebase';
import { collection, getDocs, writeBatch, addDoc, query, where, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Product, Order, User, PageContent, PageSection, EditableProduct } from '../types';
import { fetchProducts as fetchProductsFromGemini } from './geminiService';

export const getProducts = async (): Promise<Product[]> => {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return productList;
};

export const saveProduct = async (productData: EditableProduct): Promise<string> => {
    if (productData.id) {
        // Update existing product
        const productRef = doc(db, 'products', productData.id);
        const { id, ...dataToUpdate } = productData;
        await updateDoc(productRef, dataToUpdate);
        return id;
    } else {
        // Create new product
        const productsCol = collection(db, 'products');
        const docRef = await addDoc(productsCol, productData);
        return docRef.id;
    }
};

export const deleteProduct = async (productId: string): Promise<void> => {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
};

export const getPageContent = async (): Promise<{ pageContent: PageContent, pageLayout: PageSection[] } | null> => {
    const contentRef = doc(db, 'content', 'homepage');
    const contentSnap = await getDoc(contentRef);
    if (contentSnap.exists()) {
        return contentSnap.data() as { pageContent: PageContent, pageLayout: PageSection[] };
    }
    return null;
};

export const savePageContent = async (pageContent: PageContent, pageLayout: PageSection[]): Promise<void> => {
    const contentRef = doc(db, 'content', 'homepage');
    await setDoc(contentRef, { pageContent, pageLayout });
};

export const getAllUsers = async (): Promise<User[]> => {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
};

export const getOrdersForUser = async (userId: string): Promise<Order[]> => {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where("userId", "==", userId));
    const orderSnapshot = await getDocs(q);
    const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orderList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllOrders = async (): Promise<Order[]> => {
    const ordersCol = collection(db, 'orders');
    const orderSnapshot = await getDocs(ordersCol);
    const orderList = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orderList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const saveOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
    const ordersCol = collection(db, 'orders');
    const docRef = await addDoc(ordersCol, order);
    return docRef.id;
};

export const getCategories = async (): Promise<string[]> => {
    const categoriesCol = collection(db, 'categories');
    const categorySnapshot = await getDocs(categoriesCol);
    // Assuming each document in 'categories' has a 'name' field
    const categoryList = categorySnapshot.docs.map(doc => doc.data().name as string);
    return categoryList;
};

export const seedDatabaseWithProducts = async (categories: string[], currencyCode: string): Promise<void> => {
    console.log("Seeding database... This may take a moment.");
    try {
        // 1. Generate products using the Gemini service
        // We pass false for generating images to get placeholders, as generating 24 real images can be slow and costly.
        // The real images can be generated on-demand or as a separate admin action.
        const newProducts = await fetchProductsFromGemini(false, categories, currencyCode);

        // 2. Use a batched write to add all products to Firestore for efficiency
        const batch = writeBatch(db);

        newProducts.forEach((product) => {
            const productRef = collection(db, 'products').doc();
            batch.set(productRef, product);
        });

        // 3. Also save the categories if they don't exist
        // For simplicity, we'll just overwrite them. A real app might check for existence first.
        categories.forEach(categoryName => {
            const categoryRef = collection(db, 'categories').doc(categoryName.toLowerCase());
            batch.set(categoryRef, { name: categoryName });
        });

        // 4. Commit the batch
        await batch.commit();

        console.log(`Database seeded successfully with ${newProducts.length} products and ${categories.length} categories.`);
        alert("Database seeded successfully!");

    } catch (error) {
        console.error("Error seeding database:", error);
        alert("There was an error seeding the database. Check the console for details.");
    }
};
