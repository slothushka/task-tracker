'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/tasks/TaskCard';
import TaskForm from '@/components/tasks/TaskForm';
import { Task, TaskFilters } from '@/types';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { tasks, isLoading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<TaskFilters>({ status: '' });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  // Load tasks when filters change
  useEffect(() => {
    if (user) fetchTasks(filters);
  }, [filters, user, fetchTasks]);

  const handleToggle = useCallback(
    async (id: string, current: Task['status']) => {
      await updateTask(id, { status: current === 'pending' ? 'completed' : 'pending' });
    },
    [updateTask]
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className="container">
          <div className={styles.headerInner}>
            <div className={styles.brand}>
              <span className={styles.brandIcon}>✓</span>
              <span className={styles.brandName}>TaskTracker</span>
            </div>
            <div className={styles.userArea}>
              <span className={styles.userName}>{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">
          {/* Stats row */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{tasks.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum} style={{ color: 'var(--yellow)' }}>{pendingCount}</span>
              <span className={styles.statLabel}>Pending</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum} style={{ color: 'var(--green)' }}>{completedCount}</span>
              <span className={styles.statLabel}>Done</span>
            </div>
            {tasks.length > 0 && (
              <div className={styles.stat}>
                <span className={styles.statNum} style={{ color: 'var(--accent)' }}>
                  {Math.round((completedCount / tasks.length) * 100)}%
                </span>
                <span className={styles.statLabel}>Complete</span>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              {/* Status filter */}
              <div className={styles.filterGroup}>
                {(['', 'pending', 'completed'] as const).map((s) => (
                  <button
                    key={s || 'all'}
                    className={`${styles.filterBtn} ${filters.status === s ? styles.filterActive : ''}`}
                    onClick={() => setFilters((f) => ({ ...f, status: s }))}
                  >
                    {s === '' ? 'All' : s === 'pending' ? '· Pending' : '✓ Done'}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                className={styles.sortSelect}
                value={filters.sort || 'createdAt_desc'}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
              >
                <option value="createdAt_desc">Newest first</option>
                <option value="createdAt_asc">Oldest first</option>
                <option value="dueDate_asc">Due date ↑</option>
                <option value="dueDate_desc">Due date ↓</option>
                <option value="title_asc">Title A→Z</option>
              </select>
            </div>

            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              + New Task
            </button>
          </div>

          {/* Error state */}
          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          {/* Task list */}
          {isLoading ? (
            <div className={styles.skeletonList}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📋</div>
              <h3 className={styles.emptyTitle}>
                {filters.status ? `No ${filters.status} tasks` : 'No tasks yet'}
              </h3>
              <p className={styles.emptyDesc}>
                {filters.status
                  ? 'Try switching the filter above.'
                  : 'Create your first task to get started.'}
              </p>
              {!filters.status && (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  + Create Task
                </button>
              )}
            </div>
          ) : (
            <div className={styles.taskList}>
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => setEditingTask(t)}
                  onDelete={deleteTask}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create modal */}
      {showForm && (
        <TaskForm
          onSubmit={createTask}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit modal */}
      {editingTask && (
        <TaskForm
          initialData={editingTask}
          onSubmit={(data) => updateTask(editingTask.id, data)}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
