'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminEditModalProps {
  collegeId: number;
  onClose: () => void;
  onSaved: () => void;
}

interface CollegeEditData {
  id: number;
  name: string;
  state: string;
  city: string;
  college_type: string;
  established_year: number | null;
  nirf_ranking: number | null;
  naac_grade: string | null;
  website: string | null;
  description: string | null;
  admission_status: string;
  application_start_date: string | null;
  application_end_date: string | null;
  application_url: string | null;
  notification_pdf_url: string | null;
  fee_min: number | null;
  fee_max: number | null;
  total_seats: number | null;
  admin_edited_fields: string[];
  courses: { id: number; name: string; level: string }[];
  exams: { id: number; short_name: string; name: string }[];
}

const FIELD_LABELS: Record<string, string> = {
  name: 'College Name',
  state: 'State',
  city: 'City',
  college_type: 'College Type',
  established_year: 'Established Year',
  nirf_ranking: 'NIRF Ranking',
  naac_grade: 'NAAC Grade',
  website: 'Website URL',
  description: 'Description',
  admission_status: 'Admission Status',
  application_start_date: 'Application Start Date',
  application_end_date: 'Application End Date',
  application_url: 'Apply Now URL',
  notification_pdf_url: 'Notification PDF URL',
  fee_min: 'Minimum Fee (₹/year)',
  fee_max: 'Maximum Fee (₹/year)',
  total_seats: 'Total Seats',
};

const STATUS_OPTIONS = ['Open', 'Closing Soon', 'Upcoming', 'Closed', 'Counselling', 'Spot Round'];

