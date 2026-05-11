const TODAY = new Date().toISOString().slice(0, 10);

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TaskCard({ task, onComplete, onReopen, showOwner = false }) {
  const closed = task.status === 'closed';
  const overdue = !closed && task.due_date && task.due_date < TODAY;

  function handleToggle() {
    if (closed) {
      onReopen && onReopen(task.id);
    } else {
      onComplete && onComplete(task.id);
    }
  }

  return (
    <div
      className={[
        'card px-4 py-3 flex items-start gap-3 transition-opacity',
        closed ? 'opacity-60' : '',
        overdue ? 'border-l-4 border-l-red-400' : '',
      ].join(' ')}
    >
      {/* Toggle checkbox */}
      <button
        onClick={handleToggle}
        aria-label={closed ? 'Mark as incomplete' : 'Mark as complete'}
        className={[
          'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors',
          closed
            ? 'bg-primary-500 border-primary-500 hover:bg-primary-400 hover:border-primary-400'
            : 'border-gray-300 hover:border-primary-400',
        ].join(' ')}
        style={{ minWidth: '20px', minHeight: '20px' }}
      >
        {closed && (
          <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none">
            <path
              d="M1 5l3.5 3.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {showOwner && task.owner && (
          <p className="text-xs text-muted mb-0.5">{task.owner.display_name}</p>
        )}
        <p className={['text-sm', closed ? 'line-through text-muted' : 'text-gray-900'].join(' ')}>
          {task.description}
        </p>
        {task.due_date && (
          <p className={['text-xs mt-0.5', overdue ? 'text-red-500 font-medium' : 'text-muted'].join(' ')}>
            {overdue && '⚠ '}
            {formatDate(task.due_date)}
          </p>
        )}
      </div>
    </div>
  );
}
