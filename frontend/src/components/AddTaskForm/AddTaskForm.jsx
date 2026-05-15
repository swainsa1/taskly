import { useState } from 'react';
import { useTags } from '../../hooks/useTasks';

const MAX = 120;

const TAG_COLORS = {
  'Others':  { base: 'bg-gray-100 text-gray-600 border-gray-200',   active: 'bg-gray-500 text-white border-gray-500' },
  'School':  { base: 'bg-blue-50 text-blue-600 border-blue-200',    active: 'bg-blue-500 text-white border-blue-500' },
  'Home':    { base: 'bg-green-50 text-green-700 border-green-200', active: 'bg-green-500 text-white border-green-500' },
  'Sports':  { base: 'bg-orange-50 text-orange-600 border-orange-200', active: 'bg-orange-500 text-white border-orange-500' },
  'Art':     { base: 'bg-purple-50 text-purple-600 border-purple-200', active: 'bg-purple-500 text-white border-purple-500' },
  'Reading': { base: 'bg-yellow-50 text-yellow-700 border-yellow-200', active: 'bg-yellow-400 text-white border-yellow-400' },
  'Chores':  { base: 'bg-red-50 text-red-600 border-red-200',       active: 'bg-red-500 text-white border-red-500' },
  'Fun':     { base: 'bg-pink-50 text-pink-600 border-pink-200',    active: 'bg-pink-500 text-white border-pink-500' },
};

export default function AddTaskForm({ onSubmit, isLoading, error }) {
  const { data: tags = [] } = useTags();
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tag, setTag] = useState('Others');

  const remaining = MAX - description.length;
  const atLimit = description.length >= MAX;
  const canSubmit = description.trim().length > 0 && dueDate !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(description.trim(), dueDate, tag);
    setDescription('');
    setDueDate('');
    setTag('Others');
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <div>
        <input
          type="text"
          className="input"
          placeholder="What needs to be done?"
          value={description}
          maxLength={MAX}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Task description"
        />
        <div className="flex justify-end mt-1">
          <span className={['text-xs', atLimit ? 'text-red-500 font-medium' : 'text-muted'].join(' ')}>
            {remaining} left
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Task tag">
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

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="date"
            className={['input', !dueDate ? 'border-orange-300 focus:ring-orange-400 focus:border-orange-400' : ''].join(' ')}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date (required)"
            required
          />
          {!dueDate && (
            <p className="text-xs text-orange-500 mt-1">Due date is required</p>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary px-6 self-start"
          disabled={isLoading || !canSubmit}
        >
          {isLoading ? '…' : 'Add'}
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
