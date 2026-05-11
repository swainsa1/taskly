import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-primary-500 font-bold text-xl tracking-tight">Taskly</span>
        </Link>

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
              >
                Admin
              </Link>
            )}
            <span className="text-sm text-muted hidden sm:block">{user.display_name}</span>
            <button onClick={handleLogout} className="btn-ghost text-sm py-1 px-3">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
