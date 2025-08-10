
import React from 'react';
import { QuoteIcon } from './icons';
import { Testimonial } from '../types';
import Editable from './Editable';

interface TestimonialsProps {
    content: {
        title: string;
        description: string;
        items: Testimonial[];
    };
    isAdmin: boolean;
    onContentChange: (field: 'title' | 'description' | 'items', value: string | Testimonial[]) => void;
}

const Testimonials: React.FC<TestimonialsProps> = ({ content, isAdmin, onContentChange }) => {
    
    const handleTestimonialChange = (id: string, field: 'quote' | 'author' | 'location', value: string) => {
        const newItems = content.items.map(t => t.id === id ? { ...t, [field]: value } : t);
        onContentChange('items', newItems);
    };

    return (
        <section className="bg-slate-50 py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <Editable
                        as="h2"
                        isAdmin={isAdmin}
                        value={content.title}
                        onChange={(v) => onContentChange('title', v)}
                        className="text-3xl md:text-4xl font-serif font-bold text-slate-900"
                    />
                    <Editable
                        as="p"
                        isAdmin={isAdmin}
                        value={content.description}
                        onChange={(v) => onContentChange('description', v)}
                        className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto"
                    />
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {content.items.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white p-8 rounded-lg shadow-sm">
                            <QuoteIcon className="h-8 w-8 text-indigo-300" />
                            <Editable
                                as="blockquote"
                                isAdmin={isAdmin}
                                value={`“${testimonial.quote}”`}
                                onChange={(v) => handleTestimonialChange(testimonial.id, 'quote', v.replace(/“|”/g, ''))}
                                className="mt-4 text-slate-700 italic"
                            />
                            <footer className="mt-6">
                                <Editable
                                    as="p"
                                    isAdmin={isAdmin}
                                    value={testimonial.author}
                                    onChange={(v) => handleTestimonialChange(testimonial.id, 'author', v)}
                                    className="font-semibold text-slate-900"
                                />
                                <Editable
                                    as="p"
                                    isAdmin={isAdmin}
                                    value={testimonial.location}
                                    onChange={(v) => handleTestimonialChange(testimonial.id, 'location', v)}
                                    className="text-sm text-slate-500"
                                />
                            </footer>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
