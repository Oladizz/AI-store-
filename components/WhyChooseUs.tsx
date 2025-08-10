
import React from 'react';
import { ShieldCheckIcon, TruckIcon, ChatBubbleLeftRightIcon } from './icons';
import { Feature } from '../types';
import Editable from './Editable';

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  ShieldCheckIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
};

interface WhyChooseUsProps {
    content: {
        title: string;
        description: string;
        features: Feature[];
    };
    isAdmin: boolean;
    onContentChange: (field: 'title' | 'description' | 'features', value: string | Feature[]) => void;
}

const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ content, isAdmin, onContentChange }) => {
    
    const handleFeatureChange = (id: string, field: 'name' | 'description', value: string) => {
        const newFeatures = content.features.map(f => f.id === id ? { ...f, [field]: value } : f);
        onContentChange('features', newFeatures);
    };

    return (
        <section className="bg-white py-16 sm:py-24">
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
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-8">
                    {content.features.map((feature) => {
                        const Icon = iconMap[feature.icon];
                        return (
                            <div key={feature.id} className="text-center">
                                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-white mx-auto">
                                    {Icon && <Icon className="h-6 w-6" aria-hidden="true" />}
                                </div>
                                <Editable
                                    as="h3"
                                    isAdmin={isAdmin}
                                    value={feature.name}
                                    onChange={(v) => handleFeatureChange(feature.id, 'name', v)}
                                    className="mt-6 text-lg font-bold text-slate-900"
                                />
                                <Editable
                                    as="p"
                                    isAdmin={isAdmin}
                                    value={feature.description}
                                    onChange={(v) => handleFeatureChange(feature.id, 'description', v)}
                                    className="mt-2 text-slate-600"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
