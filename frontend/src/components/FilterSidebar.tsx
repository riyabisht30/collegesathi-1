'use client';

import { FilterOptions } from '@/types';
import { useState } from 'react';

interface FilterSidebarProps {
  filters: FilterOptions | null;
  activeFilters: Record<string, string[]>;
  feeRange: [number | null, number | null];
  onFilterChange: (key: string, values: string[]) => void;
  onFeeChange: (min: number | null, max: number | null) => void;
  onClear: () => void;
}

export default function FilterSidebar({
  filters,
  activeFilters,
  feeRange,
  onFilterChange,
  onFeeChange,
  onClear,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    states: true,
    course_levels: true,
    streams: true,
    college_types: true,
    exams: false,
    admission_status: true,
  });

  if (!filters) return <div className="animate-pulse bg-gray-100 rounded-2xl h-96" />;

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFilter = (key: string, value: string) => {
    const current = activeFilters[key] || [];
    if (current.includes(value)) {
      onFilterChange(key, current.filter((v) => v !== value));
    } else {
      onFilterChange(key, [...current, value]);
    }
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v.length > 0) || feeRange[0] || feeRange[1];

  const admissionStatuses = ['Open', 'Closing Soon', 'Upcoming', 'Counselling', 'Spot Round', 'Closed'];

  return (
    <div className="bg-white dark:bg-[#1a1d2e] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        {hasActiveFilters && (
          <button onClick={onClear} className="text-xs text-red-500 hover:text-red-600 font-medium">
            Clear All
          </button>
        )}
      </div>

      {/* Admission Status */}
      <FilterSection
        title="Admission Status"
        expanded={expandedSections.admission_status}
        onToggle={() => toggleSection('admission_status')}
      >
        <div className="flex flex-wrap gap-2">
          {admissionStatuses.map((status) => (
            <button
              key={status}
              onClick={() => toggleFilter('admission_status', status)}
              className={
                (activeFilters.admission_status || []).includes(status)
                  ? 'filter-chip-active text-xs'
                  : 'filter-chip text-xs'
              }
            >
              {status}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Course Level */}
      <FilterSection
        title="Course Level"
        expanded={expandedSections.course_levels}
        onToggle={() => toggleSection('course_levels')}
      >
        <div className="flex flex-wrap gap-2">
          {filters.course_levels.map((level) => (
            <button
              key={level}
              onClick={() => toggleFilter('course_levels', level)}
              className={
                (activeFilters.course_levels || []).includes(level)
                  ? 'filter-chip-active text-xs'
                  : 'filter-chip text-xs'
              }
            >
              {level}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Streams */}
      <FilterSection
        title="Stream"
        expanded={expandedSections.streams}
        onToggle={() => toggleSection('streams')}
      >
        <div className="flex flex-wrap gap-2">
          {filters.streams.map((stream) => (
            <button
              key={stream}
              onClick={() => toggleFilter('streams', stream)}
              className={
                (activeFilters.streams || []).includes(stream)
                  ? 'filter-chip-active text-xs'
                  : 'filter-chip text-xs'
              }
            >
              {stream}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* College Type */}
      <FilterSection
        title="College Type"
        expanded={expandedSections.college_types}
        onToggle={() => toggleSection('college_types')}
      >
        <div className="flex flex-wrap gap-2">
          {filters.college_types.map((type) => (
            <button
              key={type}
              onClick={() => toggleFilter('college_types', type)}
              className={
                (activeFilters.college_types || []).includes(type)
                  ? 'filter-chip-active text-xs'
                  : 'filter-chip text-xs'
              }
            >
              {type}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* State */}
      <FilterSection
        title="State"
        expanded={expandedSections.states}
        onToggle={() => toggleSection('states')}
      >
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filters.states.map((state) => (
            <label key={state} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1">
              <input
                type="checkbox"
                checked={(activeFilters.states || []).includes(state)}
                onChange={() => toggleFilter('states', state)}
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{state}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Entrance Exams */}
      <FilterSection
        title="Entrance Exams"
        expanded={expandedSections.exams}
        onToggle={() => toggleSection('exams')}
      >
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filters.exams.map((exam) => (
            <label key={exam.short_name} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded px-1">
              <input
                type="checkbox"
                checked={(activeFilters.exams || []).includes(exam.short_name)}
                onChange={() => toggleFilter('exams', exam.short_name)}
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{exam.short_name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fee Range */}
      <FilterSection
        title="Annual Fee Range"
        expanded={true}
        onToggle={() => {}}
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={feeRange[0] || ''}
            onChange={(e) => onFeeChange(e.target.value ? parseInt(e.target.value) : null, feeRange[1])}
            className="input-field text-sm py-2 px-3"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={feeRange[1] || ''}
            onChange={(e) => onFeeChange(feeRange[0], e.target.value ? parseInt(e.target.value) : null)}
            className="input-field text-sm py-2 px-3"
          />
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 py-3 last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="mt-3">{children}</div>}
    </div>
  );
}
