
import React, { useState } from 'react';
import { XMarkIcon } from './icons';
import { AuthModalView } from '../types';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    view: AuthModalView;
    setView: (view: AuthModalView) => void;
    onLogin: (email: string, password?: string) => Promise<boolean>;
    onSignup: (name: string, email: string, password?: string) => Promise<boolean>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, view, setView, onLogin, onSignup }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let success = false;
            if (view === 'login') {
                success = await onLogin(email, password);
                if (!success) setError('Invalid credentials. Please try again.');
            } else {
                success = await onSignup(name, email, password);
                if (!success) setError('An account with this email already exists.');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        // Reset state on close
        setError('');
        setName('');
        setEmail('');
        setPassword('');
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold font-serif text-slate-800">{view === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
                    <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {view === 'signup' && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    )}
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                     <div>
                        <label htmlFor="password" aria-label="Password (for demonstration purposes only)" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                            {isLoading ? 'Processing...' : (view === 'login' ? 'Login' : 'Create Account')}
                        </button>
                    </div>
                    <div className="text-center text-sm">
                        {view === 'login' ? (
                            <p>Don't have an account? <button type="button" onClick={() => setView('signup')} className="font-medium text-indigo-600 hover:text-indigo-500">Sign Up</button></p>
                        ) : (
                            <p>Already have an account? <button type="button" onClick={() => setView('login')} className="font-medium text-indigo-600 hover:text-indigo-500">Login</button></p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
