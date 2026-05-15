import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AVATARS = [
  {id:'dino',emoji:'🦕'}, {id:'unicorn',emoji:'🦄'}, {id:'car',emoji:'🚗'},
  {id:'princess',emoji:'👸'}, {id:'fairy',emoji:'🧚'}, {id:'butterfly',emoji:'🦋'},
  {id:'robot',emoji:'🤖'}, {id:'superhero',emoji:'🦸'}, {id:'soccer',emoji:'⚽'},
  {id:'dragon',emoji:'🐉'}, {id:'cat',emoji:'🐱'}, {id:'star',emoji:'🌟'},
];

export default function Header() {
  const { user, logout, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const pickerRef = useRef(null);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handlePickAvatar(emoji) {
    await updateAvatar(emoji);
    setShowAvatarPicker(false);
  }

  useEffect(() => {
    if (!showAvatarPicker) return;
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowAvatarPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAvatarPicker]);

  return (
    <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-primary-500 font-bold text-xl tracking-tight">Taskly</span>
        </Link>

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-3 relative" ref={pickerRef}>
            <span className="text-sm text-muted">{user.display_name}</span>
            {/* Avatar button */}
            <button
              onClick={() => setShowAvatarPicker(v => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-primary-50 hover:bg-primary-100 transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              aria-label="Change avatar"
              title="Change avatar"
            >
              {user.avatar
                ? user.avatar
                : <span className="text-primary-600 font-semibold text-sm">{user.display_name.charAt(0).toUpperCase()}</span>
              }
            </button>
            {/* Avatar picker dropdown */}
            {showAvatarPicker && (
              <div className="absolute right-0 top-11 bg-white border border-border rounded-xl shadow-lg p-3 z-50 w-52">
                <p className="text-xs text-muted mb-2 font-medium">Choose your avatar</p>
                <div className="grid grid-cols-6 gap-1">
                  {AVATARS.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handlePickAvatar(a.emoji)}
                      className={`text-xl p-1 rounded-lg transition-all ${user.avatar === a.emoji ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-100'}`}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="btn-ghost text-sm py-1 px-3">
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
