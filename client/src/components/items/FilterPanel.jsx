import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../../utils/constants';

export const FilterPanel = ({
  filters,
  onChange,
  onReset,
  statuses = []
}) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters & Categories</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category
          </label>
          <select
            value={filters.category || 'ALL'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Campus Location
          </label>
          <select
            value={filters.location || 'ALL'}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Campus Zones</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Color
          </label>
          <input
            type="text"
            placeholder="e.g. Black, Silver, Brown"
            value={filters.color || ''}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Item Status
          </label>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {statuses.length > 0
              ? statuses.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))
              : (
                <>
                  <option value="ACTIVE">Active</option>
                  <option value="POTENTIAL_MATCH">Potential Match</option>
                  <option value="CLAIM_REQUESTED">Claim Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="HANDOVER_SCHEDULED">Handover Scheduled</option>
                  <option value="RETURNED">Returned</option>
                  <option value="DISPUTED">Disputed</option>
                </>
              )}
          </select>
        </div>
      </div>
    </div>
  );
};
