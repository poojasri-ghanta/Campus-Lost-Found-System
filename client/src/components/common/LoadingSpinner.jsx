import React from 'react';

export const LoadingSpinner = ({ label = 'Loading verified records...', fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-biscuit-200 border-t-terracotta-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-terracotta-600 rounded-full animate-ping" />
        </div>
      </div>
      {label && <p className="mt-4 text-xs font-bold text-cocoa-500 animate-pulse">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

