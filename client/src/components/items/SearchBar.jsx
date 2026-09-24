import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search by keyword, item title, brand...' }) => {
  const [query, setQuery] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onChange) onChange('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 bg-white rounded-2xl border border-slate-200 text-sm placeholder-slate-400 shadow-soft focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};
