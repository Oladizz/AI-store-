
import React, { useState } from 'react';
import { ShoppingBagIcon, UserCircleIcon, ArrowLeftOnRectangleIcon, SearchIcon } from './icons';
import { User, AuthModalView } from '../types';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  onNavigate: (path: string, sectionId?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onAuthClick: (view: AuthModalView) => void;
  onSearchClick: () => void;
}

const UserMenu: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(p => !p)}
                className="flex items-center space-x-2 p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Open user menu"
            >
                <UserCircleIcon className="h-6 w-6" />
                <span className="hidden sm:inline text-sm font-semibold">{user.name}</span>
            </button>
            {isOpen && (
                <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <a href="#" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100" role="menuitem">My Account</a>
                    <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        role="menuitem"
                    >
                       <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                       <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}


const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, onNavigate, currentUser, onLogout, onAuthClick, onSearchClick }) => {
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onNavigate('/', id);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button onClick={() => onNavigate('/')} className="text-3xl font-serif font-bold text-slate-900 tracking-tight">OLADIZZ</button>
            <nav className="hidden md:flex space-x-6">
              <a href="#h-prod-1" onClick={(e) => handleNavClick(e, '#h-prod-1')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Shop</a>
              <a href="#about" onClick={(e) => handleNavClick(e, '#about')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">About</a>
              <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Contact</a>
            </nav>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <button
                onClick={onSearchClick}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Search products"
              >
                <SearchIcon className="h-6 w-6" />
            </button>
            
            {currentUser ? (
                <UserMenu user={currentUser} onLogout={onLogout} />
            ) : (
                <div className="hidden sm:flex items-center space-x-2">
                    <button onClick={() => onAuthClick('login')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Login</button>
                    <span className="text-slate-300">/</span>
                    <button onClick={() => onAuthClick('signup')} className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Sign Up</button>
                </div>
            )}
             
            <button
                onClick={onCartClick}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Open shopping cart"
            >
                <ShoppingBagIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                    {cartItemCount}
                    </span>
                )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
