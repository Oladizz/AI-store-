
import React from 'react';
import { TwitterIcon, InstagramIcon, FacebookIcon } from './components/icons';

interface FooterProps {
    onNavigate: (path: string, sectionId?: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        onNavigate('/', sectionId);
    };

    return (
        <footer className="bg-white border-t border-slate-200" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">Footer</h2>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <button onClick={() => onNavigate('/')} className="text-3xl font-serif font-bold text-slate-900 tracking-tight">OLADIZZ</button>
                        <p className="text-sm text-slate-500">Style, Unboxed. Discover our collection of hand-picked items.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-slate-500"><span className="sr-only">Facebook</span><FacebookIcon className="h-6 w-6" /></a>
                            <a href="#" className="text-slate-400 hover:text-slate-500"><span className="sr-only">Instagram</span><InstagramIcon className="h-6 w-6" /></a>
                            <a href="#" className="text-slate-400 hover:text-slate-500"><span className="sr-only">Twitter</span><TwitterIcon className="h-6 w-6" /></a>
                        </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><a href="#h-prod-1" onClick={(e) => handleNavClick(e, '#h-prod-1')} className="text-sm text-slate-500 hover:text-slate-900">Featured Products</a></li>
                                    <li><a href="#v-prod-1" onClick={(e) => handleNavClick(e, '#v-prod-1')} className="text-sm text-slate-500 hover:text-slate-900">Modern Essentials</a></li>
                                    <li><a href="#h-prod-2" onClick={(e) => handleNavClick(e, '#h-prod-2')} className="text-sm text-slate-500 hover:text-slate-900">Trending Now</a></li>
                                    <li><a href="#v-prod-2" onClick={(e) => handleNavClick(e, '#v-prod-2')} className="text-sm text-slate-500 hover:text-slate-900">New Arrivals</a></li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-slate-900">Company</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="text-sm text-slate-500 hover:text-slate-900">About</a></li>
                                    <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Careers</a></li>
                                    <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Press</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-1 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900">Support</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Account</a></li>
                                    <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-sm text-slate-500 hover:text-slate-900">Contact Us</a></li>
                                    <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">FAQ</a></li>
                                    <li><a href="#" className="text-sm text-slate-500 hover:text-slate-900">Shipping & Returns</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900">Stay in the know</h3>
                            <p className="mt-1 text-sm text-slate-500">Sign up for our newsletter to get the latest on sales, new releases and more.</p>
                        </div>
                        <div className="mt-4 sm:flex sm:max-w-md md:mt-0 md:ml-4">
                            <form onSubmit={(e) => e.preventDefault()} className="sm:flex sm:max-w-md w-full">
                                <label htmlFor="email-address" className="sr-only">Email address</label>
                                <input type="email" name="email-address" id="email-address" autoComplete="email" required className="w-full min-w-0 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 placeholder-slate-500 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Enter your email" />
                                <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                                    <button type="submit" className="flex w-full items-center justify-center rounded-md border border-transparent bg-slate-900 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Sign Up</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="mt-8 border-t border-slate-200 pt-8">
                    <p className="text-center text-sm text-slate-500">
                        © {new Date().getFullYear()} OLADIZZ. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
