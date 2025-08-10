
import React, { useState, useEffect, useRef } from 'react';
import { Product, EditableProduct } from '../types';
import { XMarkIcon, TrashIcon, ArrowUpOnSquareIcon } from './icons';

interface ProductEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: EditableProduct) => void;
    onDelete: (productId: string) => void;
    product: Product | null;
    categories: string[];
}

const ProductEditorModal: React.FC<ProductEditorModalProps> = ({ isOpen, onClose, onSave, onDelete, product, categories }) => {
    const [formData, setFormData] = useState<EditableProduct>({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
        details: [],
        materials: '',
        careInstructions: '',
        dimensions: '',
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setFormData({ ...product, imageFile: null });
            setImagePreview(null); // Clear file preview when loading a product
        } else {
            // Reset for new product
            setFormData({ name: '', price: 0, category: categories[0] || '', description: '', imageUrl: '', details: [], materials: '', careInstructions: '', dimensions: '', imageFile: null });
            setImagePreview(null);
        }
    }, [product, isOpen, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Clear file-based previews when URL is used
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            imageUrl: e.target.value,
            imageFile: null,
        }));
    };

    const handleDetailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, details: e.target.value.split('\n') }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Clear URL when file is used
            setFormData(prev => ({ ...prev, imageFile: file, imageUrl: '' }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const handleDelete = () => {
        if (product && window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            onDelete(product.id);
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-serif text-slate-800">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image Column */}
                         <div className="md:col-span-1 space-y-2">
                            <h3 className="text-sm font-semibold text-slate-600">Product Image</h3>
                            <div className="aspect-square w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {imagePreview || formData.imageUrl ? (
                                    <img src={imagePreview || formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm text-slate-400 p-4 text-center">Upload an image or paste a URL</span>
                                )}
                            </div>
                            
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 rounded-md py-2 transition-colors">
                                <ArrowUpOnSquareIcon className="h-5 w-5" />
                                <span>{imagePreview ? 'Change File' : 'Upload File'}</span>
                            </button>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-300" /></div>
                                <div className="relative flex justify-center"><span className="bg-white px-2 text-sm text-slate-500">or</span></div>
                            </div>
                           
                            <div>
                                <label htmlFor="imageUrl" className="sr-only">Image URL</label>
                                <input 
                                    type="url" 
                                    name="imageUrl" 
                                    id="imageUrl" 
                                    value={formData.imageUrl || ''} 
                                    onChange={handleUrlChange}
                                    placeholder="Paste image URL..."
                                    className="w-full border-slate-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>

                        {/* Details Column */}
                        <div className="md:col-span-2 space-y-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                                    <input type="number" name="price" id="price" value={formData.price || 0} onChange={handleChange} required step="0.01" className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                <select name="category" id="category" value={formData.category || ''} onChange={handleChange} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea name="description" id="description" value={formData.description || ''} onChange={handleChange} required rows={3} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                             <div>
                                <label htmlFor="details" className="block text-sm font-medium text-slate-700 mb-1">Details (one per line)</label>
                                <textarea name="details" id="details" value={formData.details?.join('\n') || ''} onChange={handleDetailsChange} rows={4} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="materials" className="block text-sm font-medium text-slate-700 mb-1">Materials</label>
                                    <input type="text" name="materials" id="materials" value={formData.materials || ''} onChange={handleChange} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="careInstructions" className="block text-sm font-medium text-slate-700 mb-1">Care</label>
                                    <input type="text" name="careInstructions" id="careInstructions" value={formData.careInstructions || ''} onChange={handleChange} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                                <div>
                                    <label htmlFor="dimensions" className="block text-sm font-medium text-slate-700 mb-1">Dimensions</label>
                                    <input type="text" name="dimensions" id="dimensions" value={formData.dimensions || ''} onChange={handleChange} className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 border-t rounded-b-lg">
                        <div>
                            {product && (
                                <button type="button" onClick={handleDelete} className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                    Delete Product
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
                            <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Product</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditorModal;
