import { useState } from 'react';
import { useTags } from '../../hooks/useTasks';
import { tagPillClass } from '../../utils/tagColors';

const MAX = 120;
const TODAY = new Date().toISOString().slice(0, 10);

export default function AddTaskForm({ onSubmit, isLoading, error }) {
  const { data: tags = [] } = useTags();
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(TODAY);
  const [tag, setTag] = useState('Others');

  const remaining = MAX - description.length;
  const atLimit = description.length >= MAX;
  const canSubmit = description.trim().length > 0 && dueDate !== '';

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(description.trim(), dueDate, tag);
    setDescription('');
    setDueDate(TODAY);
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
        {tags.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${tagPillClass(t, tag === t)} hover:opacity-80`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="date"
            className="input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            required
          />
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
