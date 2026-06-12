'use client';

import { College } from '@/types';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useState } from 'react';

interface CollegeCardProps {
  college: College;
  onWishlistClick?: () => void;
}

function getStatusBadge(status: string) {
  const badges: Record<string, string> = {
    'Open': 'badge-open',
    'Closing Soon': 'badge-closing',
    'Upcoming': 'badge-upcoming',
    'Closed': 'badge-closed',
    'Counselling': 'badge-counselling',
    'Spot Round': 'badge-spot',
  };
  return badges[status] || 'badge-closed';
}

function formatFee(fee: number | null): string {
  if (!fee) return 'N/A';
  if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)}L`;
  if (fee >= 1000) return `₹${(fee / 1000).toFixed(0)}K`;
  return `₹${fee}`;
}

function daysUntil(date: string | null): string {
  if (!date) return '';
  const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Today!';
  if (diff === 1) return '1 day left';
  return `${diff} days left`;
}

export default function CollegeCard({ college }: CollegeCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const isWishlisted = wishlistIds.includes(college.id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      await api.post('/wishlist/toggle', { college_id: college.id });
      toggleWishlist(college.id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <Link href={`/colleges/${college.id}`}>
      <div className="card p-5 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate text-lg">
              {college.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              📍 {college.city}, {college.state}
            </p>
          </div>
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`ml-3 p-2 rounded-full transition-all ${
              isWishlisted 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
            }`}
          >
            <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Status & Type */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={getStatusBadge(college.admission_status)}>
            {college.admission_status}
          </span>
          <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {college.college_type}
          </span>
          {college.naac_grade && (
            <span className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              NAAC {college.naac_grade}
            </span>
          )}
          {college.nirf_ranking && (
            <span className="badge bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              NIRF #{college.nirf_ranking}
            </span>
          )}
        </div>

        {/* Courses */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {college.courses.slice(0, 4).map((course) => (
            <span key={course.id} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md">
              {course.short_name || course.name}
            </span>
          ))}
          {college.courses.length > 4 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500 rounded-md">
              +{college.courses.length - 4} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              💰 {formatFee(college.fee_min)} - {formatFee(college.fee_max)}/yr
            </span>
            {college.total_seats && (
              <span className="text-gray-500 dark:text-gray-500">
                🎓 {college.total_seats} seats
              </span>
            )}
          </div>
          
          {college.admission_status !== 'Closed' && college.application_end_date && (
            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
              ⏰ {daysUntil(college.application_end_date)}
            </span>
          )}
        </div>

        {/* Exams accepted */}
        {college.exams_accepted.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span>Accepts:</span>
            {college.exams_accepted.slice(0, 3).map((exam) => (
              <span key={exam.id} className="font-medium text-primary-600">
                {exam.short_name}
              </span>
            ))}
            {college.exams_accepted.length > 3 && (
              <span>+{college.exams_accepted.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
