
import React from 'react';
import Editable from './Editable';

interface HeroProps {
  content: {
    title: string;
    subtitle: string;
    cta: string;
  };
  isAdmin: boolean;
  onContentChange: (field: string, value: string) => void;
  onNavigate: (sectionId: string) => void;
}

const Hero: React.FC<HeroProps> = ({ content, isAdmin, onContentChange, onNavigate }) => {
  return (
    <section className="relative h-[60vh] min-h-[400px] max-h-[600px] flex items-center justify-center text-center text-white bg-slate-800">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="A stylish person shopping"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" aria-hidden="true"></div>
      </div>
      <div className="relative z-10 p-6">
        <Editable
          as="h1"
          isAdmin={isAdmin}
          value={content.title}
          onChange={(v) => onContentChange('title', v)}
          className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight"
        />
        <Editable
          as="p"
          isAdmin={isAdmin}
          value={content.subtitle}
          onChange={(v) => onContentChange('subtitle', v)}
          className="mt-4 max-w-xl mx-auto text-lg md:text-xl text-slate-200"
        />
        <div className="mt-8">
           <a
            href="#h-prod-1"
            onClick={(e) => { e.preventDefault(); onNavigate('#h-prod-1'); }}
            className="inline-block bg-white text-slate-900 font-bold py-3 px-8 rounded-md text-base sm:text-lg hover:bg-slate-200 transition-colors duration-300 relative group"
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

export default Hero;
