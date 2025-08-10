
import React from 'react';
import { Product, Currency } from '../types';
import ProductCard from './ProductCard';
import Editable from './Editable';

interface HorizontalProductSectionProps {
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

const HorizontalProductSection: React.FC<HorizontalProductSectionProps> = ({ id, title, description, products, onAddToCart, onProductSelect, isAdmin, onEditProduct, onContentChange, currency }) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section id={id} className="bg-white">
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
        <div className="mt-12 flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-60 md:w-64">
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart} 
                onProductSelect={onProductSelect}
                isAdmin={isAdmin}
                onEdit={onEditProduct}
                currency={currency}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HorizontalProductSection;
