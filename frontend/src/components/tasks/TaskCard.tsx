'use client';

import { useState } from 'react';
import { Task } from '@/types';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, current: Task['status']) => Promise<void>;
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(task.id, task.status);
    } finally {
      setToggling(false);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    const d = new Date(iso);
    const now = new Date();
    const isOverdue = task.status === 'pending' && d < now;
    return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), isOverdue };
  };

  const due = formatDate(task.dueDate);
  const isCompleted = task.status === 'completed';

  return (
    <div className={`${styles.card} ${isCompleted ? styles.completed : ''}`}>
      <div className={styles.left}>
        <button
          className={`${styles.checkbox} ${isCompleted ? styles.checked : ''}`}
          onClick={handleToggle}
          disabled={toggling}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
          title={isCompleted ? 'Mark pending' : 'Mark completed'}
        >
          {isCompleted && (
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4L4 7L10 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{task.title}</span>
          <span className={`badge ${isCompleted ? 'badge-completed' : 'badge-pending'}`}>
            {isCompleted ? '✓ Done' : '· Pending'}
          </span>
        </div>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        <div className={styles.meta}>
          {due && (
            <span className={`${styles.due} ${due.isOverdue ? styles.overdue : ''}`}>
              {due.isOverdue ? '⚠ Overdue · ' : '📅 '}
              {due.text}
            </span>
          )}
          <span className={styles.created}>
            Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          Edit
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete task"
        >
          {deleting ? '…' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
