import { useState } from 'react';
import Header from '../components/Header/Header';
import TabBar from '../components/TabBar/TabBar';
import AddTaskForm from '../components/AddTaskForm/AddTaskForm';
import TaskList from '../components/TaskList/TaskList';
import { useTasksQuery, useCreateTask, useCompleteTask, useReopenTask } from '../hooks/useTasks';

const EMPTY_MESSAGES = {
  overdue: "No overdue tasks — great job staying on top of things! ✅",
  today:   "Nothing due today — you're all caught up! 🎉",
  week:    'No tasks this week.',
  month:   'No tasks this month.',
  all:     'No tasks yet — add one above!',
};

export default function DashboardPage() {
  const [filter, setFilter] = useState('today');

  const { data: tasks = [], isLoading } = useTasksQuery(filter);
  // Always fetch overdue count for the badge (separate query so it updates across tabs)
  const { data: overdueTasks = [] } = useTasksQuery('overdue');

  const createTask = useCreateTask();
  const completeTask = useCompleteTask();
  const reopenTask = useReopenTask();

  async function handleAddTask(description, dueDate, tag) {
    await createTask.mutateAsync({ description, due_date: dueDate, tag });
  }

  async function handleComplete(id) {
    await completeTask.mutateAsync(id);
  }

  async function handleReopen(id) {
    await reopenTask.mutateAsync(id);
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <Header />

      <div className="max-w-2xl w-full mx-auto px-4 py-4 flex flex-col gap-4 flex-1">
        {/* Add task */}
        <AddTaskForm
          onSubmit={handleAddTask}
          isLoading={createTask.isPending}
          error={createTask.error?.message}
        />

        {/* Tabs + list */}
        <div className="card overflow-hidden">
          <TabBar
            activeTab={filter}
            onTabChange={setFilter}
            overdueCount={overdueTasks.length}
          />
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted text-sm">Loading…</div>
            ) : (
              <TaskList
                tasks={tasks}
                onComplete={handleComplete}
                onReopen={handleReopen}
                emptyMessage={EMPTY_MESSAGES[filter]}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="mt-auto py-3 text-center text-xs text-muted">
        © 2026 Swain Software Solutions
      </footer>
    </div>
  );
}
