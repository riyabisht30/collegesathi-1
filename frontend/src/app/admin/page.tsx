'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Pagination from '@/components/Pagination';
import AdminEditModal from '@/components/AdminEditModal';
import toast from 'react-hot-toast';

interface AdminStats {
  total_colleges: number;
  total_users: number;
  total_courses: number;
  total_exams: number;
  open_colleges: number;
  closing_soon: number;
  by_type: Record<string, number>;
  by_state_top10: Record<string, number>;
  by_status: Record<string, number>;
}

interface AdminCollege {
  id: number;
  name: string;
  state: string;
  city: string;
  college_type: string;
  nirf_ranking: number | null;
  naac_grade: string | null;
  admission_status: string;
  application_url: string | null;
  fee_min: number | null;
  fee_max: number | null;
  total_seats: number | null;
  courses_count: number;
  exams: string[];
  has_edits: boolean;
}

interface AdminUser {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string | null;
  wishlist_count: number;
}

type Tab = 'overview' | 'colleges' | 'users';
type AuthStep = 'login' | 'otp' | 'authenticated';

export default function AdminPage() {
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [colleges, setColleges] = useState<AdminCollege[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [collegePage, setCollegePage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [collegeTotalPages, setCollegeTotalPages] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingCollegeId, setEditingCollegeId] = useState<number | null>(null);

  // Check if already authenticated
  useEffect(() => {
    const token = sessionStorage.getItem('collegesathi_admin_token');
    if (token) {
      setAuthStep('authenticated');
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (authStep === 'authenticated') {
      setLoading(true);
      api.get('/admin/stats').then((res) => {
        setStats(res.data);
        setLoading(false);
      });
    }
  }, [authStep]);

  useEffect(() => {
    if (authStep === 'authenticated' && tab === 'colleges') {
      api.get('/admin/colleges', { params: { page: collegePage, per_page: 30 } }).then((res) => {
        setColleges(res.data.colleges);
        setCollegeTotalPages(res.data.total_pages);
      });
    }
  }, [authStep, tab, collegePage]);

  useEffect(() => {
    if (authStep === 'authenticated' && tab === 'users') {
      api.get('/admin/users', { params: { page: userPage, per_page: 30 } }).then((res) => {
        setUsers(res.data.users);
        setUserTotalPages(res.data.total_pages);
      });
    }
  }, [authStep, tab, userPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data } = await api.post('/admin/login', {
        email: email.trim(),
        password,
      });
      setOtpHint(data.otp_hint || '');
      setAuthStep('otp');
      toast.success(data.otp_hint ? 'Use the fallback OTP shown below' : 'OTP sent to your email!');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const message = detail
        || (err.code === 'ECONNABORTED' ? 'Server is waking up — wait a moment and try again.' : null)
        || err.message
        || 'Login failed. Check email and password match Render env vars (ADMIN_EMAIL / ADMIN_PASSWORD).';
      setAuthError(message);
      toast.error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const { data } = await api.post('/admin/verify-otp', { email: email.trim(), otp });
      sessionStorage.setItem('collegesathi_admin_token', data.access_token);
      setAuthStep('authenticated');
      toast.success('Admin access granted!');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Invalid OTP';
      setAuthError(message);
      toast.error(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('collegesathi_admin_token');
    setAuthStep('login');
    setEmail('');
    setPassword('');
    setOtp('');
  };

  const handleDownload = (type: 'colleges' | 'users' | 'wishlists') => {
    window.open(`/api/admin/export/${type}`, '_blank');
  };

  // ===== AUTH GATE =====
  if (authStep === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Step 1 of 2 — enter credentials, then verify OTP from email.</p>
            </div>

            {authError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {authLoading ? 'Connecting to server…' : 'Login & Send OTP'}
              </button>
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                First request may take up to 60 seconds while the server wakes up.
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (authStep === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify OTP</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Step 2 of 2 — enter the 6-digit code sent to <strong>{email.trim()}</strong>.
              </p>
              {otpHint && (
                <p className="mt-3 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                  Your OTP: <span className="font-mono font-bold text-lg">{otpHint}</span>
                  <br/><span className="text-xs">(Email could not be sent — set SMTP_PASSWORD on Render)</span>
                </p>
              )}
            </div>

            {authError && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {authError}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={authLoading || otp.length !== 6}
                className="w-full btn-primary disabled:opacity-50"
              >
                {authLoading ? 'Verifying...' : 'Verify & Access'}
              </button>
              <button
                type="button"
                onClick={() => { setAuthStep('login'); setAuthError(''); setOtp(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ← Back to login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMIN DASHBOARD =====
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage data and export reports</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <button onClick={() => handleDownload('colleges')} className="btn-secondary text-sm py-2 px-4">
            📥 Colleges CSV
          </button>
          <button onClick={() => handleDownload('users')} className="btn-secondary text-sm py-2 px-4">
            📥 Users CSV
          </button>
          <button onClick={() => handleDownload('wishlists')} className="btn-secondary text-sm py-2 px-4">
            📥 Wishlists CSV
          </button>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium ml-4">
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-[#1a1d2e] rounded-xl p-1 w-fit">
        {(['overview', 'colleges', 'users'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Colleges" value={stats.total_colleges} icon="🏫" />
            <StatCard label="Total Users" value={stats.total_users} icon="👤" />
            <StatCard label="Courses" value={stats.total_courses} icon="📚" />
            <StatCard label="Exams" value={stats.total_exams} icon="📝" />
            <StatCard label="Open Now" value={stats.open_colleges} icon="✅" color="green" />
            <StatCard label="Closing Soon" value={stats.closing_soon} icon="⚡" color="orange" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">By College Type</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(count / stats.total_colleges) * 100}%` }} />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">By Admission Status</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{status}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top States</h3>
              <div className="space-y-3">
                {Object.entries(stats.by_state_top10).map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{state}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colleges Tab */}
      {tab === 'colleges' && (
        <div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-[#12141f]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">State</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Fee Range</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Seats</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Edited</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {colleges.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-[#12141f]">
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-500">{c.id}</td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.state}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.admission_status === 'Open' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          c.admission_status === 'Closing Soon' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {c.admission_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                        {c.fee_min ? `₹${(c.fee_min/1000).toFixed(0)}K` : '-'} - {c.fee_max ? `₹${(c.fee_max/100000).toFixed(1)}L` : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{c.total_seats || '-'}</td>
                      <td className="py-3 px-4">
                        {c.has_edits ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">✓ verified</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">needs review</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setEditingCollegeId(c.id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 font-medium transition-colors"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={collegePage} totalPages={collegeTotalPages} onPageChange={setCollegePage} />
        </div>
      )}

      {/* Edit Modal */}
      {editingCollegeId && (
        <AdminEditModal
          collegeId={editingCollegeId}
          onClose={() => setEditingCollegeId(null)}
          onSaved={() => {
            // Refresh the colleges list
            api.get('/admin/colleges', { params: { page: collegePage, per_page: 30 } }).then((res) => {
              setColleges(res.data.colleges);
              setCollegeTotalPages(res.data.total_pages);
            });
          }}
        />
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div>
          {users.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">👤</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No users yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Users will appear here when they sign up</p>
            </div>
          ) : (
            <>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-[#12141f]">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Wishlist</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#12141f]">
                          <td className="py-3 px-4 text-gray-500">{u.id}</td>
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{u.name || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.phone || '-'}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.wishlist_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination currentPage={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${
        color === 'green' ? 'text-emerald-600 dark:text-emerald-400' :
        color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
        'text-gray-900 dark:text-white'
      }`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
