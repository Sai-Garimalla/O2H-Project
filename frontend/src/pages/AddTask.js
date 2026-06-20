import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../services/api';
import { sanitizeFormData } from '../utils/sanitize';
import { FileText, AlignLeft, Tag, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'Pending',     label: 'Pending',     emoji: '🟡', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  { value: 'In Progress', label: 'In Progress',  emoji: '🟣', color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
];

const AddTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData]   = useState({ title: '', description: '', status: 'Pending' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [saved, setSaved]         = useState(false);

  const descLen = formData.description.length;
  const descValid = descLen >= 20;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!formData.title.trim()) {
      return setError('Task title is required.');
    }
    if (!descValid) {
      return setError(`Description must be at least 20 characters (currently ${descLen}).`);
    }

    setLoading(true);
    try {
      const clean = sanitizeFormData(formData);
      await createTask(clean);
      setSaved(true);
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-up">
        <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl" style={{ background: 'linear-gradient(135deg,#10b981,#06b6d4)' }}>
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Task Created!</p>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Redirecting to dashboard…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-semibold mb-6 transition-all hover:gap-3"
        style={{ color: 'var(--color-primary)' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Card */}
      <div className="glass-card rounded-3xl overflow-hidden animate-fade-up">
        {/* Gradient bar */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #7c3aed, #e11d78, #f59e0b)' }} />

        <div className="p-8">
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--color-text)' }}>Create New Task</h1>
          <p className="text-sm mb-7" style={{ color: 'var(--color-text-muted)' }}>Fill in the details below to add a task to your board.</p>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2.5 p-4 rounded-2xl mb-5 text-sm animate-fade-up"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                <FileText size={14} style={{ color: 'var(--color-primary)' }} /> Task Title *
              </label>
              <input
                id="input-task-title"
                type="text"
                placeholder="e.g. Build the login page"
                value={formData.title}
                maxLength={200}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="premium-input"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                <AlignLeft size={14} style={{ color: 'var(--color-primary)' }} /> Description *
              </label>
              <textarea
                id="input-task-description"
                rows={5}
                placeholder="Describe the task in detail (min. 20 characters)…"
                value={formData.description}
                maxLength={2000}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="premium-input resize-none"
                required
              />
              {/* Character counter */}
              <div className="flex items-center justify-between mt-1.5 text-xs px-1">
                <span style={{ color: descValid ? '#10b981' : 'var(--color-text-muted)' }}>
                  {descValid ? '✓ Good length' : `${20 - descLen} more character${20 - descLen !== 1 ? 's' : ''} needed`}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{descLen}/2000</span>
              </div>
            </div>

            {/* Status pills */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                <Tag size={14} style={{ color: 'var(--color-primary)' }} /> Initial Status
              </label>
              <div className="flex gap-3 flex-wrap">
                {STATUS_OPTIONS.map(opt => {
                  const active = formData.status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      id={`status-pill-${opt.value.replace(' ', '-').toLowerCase()}`}
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
                      style={{
                        background: active ? opt.bg : 'var(--color-surface-2)',
                        color:      active ? opt.color : 'var(--color-text-muted)',
                        border:     `2px solid ${active ? opt.color : 'var(--color-border)'}`,
                        boxShadow:  active ? `0 4px 16px ${opt.color}33` : 'none',
                      }}
                    >
                      <span>{opt.emoji}</span> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                id="btn-save-task"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
                  : '🚀 Save Task'
                }
              </button>
              <button
                id="btn-cancel-task"
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;