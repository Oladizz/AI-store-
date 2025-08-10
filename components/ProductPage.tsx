
import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { MinusIcon, PlusIcon, ChevronDownIcon } from './icons';
import { fetchComplementaryProductIds } from '../services/geminiService';
import HorizontalProductSection from './FeaturedProducts';

interface ProductPageProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  currency: Currency;
  allProducts: Product[];
  onProductSelect: (productId: string) => void;
}

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-slate-200 py-4">
            <h3>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex w-full items-center justify-between text-left text-slate-900"
                    aria-expanded={isOpen}
                >
                    <span className="font-semibold">{title}</span>
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </h3>
            {isOpen && (
                <div className="mt-4 text-sm text-slate-600 prose prose-sm max-w-none">
                    {children}
                </div>
            )}
        </div>
    );
};

const ProductPage: React.FC<ProductPageProps> = ({ product, onAddToCart, onBack, currency, allProducts, onProductSelect }) => {
    
    const [complementaryProducts, setComplementaryProducts] = useState<Product[]>([]);
    const [isLoadingComplementary, setIsLoadingComplementary] = useState<boolean>(false);

    useEffect(() => {
        const getComplementaryProducts = async () => {
            if (product && allProducts.length > 1) {
                setIsLoadingComplementary(true);
                try {
                    const ids = await fetchComplementaryProductIds(product, allProducts);
                    const recommended = allProducts.filter(p => ids.includes(p.id));
                    setComplementaryProducts(recommended);
                } catch (error) {
                    console.error("Failed to fetch complementary products", error);
                    setComplementaryProducts([]); // reset on error
                } finally {
                    setIsLoadingComplementary(false);
                }
            }
        };

        setComplementaryProducts([]); // Reset when product changes
        getComplementaryProducts();
    }, [product, allProducts]);

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pt-16 sm:pb-24">
        <div className="mb-8">
            <button onClick={onBack} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                &larr; Back to Shop
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden bg-slate-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Product Info */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">{product.category}</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-serif font-bold text-slate-900">{product.name}</h1>
            <p className="mt-4 text-3xl text-slate-800">{currency.symbol}{product.price.toFixed(2)}</p>
            
            <div className="mt-6">
                <h2 className="sr-only">Product description</h2>
                <div className="text-base text-slate-600 space-y-4">
                    <p>{product.description}</p>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Add to Cart
                </button>
            </div>
            
            <div className="mt-8">
                <AccordionItem title="Details" defaultOpen={true}>
                    <ul className="list-disc pl-5 space-y-1">
                        {product.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
                </AccordionItem>
                <AccordionItem title="Materials & Care">
                     <p><strong>Materials:</strong> {product.materials}</p>
                     <p><strong>Care:</strong> {product.careInstructions}</p>
                </AccordionItem>
                 <AccordionItem title="Dimensions">
                    <p>{product.dimensions}</p>
                </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {isLoadingComplementary && (
        <div className="text-center py-10 border-t border-slate-200">
            <p className="text-slate-500">Our AI stylist is finding recommendations...</p>
        </div>
      )}
      {!isLoadingComplementary && complementaryProducts.length > 0 && (
          <div className="border-t border-slate-200">
              <HorizontalProductSection
                id="complete-the-look"
                title="Complete the Look"
                description="Our AI stylist recommends these items to pair with your selection."
                products={complementaryProducts}
                onAddToCart={onAddToCart}
                onProductSelect={onProductSelect}
                isAdmin={false}
                onEditProduct={() => {}}
                onContentChange={() => {}}
                currency={currency}
            />
          </div>
      )}

    </div>
  );
};

export default ProductPage;
