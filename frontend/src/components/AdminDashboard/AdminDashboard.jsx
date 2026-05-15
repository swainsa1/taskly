import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import TaskCard from '../TaskCard/TaskCard';
import AdminCreateTaskForm from './AdminCreateTaskForm';

const TABS = [
  { id: 'tasks', label: 'All Tasks' },
  { id: 'create', label: '+ Create Task' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [filter, setFilter] = useState('overdue');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.users(),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin', 'tasks', selectedUserId, filter],
    queryFn: () => adminApi.tasks(selectedUserId, filter),
    enabled: activeTab === 'tasks',
  });

  const complete = useMutation({
    mutationFn: adminApi.completeTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tasks'] }),
  });

  const reopen = useMutation({
    mutationFn: adminApi.reopenTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tasks'] }),
  });

  const remove = useMutation({
    mutationFn: adminApi.deleteTask,
    onSuccess: () => {
      setDeleteConfirm(null);
      qc.invalidateQueries({ queryKey: ['admin', 'tasks'] });
    },
  });

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'flex-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-primary-500 border-b-2 border-primary-500 bg-white'
                  : 'text-muted hover:text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create Task tab */}
        {activeTab === 'create' && (
          <div className="p-4">
            <AdminCreateTaskForm
              users={users}
              onCreated={() => setActiveTab('tasks')}
            />
          </div>
        )}

        {/* All Tasks tab */}
        {activeTab === 'tasks' && (
          <div>
            {/* Filters */}
            <div className="px-4 py-3 border-b border-border flex flex-wrap gap-3 items-center">
              <select
                className="input max-w-[180px]"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                aria-label="Filter by user"
              >
                <option value="all">All Users</option>
                {users.filter(u => u.role !== 'admin').map((u) => (
                  <option key={u.id} value={u.id}>{u.display_name}</option>
                ))}
              </select>

              <select
                className="input max-w-[150px]"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter by date"
              >
                <option value="overdue">Overdue</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Task list */}
            <div className="p-4 space-y-2">
              {isLoading && (
                <p className="text-center py-8 text-muted text-sm">Loading…</p>
              )}
              {!isLoading && tasks.length === 0 && (
                <p className="text-center py-8 text-muted text-sm">No tasks found.</p>
              )}
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <TaskCard
                      task={task}
                      onComplete={() => complete.mutate(task.id)}
                      onReopen={() => reopen.mutate(task.id)}
                      showOwner
                    />
                  </div>
                  {deleteConfirm === task.id ? (
                    <div className="flex gap-1 flex-shrink-0 pt-2">
                      <button
                        className="btn-danger text-xs px-2 py-1"
                        onClick={() => remove.mutate(task.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn-ghost text-xs px-2 py-1"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-danger flex-shrink-0 mt-1"
                      onClick={() => setDeleteConfirm(task.id)}
                      aria-label="Delete task"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
