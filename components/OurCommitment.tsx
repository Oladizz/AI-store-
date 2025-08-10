
import React from 'react';
import Editable from './Editable';

interface CommitmentItem {
    id: string;
    text: string;
}

interface OurCommitmentProps {
    content: {
        title: string;
        description: string;
        items: CommitmentItem[];
    };
    isAdmin: boolean;
    onContentChange: (field: 'title' | 'description' | 'items', value: string | CommitmentItem[]) => void;
}

const OurCommitment: React.FC<OurCommitmentProps> = ({ content, isAdmin, onContentChange }) => {

    const handleItemChange = (id: string, newText: string) => {
        const newItems = content.items.map(item => item.id === id ? { ...item, text: newText } : item);
        onContentChange('items', newItems);
    };

    return (
        <section className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative h-96">
                        <img
                            src="https://images.unsplash.com/photo-1556742044-1a938de0ab8a?q=80&w=1974&auto=format&fit=crop"
                            alt="Artisans working on high-quality products"
                            className="rounded-lg shadow-xl object-cover w-full h-full"
                        />
                    </div>
                    <div>
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
                            className="mt-4 text-lg text-slate-600"
                        />
                        <ul className="mt-6 space-y-4 text-slate-600">
                            {content.items.map((item) => (
                                <li key={item.id} className="flex items-start">
                                    <span className="text-indigo-500 font-bold mr-3 mt-1">&#10003;</span>
                                    <Editable
                                        as="span"
                                        isAdmin={isAdmin}
                                        value={item.text}
                                        onChange={(v) => handleItemChange(item.id, v)}
                                        className="w-full"
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurCommitment;
