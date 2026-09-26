import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 mt-6 bg-white rounded-2xl border border-biscuit-200 shadow-soft">
      <div className="text-xs text-cocoa-600">
        Showing page <span className="font-bold text-cocoa-900">{currentPage}</span> of{' '}
        <span className="font-bold text-cocoa-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-biscuit-300 text-cocoa-700 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((page, idx, arr) => {
            const prev = arr[idx - 1];
            return (
              <React.Fragment key={page}>
                {prev && page - prev > 1 && (
                  <span className="px-2 text-xs text-cocoa-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`min-w-[32px] h-8 text-xs font-bold rounded-xl transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-terracotta-600 text-white shadow-warm'
                      : 'border border-biscuit-300 text-cocoa-700 hover:bg-cream-100'
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-biscuit-300 text-cocoa-700 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

