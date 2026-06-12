'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { College, FilterOptions, PaginatedResponse } from '@/types';
import CollegeCard from '@/components/CollegeCard';
import FilterSidebar from '@/components/FilterSidebar';
import Pagination from '@/components/Pagination';

export default function CollegesPage() {
  const searchParams = useSearchParams();
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nirf_ranking');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    states: [],
    course_levels: [],
    streams: [],
    college_types: [],
    exams: [],
    admission_status: [],
  });
  const [feeRange, setFeeRange] = useState<[number | null, number | null]>([null, null]);

  // Load filter options
  useEffect(() => {
    api.get('/colleges/filters/options').then((res) => setFilterOptions(res.data));
  }, []);

  // Initialize from URL params
  useEffect(() => {
    const status = searchParams.get('admission_status');
    const levels = searchParams.get('course_levels');
    if (status) {
      setActiveFilters((prev) => ({ ...prev, admission_status: status.split(',') }));
    }
    if (levels) {
      setActiveFilters((prev) => ({ ...prev, course_levels: levels.split(',') }));
    }
  }, [searchParams]);

  // Fetch colleges
  const fetchColleges = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        per_page: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search) params.search = search;
      if (activeFilters.states.length) params.states = activeFilters.states.join(',');
      if (activeFilters.course_levels.length) params.course_levels = activeFilters.course_levels.join(',');
      if (activeFilters.streams.length) params.streams = activeFilters.streams.join(',');
      if (activeFilters.college_types.length) params.college_types = activeFilters.college_types.join(',');
      if (activeFilters.exams.length) params.exams = activeFilters.exams.join(',');
      if (activeFilters.admission_status.length) params.admission_status = activeFilters.admission_status.join(',');
      if (feeRange[0]) params.fee_min = feeRange[0];
      if (feeRange[1]) params.fee_max = feeRange[1];

      const { data } = await api.get<PaginatedResponse>('/colleges', { params });
      setColleges(data.colleges);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, sortOrder, activeFilters, feeRange]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleFilterChange = (key: string, values: string[]) => {
    setActiveFilters((prev) => ({ ...prev, [key]: values }));
    setPage(1);
  };

  const handleFeeChange = (min: number | null, max: number | null) => {
    setFeeRange([min, max]);
    setPage(1);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      states: [],
      course_levels: [],
      streams: [],
      college_types: [],
      exams: [],
      admission_status: [],
    });
    setFeeRange([null, null]);
    setSearch('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Colleges</h1>
        <p className="text-gray-500 mt-1">
          {total} colleges found · Showing page {page} of {totalPages}
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search colleges, cities, or states..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-12"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="nirf_ranking">NIRF Ranking</option>
            <option value="fee_min">Fee (Low to High)</option>
            <option value="name">Name (A-Z)</option>
            <option value="admission_status">Status</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="input-field w-auto px-3 text-sm"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden input-field w-auto px-4 text-sm font-medium"
          >
            Filters
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar - Desktop */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <FilterSidebar
            filters={filterOptions}
            activeFilters={activeFilters}
            feeRange={feeRange}
            onFilterChange={handleFilterChange}
            onFeeChange={handleFeeChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Mobile Filters */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} className="text-gray-500">✕</button>
              </div>
              <FilterSidebar
                filters={filterOptions}
                activeFilters={activeFilters}
                feeRange={feeRange}
                onFilterChange={handleFilterChange}
                onFeeChange={handleFeeChange}
                onClear={handleClearFilters}
              />
            </div>
          </div>
        )}

        {/* College Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                  <div className="flex gap-2 mb-3">
                    <div className="h-6 bg-gray-100 rounded-full w-16" />
                    <div className="h-6 bg-gray-100 rounded-full w-20" />
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No colleges found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
              <button onClick={handleClearFilters} className="btn-primary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
