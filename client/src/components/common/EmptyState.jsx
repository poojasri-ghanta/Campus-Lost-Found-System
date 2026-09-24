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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-soft max-w-lg mx-auto my-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>
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
