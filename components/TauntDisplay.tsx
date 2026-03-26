
import React from 'react';

interface TauntDisplayProps {
  message: string;
}

export const TauntDisplay: React.FC<TauntDisplayProps> = ({ message }) => {
  return (
    <div className="z-10 min-h-[80px] flex items-center justify-center px-4 mb-8">
      <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-inner text-center animate-fade-in relative">
        {/* Quote icon decorations */}
        <i className="fas fa-quote-left absolute -top-3 -left-3 text-white/20 text-3xl"></i>
        <i className="fas fa-quote-right absolute -bottom-3 -right-3 text-white/20 text-3xl"></i>
        
        <p className="text-xl md:text-2xl font-semibold italic text-pink-200 drop-shadow-sm transition-all duration-500 ease-in-out">
          {message}
        </p>
      </div>
    </div>
  );
};