export default function AdminEditModal({ collegeId, onClose, onSaved }: AdminEditModalProps) {
  const [data, setData] = useState<CollegeEditData | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.get(`/admin/colleges/${collegeId}`).then((res) => {
      setData(res.data);
      setForm(res.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load college data');
      onClose();
    });
  }, [collegeId]);

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    setChangedFields((prev) => new Set([...prev, field]));
  };

  const handleSave = async () => {
    if (changedFields.size === 0) {
      toast('No changes to save');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      changedFields.forEach((field) => {
        payload[field] = form[field] || null;
      });

      await api.put(`/admin/colleges/${collegeId}`, payload);
      toast.success(`Saved ${changedFields.size} field(s) successfully!`);
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative card p-8 w-full max-w-3xl mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isEdited = (field: string) => data.admin_edited_fields.includes(field);
  const isChanged = (field: string) => changedFields.has(field);

  const fieldClass = (field: string) => {
    if (isChanged(field)) return 'ring-2 ring-amber-400 dark:ring-amber-500';
    if (isEdited(field)) return 'ring-2 ring-emerald-400 dark:ring-emerald-500';
    return '';
  };

  const labelExtra = (field: string) => {
    if (isChanged(field)) return <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">unsaved</span>;
    if (isEdited(field)) return <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">✓ admin edited</span>;
    return <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">auto-generated</span>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-[#1a1d2e] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit College</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">#{data.id} — {data.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl">✕</button>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex gap-4 text-xs shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-300 dark:ring-gray-600" />
            <span className="text-gray-500 dark:text-gray-400">Auto-generated (needs review)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-100 dark:bg-emerald-900 ring-2 ring-emerald-400" />
            <span className="text-gray-500 dark:text-gray-400">Admin verified</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-100 dark:bg-amber-900 ring-2 ring-amber-400" />
            <span className="text-gray-500 dark:text-gray-400">Unsaved change</span>
          </span>
        </div>

        {/* Scrollable Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Key URLs Section */}
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">⚠️ Critical Links (often need manual fix)</h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Apply Now URL {labelExtra('application_url')}
              </label>
              <input
                type="url"
                value={form.application_url || ''}
                onChange={(e) => handleChange('application_url', e.target.value)}
                className={`input-field mt-1 ${fieldClass('application_url')}`}
                placeholder="https://admissions.college.ac.in/apply"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Notification PDF URL {labelExtra('notification_pdf_url')}
              </label>
              <input
                type="url"
                value={form.notification_pdf_url || ''}
                onChange={(e) => handleChange('notification_pdf_url', e.target.value)}
                className={`input-field mt-1 ${fieldClass('notification_pdf_url')}`}
                placeholder="https://college.ac.in/admission-notice-2026.pdf"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Website {labelExtra('website')}
              </label>
              <input
                type="url"
                value={form.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                className={`input-field mt-1 ${fieldClass('website')}`}
                placeholder="https://www.college.ac.in"
              />
            </div>
          </div>

          {/* Admission Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Admission Status {labelExtra('admission_status')}
              </label>
              <select
                value={form.admission_status || ''}
                onChange={(e) => handleChange('admission_status', e.target.value)}
                className={`input-field mt-1 ${fieldClass('admission_status')}`}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                NIRF Ranking {labelExtra('nirf_ranking')}
              </label>
              <input
                type="number"
                value={form.nirf_ranking || ''}
                onChange={(e) => handleChange('nirf_ranking', parseInt(e.target.value) || null)}
                className={`input-field mt-1 ${fieldClass('nirf_ranking')}`}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Application Start {labelExtra('application_start_date')}
              </label>
              <input
                type="date"
                value={form.application_start_date?.split('T')[0] || ''}
                onChange={(e) => handleChange('application_start_date', e.target.value)}
                className={`input-field mt-1 ${fieldClass('application_start_date')}`}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Application Deadline {labelExtra('application_end_date')}
              </label>
              <input
                type="date"
                value={form.application_end_date?.split('T')[0] || ''}
                onChange={(e) => handleChange('application_end_date', e.target.value)}
                className={`input-field mt-1 ${fieldClass('application_end_date')}`}
              />
            </div>
          </div>

          {/* Fees & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Min Fee (₹/yr) {labelExtra('fee_min')}
              </label>
              <input
                type="number"
                value={form.fee_min || ''}
                onChange={(e) => handleChange('fee_min', parseInt(e.target.value) || null)}
                className={`input-field mt-1 ${fieldClass('fee_min')}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Max Fee (₹/yr) {labelExtra('fee_max')}
              </label>
              <input
                type="number"
                value={form.fee_max || ''}
                onChange={(e) => handleChange('fee_max', parseInt(e.target.value) || null)}
                className={`input-field mt-1 ${fieldClass('fee_max')}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Total Seats {labelExtra('total_seats')}
              </label>
              <input
                type="number"
                value={form.total_seats || ''}
                onChange={(e) => handleChange('total_seats', parseInt(e.target.value) || null)}
                className={`input-field mt-1 ${fieldClass('total_seats')}`}
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Name {labelExtra('name')}
              </label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`input-field mt-1 ${fieldClass('name')}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                College Type {labelExtra('college_type')}
              </label>
              <select
                value={form.college_type || ''}
                onChange={(e) => handleChange('college_type', e.target.value)}
                className={`input-field mt-1 ${fieldClass('college_type')}`}
              >
                <option value="Government">Government</option>
                <option value="Private">Private</option>
                <option value="Deemed">Deemed</option>
                <option value="Autonomous">Autonomous</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                State {labelExtra('state')}
              </label>
              <input
                type="text"
                value={form.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
                className={`input-field mt-1 ${fieldClass('state')}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                City {labelExtra('city')}
              </label>
              <input
                type="text"
                value={form.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                className={`input-field mt-1 ${fieldClass('city')}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                NAAC Grade {labelExtra('naac_grade')}
              </label>
              <input
                type="text"
                value={form.naac_grade || ''}
                onChange={(e) => handleChange('naac_grade', e.target.value)}
                className={`input-field mt-1 ${fieldClass('naac_grade')}`}
                placeholder="A++, A+, A, B++..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                Established Year {labelExtra('established_year')}
              </label>
              <input
                type="number"
                value={form.established_year || ''}
                onChange={(e) => handleChange('established_year', parseInt(e.target.value) || null)}
                className={`input-field mt-1 ${fieldClass('established_year')}`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Description {labelExtra('description')}
            </label>
            <textarea
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className={`input-field mt-1 ${fieldClass('description')}`}
            />
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <strong>Courses:</strong> {data.courses.map(c => c.name).join(', ') || 'None'}<br/>
            <strong>Exams:</strong> {data.exams.map(e => e.short_name).join(', ') || 'None'}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {changedFields.size > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">{changedFields.size} unsaved change(s)</span>
            ) : (
              <span>{data.admin_edited_fields.length} field(s) previously edited by admin</span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || changedFields.size === 0}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving...' : `Save ${changedFields.size} Change(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
