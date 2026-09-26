import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Lock, ShieldCheck } from 'lucide-react';
import { ItemCard } from '../components/items/ItemCard';
import { SearchBar } from '../components/items/SearchBar';
import { FilterPanel } from '../components/items/FilterPanel';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';

export const FoundItemsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'ALL',
    location: 'ALL',
    status: 'ALL',
    color: '',
    search: '',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFoundItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
      if (filters.location && filters.location !== 'ALL') params.append('location', filters.location);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.color) params.append('color', filters.color);
      params.append('page', filters.page);
      params.append('limit', 9);

      const res = await api.get(`/found-items?${params.toString()}`);
      if (res.data.success) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load found items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundItems();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      category: 'ALL',
      location: 'ALL',
      status: 'ALL',
      color: '',
      search: '',
      page: 1
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
              Found Items Registry
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-terracotta-100 text-terracotta-800 px-3 py-1 rounded-full border border-terracotta-200/80 font-display">
              <Lock className="w-3 h-3 text-terracotta-600" /> Progressive Security Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-cocoa-600">
            Browse discovered items across campus ({totalCount} total items). Private details are
            concealed until ownership verification.
          </p>
        </div>

        <Link to="/found-items/report">
          <Button variant="accent" size="md" className="shadow-warm">
            <PlusCircle className="w-4 h-4" />
            Report Found Item
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters.search}
        onSearch={(query) => setFilters((prev) => ({ ...prev, search: query, page: 1 }))}
        placeholder="Search found items by general title, category, location, color..."
      />

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onChange={(newFilters) => setFilters({ ...newFilters, page: 1 })}
        onReset={handleReset}
      />

      {/* Content Grid */}
      {loading ? (
        <LoadingSpinner label="Loading found item records..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No found items match your criteria"
          description="Try clearing search keywords or changing campus zones."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} type="found" />
            ))}
          </div>

          <Pagination
            currentPage={filters.page}
            totalPages={totalPages}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          />
        </>
      )}
    </div>
  );
};
