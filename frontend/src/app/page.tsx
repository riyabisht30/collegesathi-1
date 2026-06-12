'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { College } from '@/types';
import CollegeCard from '@/components/CollegeCard';

export default function HomePage() {
  const [openColleges, setOpenColleges] = useState<College[]>([]);
  const [closingSoon, setClosingSoon] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, open: 0, states: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const [openRes, closingRes] = await Promise.all([
          api.get('/colleges', { params: { admission_status: 'Open', per_page: 6, sort_by: 'nirf_ranking' } }),
          api.get('/colleges', { params: { admission_status: 'Closing Soon', per_page: 4, sort_by: 'application_end_date' } }),
        ]);
        setOpenColleges(openRes.data.colleges);
        setClosingSoon(closingRes.data.colleges);
        setStats({
          total: openRes.data.total + closingRes.data.total,
          open: openRes.data.total,
          states: 25,
        });
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full text-white/90 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {stats.open}+ colleges accepting applications now
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                College Match
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-blue-100 max-w-xl leading-relaxed">
              Track admissions, compare colleges, and never miss a deadline. 
              Built for first-generation students who deserve equal guidance.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/recommend" className="btn-primary text-center text-lg px-8 py-4 bg-white text-primary-700 hover:bg-gray-100 shadow-xl">
                🎯 Find My Best Colleges
              </Link>
              <Link href="/colleges" className="btn-secondary text-center text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10 hover:border-white/50 hover:text-white">
                Browse All Colleges →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Colleges', value: '500+', icon: '🏫' },
            { label: 'Open Now', value: `${stats.open}+`, icon: '✅' },
            { label: 'States Covered', value: '25', icon: '🗺️' },
            { label: 'Students Helped', value: '10K+', icon: '🎓' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing Soon - Urgency Section */}
      {closingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⚡ Closing Soon</h2>
              <p className="text-gray-500 mt-1">Don't miss these deadlines!</p>
            </div>
            <Link href="/colleges?admission_status=Closing+Soon" className="text-primary-600 font-medium hover:underline text-sm">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {closingSoon.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        </section>
      )}

      {/* Open Applications */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🟢 Currently Open</h2>
            <p className="text-gray-500 mt-1">Applications you can apply to right now</p>
          </div>
          <Link href="/colleges?admission_status=Open" className="text-primary-600 font-medium hover:underline text-sm">
            View all →
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-10 lg:p-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Not sure which college is right for you?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Answer a few questions about your preferences, exam scores, and budget. 
            We'll recommend the best 50-100 colleges for you.
          </p>
          <Link href="/recommend" className="inline-block bg-white text-primary-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
            🎯 Take the Quiz (2 min)
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">CollegeSathi</h4>
              <p className="text-sm text-gray-500">
                Equal guidance for every student, regardless of background.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Browse</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/colleges" className="hover:text-primary-600">All Colleges</Link></li>
                <li><Link href="/colleges?course_levels=UG" className="hover:text-primary-600">UG Courses</Link></li>
                <li><Link href="/colleges?course_levels=PG" className="hover:text-primary-600">PG Courses</Link></li>
                <li><Link href="/colleges?admission_status=Open" className="hover:text-primary-600">Open Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Tools</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/recommend" className="hover:text-primary-600">College Finder</Link></li>
                <li><Link href="/colleges" className="hover:text-primary-600">Compare Colleges</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary-600">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-600">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © 2026 CollegeSathi. Built with ❤️ for first-generation students.
          </div>
        </div>
      </footer>
    </div>
  );
}
