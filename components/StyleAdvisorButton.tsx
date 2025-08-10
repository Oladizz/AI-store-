import React from 'react';
import { SparklesIcon } from './icons';

interface StyleAdvisorButtonProps {
  onClick: () => void;
}

const StyleAdvisorButton: React.FC<StyleAdvisorButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-300 ease-in-out hover:scale-110"
      aria-label="Open AI Assistant"
    >
      <SparklesIcon className="h-8 w-8" />
    </button>
  );
};

export default StyleAdvisorButton;
