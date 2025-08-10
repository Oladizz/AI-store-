
import React from 'react';
import Editable from './Editable';

interface ContactUsProps {
    content: {
        title: string;
        description: string;
        cta: string;
    };
    isAdmin: boolean;
    onContentChange: (field: 'title' | 'description' | 'cta', value: string) => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ content, isAdmin, onContentChange }) => {
  return (
    <section id="contact" className="bg-slate-50 py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <div className="mt-8">
          <a
            href="mailto:support@oladizz.com"
            className="inline-block bg-indigo-600 text-white font-bold py-3 px-8 rounded-md text-base sm:text-lg hover:bg-indigo-700 transition-colors duration-300"
          >
            <Editable
              as="span"
              isAdmin={isAdmin}
              value={content.cta}
              onChange={(v) => onContentChange('cta', v)}
              className="block"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
