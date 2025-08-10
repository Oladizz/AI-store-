
import React, { useState, useEffect, useRef } from 'react';
import { Product, Currency } from '../types';
import { searchProducts } from '../services/geminiService';
import { XMarkIcon, SearchIcon } from './icons';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    allProducts: Product[];
    onProductSelect: (productId: string) => void;
    currency: Currency;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, allProducts, onProductSelect, currency }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            // Reset state when modal closes
            setQuery('');
            setResults([]);
            setIsLoading(false);
            setError(null);
            setHasSearched(false);
        }
    }, [isOpen]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        try {
            const resultIds = await searchProducts(query, allProducts);
            const foundProducts = resultIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean) as Product[];
            setResults(foundProducts);
        } catch (err) {
            setError('An error occurred during the search. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className={`fixed inset-0 z-50 bg-slate-50/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="w-full h-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-white shadow-lg w-full max-w-2xl mx-auto mt-[10vh] rounded-lg flex flex-col max-h-[80vh]">
                     <header className="p-4 flex items-center justify-between border-b border-slate-200">
                        <form onSubmit={handleSearch} className="flex-grow flex items-center">
                            <label htmlFor="search-input" className="sr-only">Search</label>
                            <SearchIcon className="h-5 w-5 text-slate-400 mr-3" />
                            <input
                                ref={inputRef}
                                id="search-input"
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-800 placeholder:text-slate-400"
                            />
                        </form>
                        <button onClick={onClose} className="p-2 -mr-2 rounded-full text-slate-500 hover:bg-slate-100">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </header>

                    <div className="flex-grow overflow-y-auto">
                        {isLoading && (
                            <div className="p-16 text-center">
                                <p className="text-slate-600">Searching...</p>
                            </div>
                        )}

                        {!isLoading && error && (
                             <div className="p-16 text-center">
                                <p className="text-red-500">{error}</p>
                            </div>
                        )}
                        
                        {!isLoading && !error && hasSearched && results.length === 0 && (
                            <div className="p-16 text-center">
                                <h3 className="text-xl font-semibold text-slate-800">No results found for "{query}"</h3>
                                <p className="mt-2 text-slate-500">Try a different search term or check your spelling.</p>
                            </div>
                        )}

                        {!isLoading && !error && results.length > 0 && (
                            <ul className="divide-y divide-slate-100">
                                {results.map(product => (
                                    <li key={product.id}>
                                        <a 
                                            href={`/product/${product.id}`}
                                            onClick={(e) => { e.preventDefault(); onProductSelect(product.id); }}
                                            className="flex items-center p-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-md object-cover flex-shrink-0 bg-slate-200" />
                                            <div className="ml-4 flex-grow">
                                                <p className="font-semibold text-slate-800">{product.name}</p>
                                                <p className="text-sm text-slate-500">{product.category}</p>
                                            </div>
                                            <p className="font-semibold text-slate-900">{currency.symbol}{product.price.toFixed(2)}</p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                         {!isLoading && !hasSearched && (
                            <div className="p-16 text-center">
                                <h3 className="text-xl font-semibold text-slate-800">Find anything in the store</h3>
                                <p className="mt-2 text-slate-500">Our AI-powered search can help you find products by name, color, style, and more.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
