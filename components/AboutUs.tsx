
import React from 'react';
import Editable from './Editable';

interface AboutUsProps {
    content: {
        title: string;
        p1: string;
        p2: string;
    };
    isAdmin: boolean;
    onContentChange: (field: string, value: string) => void;
}


const AboutUs: React.FC<AboutUsProps> = ({ content, isAdmin, onContentChange }) => {
  return (
    <section id="about" className="bg-slate-50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
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
                value={content.p1}
                onChange={(v) => onContentChange('p1', v)}
                className="mt-4 text-lg text-slate-600"
            />
            <Editable
                as="p"
                isAdmin={isAdmin}
                value={content.p2}
                onChange={(v) => onContentChange('p2', v)}
                className="mt-4 text-slate-600"
            />
          </div>
          <div className="order-1 md:order-2">
            <img 
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80" 
              alt="Stylish person representing the OLADIZZ brand"
              className="rounded-lg shadow-xl aspect-w-4 aspect-h-3 object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
