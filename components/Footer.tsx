
import React from 'react';
import { TwitterIcon, InstagramIcon, FacebookIcon } from './components/icons';

interface FooterProps {
    onNavigateHome: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigateHome }) => {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        if (id.startsWith('#')) {
            e.preventDefault();
            const homePath = window.location.origin + '/';
            if (window.location.href !== homePath) {
                onNavigateHome();
            }
            // Allow time for the main page to render before scrolling
            setTimeout(() => {
                document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <footer className="bg-white border-t border-slate-200" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="space-y-4 col-span-2 md:col-span-1">
                        <button onClick={onNavigateHome} className="text-3xl font-serif font-bold text-slate-900 tracking-tight">OLADIZZ</button>
                        <p className="text-sm text-slate-500">Style, Unboxed. Discover our collection of hand-picked items.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-slate-500">
                                <span className="sr-only">Facebook</span>
                                <FacebookIcon className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-slate-500">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon className="h-6 w-6" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-slate-500">
                                <span className="sr-only">Twitter</span>
                                <TwitterIcon className="h-6 w-6" />
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#shop" onClick={(e) => handleNavClick(e, '#shop')} className="text-sm text-slate-500 hover:text-slate-900">All Products</a></li>
                            <li><a href="#shop" onClick={(e) => handleNavClick(e, '#shop')} className="text-sm text-slate-500 hover:text-slate-900">Electronics</a></li>
                            <li><a href="#shop" onClick={(e) => handleNavClick(e, '#shop')} className="text-sm text-slate-500 hover:text-slate-900">Apparel</a></li>
                            <li><a href="#shop" onClick={(e) => handleNavClick(e, '#shop')} className="text-sm text-slate-500 hover:text-slate-900">Home Goods</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Company</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="text-sm text-slate-500 hover:text-slate-900">About</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Careers</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Press</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Support</h3>
                        <ul className="mt-4 space-y-2">
                            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-sm text-slate-500 hover:text-slate-900">Contact Us</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">FAQ</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Shipping & Returns</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <p className="text-center text-sm text-slate-500">
                        © {new Date().getFullYear()} OLADIZZ. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
