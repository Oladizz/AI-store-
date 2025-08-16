// services/coinbaseService.ts

import { CartItem, Currency } from '../types';

// IMPORTANT: In a real-world application, this API key should be stored securely on a server.
// Do not expose it on the client-side.
const COINBASE_COMMERCE_API_KEY = import.meta.env.VITE_COINBASE_COMMERCE_API_KEY;

interface CoinbaseChargeResponse {
    data: {
        id: string;
        // There are many other properties in the response, but we only need the id for now.
    }
}

export const createCoinbaseCharge = async (cartItems: CartItem[], total: number, currency: Currency): Promise<string | null> => {
    try {
        const response = await fetch('https://api.commerce.coinbase.com/charges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CC-Api-Key': COINBASE_COMMERCE_API_KEY,
            },
            body: JSON.stringify({
                name: 'Your Order from OLADIZZ',
                description: `Order of ${cartItems.length} items`,
                local_price: {
                    amount: (total + 5.99).toFixed(2), // Add shipping cost
                    currency: currency.code,
                },
                pricing_type: 'fixed_price',
                // You can add more metadata here, like an order ID
                // metadata: {
                //     order_id: 'your_order_id'
                // }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Failed to create Coinbase charge:', errorData);
            return null;
        }

        const data: CoinbaseChargeResponse = await response.json();

        if (data.data && data.data.id) {
            return data.data.id;
        } else {
            console.error('Failed to create Coinbase charge: Invalid response format');
            return null;
        }
    } catch (error) {
        console.error('Error creating Coinbase charge:', error);
        return null;
    }
};
