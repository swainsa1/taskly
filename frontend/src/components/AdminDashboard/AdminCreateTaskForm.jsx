import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useTags } from '../../hooks/useTasks';

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

function isWeekend(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

function generateDates(startDate, repeat, skipWeekends) {
  if (!startDate) return [];
  const addDays = (iso, n) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + n);
    return date.toISOString().slice(0, 10);
  };

  let totalDays;
  if (repeat === 'week') totalDays = 7;
  else if (repeat === 'month') totalDays = 30;
  else totalDays = 1;

  const dates = [];
  for (let i = 0; i < totalDays; i++) {
    const iso = addDays(startDate, i);
    if (skipWeekends && isWeekend(iso)) continue;
    dates.push(iso);
  }
  return dates;
}

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function AdminCreateTaskForm({ users, onCreated }) {
  const qc = useQueryClient();
  const { data: tags = [] } = useTags();
  const [ownerId, setOwnerId] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Others');
  const [startDate, setStartDate] = useState('');
  const [repeat, setRepeat] = useState('none');
  const [skipWeekends, setSkipWeekends] = useState(false);

  const dates = generateDates(startDate, repeat, skipWeekends);
  const canSubmit = ownerId && description.trim() && startDate && dates.length > 0;

  const create = useMutation({
    mutationFn: () => adminApi.bulkCreateTask(Number(ownerId), description.trim(), tag, dates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tasks'] });
      setDescription('');
      setStartDate('');
      setRepeat('none');
      setSkipWeekends(false);
      setTag('Others');
      onCreated?.();
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
        {tags.map(t => {
          const colors = TAG_COLORS[t] || TAG_COLORS['Others'];
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
              { value: 'week',  label: 'Daily ×7' },
              { value: 'month', label: 'Daily ×30' },
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

      {/* Skip weekends toggle — only relevant for multi-day repeats */}
      {repeat !== 'none' && (
        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={skipWeekends}
            onChange={(e) => setSkipWeekends(e.target.checked)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-xs text-gray-600">Skip weekends</span>
        </label>
      )}

      {/* Date preview */}
      {dates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-muted mb-2">
            {dates.length} task{dates.length !== 1 ? 's' : ''} will be created:
          </p>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {dates.map((d, i) => (
              <div key={d} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                {formatDate(d)}
              </div>
            ))}
          </div>
        </div>
      )}

      {startDate && dates.length === 0 && (
        <p className="text-xs text-orange-500">All selected days are weekends — no tasks would be created.</p>
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
