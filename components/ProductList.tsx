
import React from 'react';
import { Product, Currency } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductSelect: (product: Product) => void;
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
  currency: Currency;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, onProductSelect, isAdmin, onEditProduct, currency }) => {
  if (products.length === 0) {
    return (
        <div className="text-center py-20">
            <h3 className="text-2xl font-semibold text-slate-900">No Products Found</h3>
            <p className="mt-1 text-slate-500">Try adjusting your filters.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart} 
            onProductSelect={onProductSelect}
            isAdmin={isAdmin}
            onEdit={onEditProduct}
            currency={currency}
        />
      ))}
    </div>
  );
};

export default ProductList;
