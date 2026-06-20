import React, { useEffect, useState, useCallback } from 'react';
import { fetchTasks, updateTaskStatus, deleteTask } from '../services/api';
import { CheckCircle, Trash2, Clock, Search, ArrowRightCircle, AlertTriangle, ListTodo, Flame, Trophy } from 'lucide-react';

/* ── Skeleton loader for a single card ──────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="task-card p-5 space-y-3">
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-full" />
    <div className="skeleton h-3 w-2/3" />
    <div className="flex justify-between mt-4">
      <div className="skeleton h-5 w-20 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  </div>
);

/* ── Individual Task Card ────────────────────────────────────────────────────── */
const TaskCard = ({ task, onAction, animDelay = 0 }) => {
  const [confirming, setConfirming] = useState(false);

  const borderColors = {
    'Pending':     '#f59e0b',
    'In Progress': '#7c3aed',
    'Completed':   '#10b981',
  };

  const handleDelete = () => {
    if (confirming) {
      onAction('delete', task._id);
      setConfirming(false);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div
      className="task-card p-5 group animate-fade-up"
      style={{ borderLeft: `3px solid ${borderColors[task.status] || '#7c3aed'}`, animationDelay: `${animDelay}ms` }}
    >
      <h3 className="font-bold text-base line-clamp-1 mb-1.5" style={{ color: 'var(--color-text)' }}>
        {task.title}
      </h3>
      <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {task.description}
      </p>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        <span className="text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
          <Clock size={11} /> {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
          {task.status === 'Pending' && (
            <button
              onClick={() => onAction('updateStatus', task._id, 'In Progress')}
              className="p-1.5 rounded-lg transition-all hover:scale-110"
              style={{ color: '#7c3aed', background: 'rgba(124,58,237,0.1)' }}
              title="Move to In Progress"
            >
              <ArrowRightCircle size={16} />
            </button>
          )}
          {task.status === 'In Progress' && (
            <button
              onClick={() => onAction('updateStatus', task._id, 'Completed')}
              className="p-1.5 rounded-lg transition-all hover:scale-110"
              style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)' }}
              title="Mark Completed"
            >
              <CheckCircle size={16} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg transition-all hover:scale-110"
            style={{
              color: confirming ? '#ffffff' : '#ef4444',
              background: confirming ? '#ef4444' : 'rgba(239,68,68,0.1)',
            }}
            title={confirming ? 'Click again to confirm delete' : 'Delete'}
          >
            {confirming ? <AlertTriangle size={16} /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Stat Card ───────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, gradient, delay }) => (
  <div
    className="rounded-3xl p-6 text-white shadow-xl animate-fade-up relative overflow-hidden"
    style={{ background: gradient, animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-3 right-3 opacity-20">
      <Icon size={56} strokeWidth={1} />
    </div>
    <div className="relative">
      <Icon size={22} className="mb-3 opacity-90" />
      <p className="text-4xl font-black tracking-tight">{value}</p>
      <p className="text-sm font-semibold mt-1 opacity-80">{label}</p>
    </div>
  </div>
);

/* ── Kanban Column Header ─────────────────────────────────────────────────────── */
const ColumnHeader = ({ color, label, count }) => (
  <div className="flex items-center gap-2 mb-4 px-1">
    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    <h2 className="font-extrabold text-sm tracking-wide uppercase" style={{ color: 'var(--color-text)' }}>
      {label}
    </h2>
    <span
      className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: `${color}22`, color: color, border: `1px solid ${color}44` }}
    >
      {count}
    </span>
  </div>
);

/* ── Empty Column Placeholder ─────────────────────────────────────────────────── */
const EmptyCol = ({ message }) => (
  <div
    className="text-center p-8 text-sm rounded-2xl"
    style={{
      color: 'var(--color-text-muted)',
      border: '2px dashed var(--color-border)',
    }}
  >
    {message}
  </div>
);

/* ── Main Dashboard ───────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const [data, setData]     = useState({ tasks: [], stats: { total: 0, pending: 0, completed: 0 }, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort]     = useState('newest');
  const [page, setPage]     = useState(1);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTasks({ search, status: 'All', sort, page, limit: 9 });
      setData(res.data);
    } catch {
      // Silent fail — user sees empty state
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleAction = async (action, id, newStatus = '') => {
    if (action === 'updateStatus') await updateTaskStatus(id, newStatus);
    if (action === 'delete')       await deleteTask(id);
    loadTasks();
  };

  const pendingTasks    = data.tasks.filter(t => t.status === 'Pending');
  const inProgressTasks = data.tasks.filter(t => t.status === 'In Progress');
  const completedTasks  = data.tasks.filter(t => t.status === 'Completed');

  return (
    <div>
      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Total Tasks"
          value={data.stats.total}
          icon={ListTodo}
          gradient="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
          delay={0}
        />
        <StatCard
          label="Pending"
          value={data.stats.pending}
          icon={Flame}
          gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
          delay={100}
        />
        <StatCard
          label="Completed"
          value={data.stats.completed}
          icon={Trophy}
          gradient="linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
          delay={200}
        />
      </div>

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <div
        className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center mb-7 animate-fade-up"
        style={{ animationDelay: '250ms' }}
      >
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            id="search-tasks"
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="premium-input has-icon-left text-sm"
          />
        </div>
        <select
          id="sort-tasks"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="premium-input text-sm w-full md:w-44 cursor-pointer"
        >
          <option value="newest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* ── Kanban Board ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* To Do */}
        <div className="kanban-col animate-fade-up" style={{ animationDelay: '300ms' }}>
          <ColumnHeader color="#f59e0b" label="To Do" count={pendingTasks.length} />
          <div className="flex flex-col gap-3">
            {loading
              ? [0, 1, 2].map(i => <SkeletonCard key={i} />)
              : pendingTasks.length
                ? pendingTasks.map((t, i) => <TaskCard key={t._id} task={t} onAction={handleAction} animDelay={i * 60} />)
                : <EmptyCol message="No pending tasks 🎉" />
            }
          </div>
        </div>

        {/* In Progress */}
        <div className="kanban-col animate-fade-up" style={{ animationDelay: '380ms' }}>
          <ColumnHeader color="#7c3aed" label="In Progress" count={inProgressTasks.length} />
          <div className="flex flex-col gap-3">
            {loading
              ? [0, 1].map(i => <SkeletonCard key={i} />)
              : inProgressTasks.length
                ? inProgressTasks.map((t, i) => <TaskCard key={t._id} task={t} onAction={handleAction} animDelay={i * 60} />)
                : <EmptyCol message="Move tasks here to start" />
            }
          </div>
        </div>

        {/* Completed */}
        <div className="kanban-col animate-fade-up" style={{ animationDelay: '460ms' }}>
          <ColumnHeader color="#10b981" label="Done" count={completedTasks.length} />
          <div className="flex flex-col gap-3">
            {loading
              ? [0, 1].map(i => <SkeletonCard key={i} />)
              : completedTasks.length
                ? completedTasks.map((t, i) => <TaskCard key={t._id} task={t} onAction={handleAction} animDelay={i * 60} />)
                : <EmptyCol message="Finish tasks to see them here" />
            }
          </div>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4 animate-fade-up">
          <button
            id="btn-prev-page"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            ← Prev
          </button>
          <span className="text-sm font-bold px-4 py-2 rounded-xl" style={{ background: 'var(--color-surface-2)', color: 'var(--color-primary)' }}>
            {page} / {data.totalPages}
          </span>
          <button
            id="btn-next-page"
            disabled={page === data.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-6 py-2.5 text-sm font-semibold rounded-xl transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;