
import React from 'react';
import { Product, Currency } from '../types';
import ProductList from './ProductList';
import Editable from './Editable';

interface VerticalProductSectionProps {
  id: string;
  title: string;
  description: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductSelect: (product: Product) => void;
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
  onContentChange: (field: 'title' | 'description', value: string) => void;
  currency: Currency;
}

const VerticalProductSection: React.FC<VerticalProductSectionProps> = ({ id, title, description, products, onAddToCart, onProductSelect, isAdmin, onEditProduct, onContentChange, currency }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id={id} className="bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
            <Editable
                as="h2"
                isAdmin={isAdmin}
                value={title}
                onChange={(v) => onContentChange('title', v)}
                className="text-3xl md:text-4xl font-serif font-bold text-slate-900"
            />
            <Editable
                as="p"
                isAdmin={isAdmin}
                value={description}
                onChange={(v) => onContentChange('description', v)}
                className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto"
            />
        </div>
        <div className="mt-12">
            <ProductList 
                products={products} 
                onAddToCart={onAddToCart} 
                onProductSelect={onProductSelect}
                isAdmin={isAdmin}
                onEditProduct={onEditProduct}
                currency={currency}
            />
        </div>
      </div>
    </section>
  );
};

export default VerticalProductSection;
