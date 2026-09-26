import React from 'react';
import { PackageSearch } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'No matching records found. Try adjusting your filters or search terms.',
  icon: Icon = PackageSearch,
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-white rounded-3xl border border-biscuit-200 p-12 text-center shadow-soft max-w-lg mx-auto my-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-terracotta-50 border border-terracotta-200 flex items-center justify-center text-terracotta-600 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-cocoa-950 font-heading">{title}</h3>
      <p className="mt-2 text-xs text-cocoa-600 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

