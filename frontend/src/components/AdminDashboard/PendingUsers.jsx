import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function PendingUsers() {
  const qc = useQueryClient();

  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['admin', 'users', 'pending'],
    queryFn: () => adminApi.users('pending'),
    refetchInterval: 30_000, // poll every 30s so admin sees new signups
  });

  const approve = useMutation({
    mutationFn: adminApi.approveUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const reject = useMutation({
    mutationFn: adminApi.rejectUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted text-sm">Loading…</div>;
  }

  if (pending.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm text-muted">No users waiting for approval — you're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">
        {pending.length} user{pending.length !== 1 ? 's' : ''} waiting for approval
      </p>

      {pending.map((user) => (
        <div key={user.id} className="card px-4 py-3 flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 font-semibold text-sm">
              {user.display_name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
            <p className="text-xs text-muted">@{user.username} · Requested {formatDate(user.created_at)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => approve.mutate(user.id)}
              disabled={approve.isPending || reject.isPending}
              className="btn-primary text-xs px-3 py-1.5"
              style={{ minHeight: '32px' }}
            >
              Approve
            </button>
            <button
              onClick={() => reject.mutate(user.id)}
              disabled={approve.isPending || reject.isPending}
              className="btn-danger text-xs px-3 py-1.5"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
