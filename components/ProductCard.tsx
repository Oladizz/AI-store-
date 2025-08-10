
import React from 'react';
import { Product, Currency } from '../types';
import { PencilSquareIcon } from './icons';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductSelect: (productId: string) => void;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  currency: Currency;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onProductSelect, isAdmin, onEdit, currency }) => {
  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isAdmin) return; // Prevent navigation in admin mode
    onProductSelect(product.id);
  }

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(product);
  }

  return (
    <a 
      href={`/product/${product.id}`}
      onClick={handleCardClick}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-lg h-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
      <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {!isAdmin && (
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                    onClick={handleAddToCartClick}
                    aria-label={`Add ${product.name} to cart`}
                    className="w-full bg-white text-slate-900 font-bold py-2.5 px-4 rounded-md shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Add to Cart
                </button>
            </div>
        )}
         {isAdmin && (
            <div className="absolute top-2 right-2">
                <button
                    onClick={handleEditClick}
                    aria-label={`Edit ${product.name}`}
                    className="p-2 bg-white/80 text-slate-900 rounded-full shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
            </div>
        )}
      </div>
      <div className="p-3 flex flex-col text-left flex-grow">
        <h3 className="text-sm font-bold text-slate-800 flex-grow">
            {product.name}
        </h3>
        <div className="flex justify-between items-baseline gap-2 mt-2">
            <p className="text-xs text-slate-500">{product.category}</p>
            <p className="text-base font-bold text-slate-900">{currency.symbol}{product.price.toFixed(2)}</p>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
