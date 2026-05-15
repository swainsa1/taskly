import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import TaskCard from '../TaskCard/TaskCard';
import AddTaskForm from '../AddTaskForm/AddTaskForm';

export default function AdminDashboard() {
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [filter, setFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const qc = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.users(),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin', 'tasks', selectedUserId, filter],
    queryFn: () => adminApi.tasks(selectedUserId, filter),
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

  const create = useMutation({
    mutationFn: ({ description, due_date, tag }) =>
      adminApi.createTask(
        selectedUserId === 'all' ? users[0]?.id : Number(selectedUserId),
        description,
        due_date,
        tag,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tasks'] }),
  });

  const createOwnerId =
    selectedUserId === 'all' ? users[0]?.id : Number(selectedUserId);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select
          className="input max-w-[200px]"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          aria-label="Filter by user"
        >
          <option value="all">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.display_name}
            </option>
          ))}
        </select>

        <select
          className="input max-w-[160px]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter by date"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      {/* Add task for selected user */}
      {createOwnerId && (
        <AddTaskForm
          onSubmit={(description, due_date, tag) => create.mutate({ description, due_date, tag })}
          isLoading={create.isPending}
          error={create.error?.message}
        />
      )}

      {/* Task list */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border text-sm font-medium text-gray-700">
          {isLoading ? 'Loading…' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        </div>
        <div className="p-4 space-y-2">
          {tasks.length === 0 && !isLoading && (
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
              {/* Delete */}
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
    </div>
  );
}
