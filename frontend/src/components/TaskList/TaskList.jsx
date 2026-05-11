import TaskCard from '../TaskCard/TaskCard';

export default function TaskList({ tasks, onComplete, onReopen, emptyMessage, showOwner = false }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted text-sm">
        {emptyMessage || 'No tasks here.'}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onReopen={onReopen}
          showOwner={showOwner}
        />
      ))}
    </div>
  );
}
