import { useState } from 'react';
import { useTags } from '../../hooks/useTasks';

const MAX = 120;

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

      <select
        className="input"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        aria-label="Task tag"
      >
        {tags.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

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
