'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { CollegeDetail } from '@/types';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import toast from 'react-hot-toast';

function formatFee(fee: number | null): string {
  if (!fee) return 'N/A';
  if (fee >= 100000) return `₹${(fee / 100000).toFixed(1)} Lakhs`;
  if (fee >= 1000) return `₹${(fee / 1000).toFixed(0)}K`;
  return `₹${fee}`;
}

function formatDate(date: string | null): string {
  if (!date) return 'TBA';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function CollegeDetailPage() {
  const params = useParams();
  const [college, setCollege] = useState<CollegeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const { wishlistIds, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await api.get(`/colleges/${params.id}`);
        setCollege(data);
      } catch {
        toast.error('Failed to load college details');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-40 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">College not found</h2>
        <Link href="/colleges" className="text-primary-600 mt-4 inline-block">← Back to colleges</Link>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(college.id);

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist');
      return;
    }
    try {
      await api.post('/wishlist/toggle', { college_id: college.id });
      toggleWishlist(college.id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const statusColors: Record<string, string> = {
    'Open': 'bg-green-100 text-green-700 border-green-200',
    'Closing Soon': 'bg-orange-100 text-orange-700 border-orange-200',
    'Upcoming': 'bg-blue-100 text-blue-700 border-blue-200',
    'Closed': 'bg-gray-100 text-gray-500 border-gray-200',
    'Counselling': 'bg-purple-100 text-purple-700 border-purple-200',
    'Spot Round': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/colleges" className="hover:text-primary-600">Colleges</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-200">{college.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{college.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">📍 {college.address || `${college.city}, ${college.state}`}</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[college.admission_status] || ''}`}>
              {college.admission_status}
            </span>
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{college.college_type}</span>
            {college.naac_grade && <span className="badge bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">NAAC {college.naac_grade}</span>}
            {college.nirf_ranking && <span className="badge bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">NIRF #{college.nirf_ranking}</span>}
            {college.established_year && <span className="badge bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">Est. {college.established_year}</span>}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleWishlist} className={`btn-secondary flex items-center gap-2 ${isWishlisted ? 'border-red-200 text-red-500' : ''}`}>
            <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isWishlisted ? 'Wishlisted' : 'Wishlist'}
          </button>
          {college.admission_status !== 'Closed' && (
            <a href={college.application_url || college.website || '#'} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Apply Now →
            </a>
          )}
        </div>
      </div>

      {/* Key Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Annual Fee</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatFee(college.fee_min)} - {formatFee(college.fee_max)}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Seats</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{college.total_seats || 'N/A'}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Application Opens</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(college.application_start_date)}</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">Deadline</div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatDate(college.application_end_date)}</div>
        </div>
      </div>

      {/* Description */}
      {college.description && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{college.description}</p>
          {college.website && (
            <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm mt-3 inline-block hover:underline">
              Visit Official Website →
            </a>
          )}
        </div>
      )}

      {/* Courses Offered */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Courses Offered</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {college.courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#12141f] rounded-xl">
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">{course.name}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{course.duration_years} yrs</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                course.level === 'UG' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                course.level === 'PG' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              }`}>
                {course.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Entrance Exams Accepted */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Entrance Exams Accepted</h2>
        <div className="flex flex-wrap gap-3">
          {college.exams_accepted.map((exam) => (
            <div key={exam.id} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl">
              <span className="font-medium text-primary-700 dark:text-primary-300">{exam.short_name}</span>
              <span className="text-xs text-primary-500 dark:text-primary-400 block">{exam.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admission Rounds */}
      {college.admission_rounds.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admission Rounds</h2>
          <div className="space-y-3">
            {college.admission_rounds.map((round) => (
              <div key={round.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#12141f] rounded-xl">
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{round.round_name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block">
                    {formatDate(round.start_date)} - {formatDate(round.end_date)}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  round.status === 'Open' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  round.status === 'Upcoming' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {round.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cutoffs */}
      {college.cutoffs.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Previous Year Cutoffs (2025)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-3 text-gray-500 dark:text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 px-3 text-gray-500 dark:text-gray-400 font-medium">Round</th>
                  <th className="text-left py-3 px-3 text-gray-500 dark:text-gray-400 font-medium">Score/Percentile</th>
                  <th className="text-left py-3 px-3 text-gray-500 dark:text-gray-400 font-medium">Rank</th>
                </tr>
              </thead>
              <tbody>
                {college.cutoffs.slice(0, 10).map((cutoff) => (
                  <tr key={cutoff.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">{cutoff.category}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">Round {cutoff.round_number}</td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                      {cutoff.cutoff_percentile ? `${cutoff.cutoff_percentile}%ile` : 
                       cutoff.cutoff_score ? cutoff.cutoff_score : 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{cutoff.cutoff_rank || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Notification - only shown for Open/Closed/Closing Soon colleges with a valid URL */}
      {college.notification_pdf_url && 
       ['Open', 'Closed', 'Closing Soon', 'Counselling', 'Spot Round'].includes(college.admission_status) && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Official Notification</h2>
          <a
            href={college.notification_pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            📄 Download Official Notification (PDF) →
          </a>
        </div>
      )}
    </div>
  );
}
