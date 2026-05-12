import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header/Header';
import AdminDashboard from '../components/AdminDashboard/AdminDashboard';
import PendingUsers from '../components/AdminDashboard/PendingUsers';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';

const TABS = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'pending', label: 'Pending Approvals' },
];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');

  // Fetch pending count for badge
  const { data: pendingUsers = [] } = useQuery({
    queryKey: ['admin', 'users', 'pending'],
    queryFn: () => adminApi.users('pending'),
    refetchInterval: 30_000,
    enabled: !!user && user.role === 'admin',
  });

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-dvh bg-surface flex flex-col">
      <Header />
      <div className="max-w-3xl w-full mx-auto px-4 py-4 flex flex-col gap-4 flex-1">

        {/* Tab bar */}
        <div className="flex border-b border-border bg-white rounded-t-xl overflow-hidden">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            const showBadge = tab.id === 'pending' && pendingUsers.length > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                  active
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-muted hover:text-gray-700',
                ].join(' ')}
                style={{ minHeight: '44px' }}
              >
                {tab.label}
                {showBadge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold">
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'tasks' && <AdminDashboard />}
        {activeTab === 'pending' && <PendingUsers />}
      </div>

      <footer className="mt-auto py-3 text-center text-xs text-muted">
        © 2026 Swain Software Solutions
      </footer>
    </div>
  );
}
