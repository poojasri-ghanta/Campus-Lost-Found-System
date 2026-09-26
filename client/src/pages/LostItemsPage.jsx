import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search } from 'lucide-react';
import { ItemCard } from '../components/items/ItemCard';
import { SearchBar } from '../components/items/SearchBar';
import { FilterPanel } from '../components/items/FilterPanel';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import api from '../services/api';

export const LostItemsPage = () => {
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

  const fetchLostItems = async () => {
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

      const res = await api.get(`/lost-items?${params.toString()}`);
      if (res.data.success) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load lost items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostItems();
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
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display">
            Lost Items Registry
          </h1>
          <p className="text-xs sm:text-sm text-cocoa-600 mt-1">
            Browse reports submitted by campus students and faculty ({totalCount} total records)
          </p>
        </div>

        <Link to="/lost-items/report">
          <Button variant="primary" size="md" className="shadow-warm">
            <PlusCircle className="w-4 h-4" />
            Report Lost Item
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={filters.search}
        onSearch={(query) => setFilters((prev) => ({ ...prev, search: query, page: 1 }))}
        placeholder="Search lost items by brand, title, description, location..."
      />

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onChange={(newFilters) => setFilters({ ...newFilters, page: 1 })}
        onReset={handleReset}
      />

      {/* Content Grid */}
      {loading ? (
        <LoadingSpinner label="Loading lost reports..." />
      ) : items.length === 0 ? (
        <EmptyState
          title="No lost items match your criteria"
          description="Try broadening your category or location filters."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} type="lost" />
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
