'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import api from '@/lib/api';
import { College } from '@/types';
import CollegeCard from '@/components/CollegeCard';
import Link from 'next/link';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { setWishlistIds } = useWishlistStore();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/wishlist');
        setColleges(data);
        setWishlistIds(data.map((c: College) => c.id));
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [isAuthenticated, setWishlistIds]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">❤️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Wishlist</h1>
        <p className="text-gray-500 mb-8">Sign in to save colleges and track their deadlines</p>
        <Link href="/" className="btn-primary">Go to Home</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">❤️ Your Wishlist</h1>
          <p className="text-gray-500 mt-1">{colleges.length} college{colleges.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {colleges.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No colleges saved yet</h3>
          <p className="text-gray-500 mb-6">Browse colleges and click the ❤️ to add them here</p>
          <Link href="/colleges" className="btn-primary">Browse Colleges</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colleges.map((college) => (
            <CollegeCard key={college.id} college={college} />
          ))}
        </div>
      )}
    </div>
  );
}
