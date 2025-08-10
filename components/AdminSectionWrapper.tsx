
import React from 'react';
import { PageSection } from '../types';

interface AdminSectionWrapperProps {
  children: React.ReactNode;
  isAdmin: boolean;
  section: PageSection;
  onOrderChange: (id: string, order: number) => void;
}

const AdminSectionWrapper: React.FC<AdminSectionWrapperProps> = ({ children, isAdmin, section, onOrderChange }) => {
  if (!isAdmin) {
    return <>{children}</>;
  }

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOrder = parseInt(e.target.value, 10);
    if (!isNaN(newOrder)) {
      onOrderChange(section.id, newOrder);
    }
  };

  return (
    <div className="relative border-2 border-dashed border-transparent hover:border-indigo-400 p-1 group">
      <div className="absolute top-2 right-2 z-30 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <label htmlFor={`order-${section.id}`} className="text-xs font-bold text-slate-700 pl-2">Order:</label>
        <input
          type="number"
          id={`order-${section.id}`}
          value={section.order}
          onChange={handleOrderChange}
          className="w-12 h-8 text-center font-bold text-sm bg-slate-100 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>
      {children}
    </div>
  );
};

export default AdminSectionWrapper;
