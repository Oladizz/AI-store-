
import React from 'react';
import { CartItem, Currency } from '../types';
import { XMarkIcon, TrashIcon, PlusIcon, MinusIcon } from './icons';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  total: number;
  onCheckout: () => void;
  currency: Currency;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, total, onCheckout, currency }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Shopping Cart</h2>
            <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <h3 className="text-lg font-medium text-slate-800">Your cart is empty</h3>
                <p className="mt-1 text-slate-500">Add some products to get started.</p>
                <button onClick={onClose} className="mt-6 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    Continue Shopping
                </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <ul className="divide-y divide-slate-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="flex py-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-slate-200">
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-center" />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-slate-900">
                            <h3>{item.name}</h3>
                            <p className="ml-4">{currency.symbol}{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{currency.symbol}{item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center border border-slate-200 rounded-md">
                            <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-l-md"><MinusIcon className="h-4 w-4"/></button>
                            <span className="px-3 text-slate-900">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-r-md"><PlusIcon className="h-4 w-4"/></button>
                          </div>
                          <div className="flex">
                            <button onClick={() => onRemoveItem(item.id)} type="button" className="font-medium text-red-600 hover:text-red-500">
                              <TrashIcon className="h-5 w-5"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-slate-200 p-4">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <p>Subtotal</p>
                  <p>{currency.symbol}{total.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                  <button
                    onClick={onCheckout}
                    className="w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;
