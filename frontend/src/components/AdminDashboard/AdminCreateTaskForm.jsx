import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

const TAGS = ['Others', 'School', 'Home', 'Sports', 'Art', 'Reading', 'Chores', 'Fun'];

const TAG_COLORS = {
  'Others':  { base: 'bg-gray-100 text-gray-600 border-gray-200',      active: 'bg-gray-500 text-white border-gray-500' },
  'School':  { base: 'bg-blue-50 text-blue-600 border-blue-200',       active: 'bg-blue-500 text-white border-blue-500' },
  'Home':    { base: 'bg-green-50 text-green-700 border-green-200',    active: 'bg-green-500 text-white border-green-500' },
  'Sports':  { base: 'bg-orange-50 text-orange-600 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
  'Art':     { base: 'bg-purple-50 text-purple-600 border-purple-200', active: 'bg-purple-500 text-white border-purple-500' },
  'Reading': { base: 'bg-yellow-50 text-yellow-700 border-yellow-200', active: 'bg-yellow-400 text-white border-yellow-400' },
  'Chores':  { base: 'bg-red-50 text-red-600 border-red-200',          active: 'bg-red-500 text-white border-red-500' },
  'Fun':     { base: 'bg-pink-50 text-pink-600 border-pink-200',       active: 'bg-pink-500 text-white border-pink-500' },
};

const TODAY = new Date().toISOString().slice(0, 10);

function generateDates(startDate, repeat) {
  if (!startDate) return [];
  const start = new Date(startDate + 'T00:00:00');
  if (repeat === 'week') {
    return Array.from({ length: 4 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 7);
      return d.toISOString().slice(0, 10);
    });
  }
  if (repeat === 'month') {
    const d2 = new Date(start);
    d2.setMonth(d2.getMonth() + 1);
    return [startDate, d2.toISOString().slice(0, 10)];
  }
  return [startDate];
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminCreateTaskForm({ users }) {
  const qc = useQueryClient();
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Others');
  const [startDate, setStartDate] = useState('');
  const [repeat, setRepeat] = useState('none');

  const dates = generateDates(startDate, repeat);
  const canSubmit = ownerId && description.trim() && startDate;

  const create = useMutation({
    mutationFn: () => adminApi.bulkCreateTask(Number(ownerId), description.trim(), tag, dates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tasks'] });
      setDescription('');
      setStartDate('');
      setRepeat('none');
      setTag('Others');
    },
  });

  return (
    <div className="card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Create Task for User</h3>

      {/* User selector */}
      <select
        className="input"
        value={ownerId}
        onChange={(e) => setOwnerId(e.target.value)}
        aria-label="Select user"
      >
        <option value="">Select a user…</option>
        {users.filter(u => u.role !== 'admin').map(u => (
          <option key={u.id} value={u.id}>{u.display_name}</option>
        ))}
      </select>

      {/* Description */}
      <input
        type="text"
        className="input"
        placeholder="What needs to be done?"
        value={description}
        maxLength={120}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Tag pills */}
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map(t => {
          const colors = TAG_COLORS[t];
          const isSelected = tag === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${isSelected ? colors.active : colors.base} hover:opacity-80`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Date + Repeat */}
      <div className="flex flex-wrap gap-3 items-start">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-muted mb-1">Start date</label>
          <input
            type="date"
            className="input"
            value={startDate}
            min={TODAY}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-muted mb-1">Repeat</label>
          <div className="flex gap-2">
            {[
              { value: 'none',  label: 'One time' },
              { value: 'week',  label: 'Weekly ×4' },
              { value: 'month', label: 'Monthly ×2' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRepeat(opt.value)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  repeat === opt.value
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-600 border-border hover:border-primary-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date preview */}
      {dates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-xs font-medium text-muted mb-2">
            {dates.length} task{dates.length !== 1 ? 's' : ''} will be created:
          </p>
          {dates.map((d, i) => (
            <div key={d} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
              {formatDate(d)}
            </div>
          ))}
        </div>
      )}

      {create.error && <p className="text-xs text-red-500">{create.error.message}</p>}

      <button
        className="btn-primary w-full"
        disabled={!canSubmit || create.isPending}
        onClick={() => create.mutate()}
      >
        {create.isPending ? 'Creating…' : `Create ${dates.length || ''} Task${dates.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
}
