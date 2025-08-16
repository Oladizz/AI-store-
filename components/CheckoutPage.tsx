
import React from 'react';
import { CartItem, User, CheckoutInfo, Currency } from '../types';
import { SparklesIcon } from './icons';
import { Checkout, CheckoutButton, CheckoutStatus, LifecycleStatus } from '@coinbase/onchainkit/checkout';
import { createCoinbaseCharge } from '../services/coinbaseService';

interface CheckoutPageProps {
    cartItems: CartItem[];
    total: number;
    currentUser: User;
    checkoutInfo: CheckoutInfo;
    onCheckoutInfoChange: React.Dispatch<React.SetStateAction<CheckoutInfo>>;
    onPlaceOrder: () => void;
    onBackToCart: () => void;
    onOpenAssistant: () => void;
    currency: Currency;
    setCoinbaseChargeId: (id: string | null) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, total, currentUser, checkoutInfo, onCheckoutInfoChange, onPlaceOrder, onBackToCart, onOpenAssistant, currency, setCoinbaseChargeId }) => {

    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckoutInfoChange(prev => ({ ...prev, shipping: { ...prev.shipping, [e.target.name]: e.target.value } }));
    };

    const chargeHandler = async () => {
        const chargeId = await createCoinbaseCharge(cartItems, total, currency);
        if (chargeId) {
            setCoinbaseChargeId(chargeId);
        }
        return chargeId;
    };

    const statusHandler = (status: LifecycleStatus) => {
        if (status.statusName === 'success') {
            onPlaceOrder();
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="text-center py-40">
                <h2 className="text-2xl font-semibold">Your Cart is Empty</h2>
                <p className="mt-2 text-slate-600">You must have items in your cart to check out.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-slate-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                     <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">Checkout</h1>
                     <p className="mt-3 text-lg text-slate-600">Welcome, {currentUser.name}. Let's get your order placed.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Shipping & Payment Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold font-serif text-slate-800">Shipping Information</h2>
                                <button
                                    type="button"
                                    onClick={onOpenAssistant}
                                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                    <SparklesIcon className="h-5 w-5" />
                                    <span>Fill with AI</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-sm">
                                <div className="sm:col-span-2">
                                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">Full Name</label>
                                    <input type="text" name="fullName" id="fullName" value={checkoutInfo.shipping.fullName} onChange={handleShippingChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
                                    <input type="text" name="address" id="address" value={checkoutInfo.shipping.address} onChange={handleShippingChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-slate-700">City</label>
                                    <input type="text" name="city" id="city" value={checkoutInfo.shipping.city} onChange={handleShippingChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-slate-700">State</label>
                                    <input type="text" name="state" id="state" value={checkoutInfo.shipping.state} onChange={handleShippingChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="zip" className="block text-sm font-medium text-slate-700">ZIP Code</label>
                                    <input type="text" name="zip" id="zip" value={checkoutInfo.shipping.zip} onChange={handleShippingChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-slate-700">Country</label>
                                    <input type="text" name="country" id="country" value={checkoutInfo.shipping.country} onChange={handleShippingChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm bg-slate-50" readOnly />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-semibold font-serif text-slate-800 mb-4">Payment Details</h2>
                            <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-lg shadow-sm">
                                <Checkout chargeHandler={chargeHandler} onStatus={statusHandler}>
                                    <CheckoutButton className="w-full bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors" />
                                    <CheckoutStatus />
                                </Checkout>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                            <h2 className="text-2xl font-semibold font-serif text-slate-800 border-b pb-4">Order Summary</h2>
                            <ul className="divide-y divide-slate-200 mt-4">
                                {cartItems.map(item => (
                                    <li key={item.id} className="flex py-4 items-center">
                                        <img src={item.imageUrl} alt={item.name} className="h-16 w-16 rounded-md object-cover"/>
                                        <div className="ml-4 flex-1">
                                            <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-sm text-slate-800">{currency.symbol}{(item.price * item.quantity).toFixed(2)}</p>
                                    </li>
                                ))}
                            </ul>
                             <div className="border-t border-slate-200 pt-4 mt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <p className="text-slate-500">Subtotal</p>
                                    <p className="font-medium text-slate-800">{currency.symbol}{total.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-slate-500">Shipping</p>
                                    <p className="font-medium text-slate-800">{currency.symbol}5.99</p>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                                    <p>Total</p>
                                    <p>{currency.symbol}{(total + 5.99).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button type="button" onClick={onBackToCart} className="mt-2 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                    &larr; Back to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
