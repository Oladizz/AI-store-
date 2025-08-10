
import React, { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon, PlusIcon } from './icons';

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ isOpen, onClose, categories, setCategories }) => {
    const [localCategories, setLocalCategories] = useState(categories);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLocalCategories(categories);
        }
    }, [isOpen, categories]);
    
    const handleUpdateCategory = (index: number, value: string) => {
        const updated = [...localCategories];
        updated[index] = value;
        setLocalCategories(updated);
    };

    const handleAddCategory = () => {
        if (newCategory.trim() && !localCategories.includes(newCategory.trim())) {
            setLocalCategories([...localCategories, newCategory.trim()]);
            setNewCategory('');
        }
    };
    
    const handleRemoveCategory = (index: number) => {
        setLocalCategories(localCategories.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        setCategories(localCategories.filter(c => c.trim() !== ''));
        onClose();
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-start pt-20 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-serif text-slate-800">Manage Categories</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-slate-600">Add, edit, or remove product categories. These are used for product organization and filtering.</p>
                    {localCategories.map((cat, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={cat}
                                onChange={(e) => handleUpdateCategory(index, e.target.value)}
                                className="flex-grow border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button onClick={() => handleRemoveCategory(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                     <div className="flex items-center gap-2 pt-2 border-t">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                            className="flex-grow border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button onClick={handleAddCategory} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full">
                            <PlusIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-end p-4 bg-slate-50 border-t rounded-b-lg gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Categories</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagerModal;
