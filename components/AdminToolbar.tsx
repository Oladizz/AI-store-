
import React from 'react';
import { PlusCircleIcon, TagIcon, ArrowUturnLeftIcon, ArrowPathIcon, ChartBarIcon } from './icons';
import ToggleSwitch from './ToggleSwitch';
import { Currency } from '../types';

interface AdminToolbarProps {
    onAddProduct: () => void;
    onManageCategories: () => void;
    onExitAdminMode: () => void;
    onSeedDatabase: () => void;
    generateImages: boolean;
    onToggleGenerateImages: (enabled: boolean) => void;
    onNavigateToDashboard: () => void;
    supportedCurrencies: Currency[];
    currentCurrency: Currency;
    onCurrencyChange: (currency: Currency) => void;
}

const AdminToolbar: React.FC<AdminToolbarProps> = ({ 
    onAddProduct, 
    onManageCategories, 
    onExitAdminMode, 
    onSeedDatabase,
    generateImages, 
    onToggleGenerateImages,
    onNavigateToDashboard,
    supportedCurrencies,
    currentCurrency,
    onCurrencyChange
}) => {
    
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCurrency = supportedCurrencies.find(c => c.code === e.target.value);
        if (selectedCurrency) {
            onCurrencyChange(selectedCurrency);
        }
    };
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm z-50 p-2 shadow-lg">
            <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-white text-sm font-bold">Admin Mode</div>
                    <ToggleSwitch 
                        label="Gen Images"
                        enabled={generateImages}
                        onChange={onToggleGenerateImages}
                    />
                    <div>
                         <label htmlFor="currency-select" className="sr-only">Currency</label>
                         <select 
                            id="currency-select"
                            value={currentCurrency.code}
                            onChange={handleCurrencyChange}
                            className="bg-slate-700 text-white border-slate-600 rounded-md py-1.5 pl-2 pr-8 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                         >
                             {supportedCurrencies.map(c => (
                                 <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                             ))}
                         </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                    <button
                        onClick={onNavigateToDashboard}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-purple-500/80 hover:bg-purple-500 rounded-md transition-colors"
                    >
                        <ChartBarIcon className="h-5 w-5" />
                        <span>Dashboard</span>
                    </button>
                    <button
                        onClick={onSeedDatabase}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-yellow-500/80 hover:bg-yellow-500 rounded-md transition-colors"
                    >
                        <ArrowPathIcon className="h-5 w-5" />
                        <span>Seed Database</span>
                    </button>
                    <button
                        onClick={onAddProduct}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-green-500/80 hover:bg-green-500 rounded-md transition-colors"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        <span>Add Product</span>
                    </button>
                    <button
                        onClick={onManageCategories}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-white bg-blue-500/80 hover:bg-blue-500 rounded-md transition-colors"
                    >
                        <TagIcon className="h-5 w-5" />
                        <span>Categories</span>
                    </button>
                    <button
                        onClick={onExitAdminMode}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
                    >
                        <ArrowUturnLeftIcon className="h-5 w-5" />
                        <span>Exit</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminToolbar;
