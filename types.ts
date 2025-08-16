
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  details: string[];
  materials: string;
  careInstructions: string;
  dimensions: string;
}

export type EditableProduct = Omit<Product, 'id' | 'imageUrl'> & { id?: string, imageFile?: File | null, imageUrl?: string };


export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: string; // ISO string
  roles?: ('admin' | 'customer')[];
  // Note: Passwords are not stored in the frontend state for security.
}

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export interface Order {
    id: string;
    userId: string | null;
    userName: string;
    items: CartItem[];
    total: number;
    currency: Currency;
    date: string; // ISO string
    status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
    shippingAddress: CheckoutInfo['shipping'];
    trackingNumber?: string;
    coinbaseChargeId?: string | null;
}

export interface CheckoutInfo {
    shipping: {
        fullName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    payment: {
        cardNumber: string;
        expiryDate: string;
        cvc: string;
    };
}

export type AuthModalView = 'login' | 'signup';


export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  location: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface PageContent {
  hero: { title: string; subtitle: string; cta: string; };
  about: { title: string; p1: string; p2: string; };
  commitment: { title: string; description: string; items: { id: string, text: string }[] };
  whyChooseUs: { title: string; description: string; features: Feature[] };
  testimonials: { title: string; description: string; items: Testimonial[] };
  contact: { title: string; description: string; cta: string; };
}

export interface PageSection {
  id: string;
  type: 'Hero' | 'HorizontalProductSection' | 'AboutUs' | 'VerticalProductSection' | 'OurCommitment' | 'WhyChooseUs' | 'Testimonials' | 'ContactUs' | 'Shop';
  order: number;
  content: {
    title: string;
    description: string;
  };
  productSlice?: [number, number];
}
