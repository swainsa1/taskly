const TABS = [
  { id: 'overdue',  label: 'Overdue',     urgent: true  },
  { id: 'today',   label: 'Today',        urgent: false },
  { id: 'week',    label: 'This Week',    urgent: false },
  { id: 'month',   label: 'This Month',   urgent: false },
  { id: 'all',     label: 'All',          urgent: false },
];

export default function TabBar({ activeTab, onTabChange, overdueCount = 0 }) {
  return (
    <div className="flex overflow-x-auto border-b border-border bg-white" style={{ scrollbarWidth: 'none' }}>
      {TABS.map((tab) => {
        const active = tab.id === activeTab;
        const showBadge = tab.id === 'overdue' && overdueCount > 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={[
              'flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium',
              'border-b-2 whitespace-nowrap focus:outline-none transition-colors',
              active && tab.urgent
                ? 'border-red-500 text-red-600'
                : active
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-muted hover:text-gray-700 hover:border-gray-300',
            ].join(' ')}
            style={{ minHeight: '44px' }}
          >
            {tab.label}
            {showBadge && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {overdueCount > 99 ? '99+' : overdueCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
