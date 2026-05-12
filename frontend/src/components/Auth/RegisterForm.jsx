import { useState } from 'react';
import { Link } from 'react-router-dom';

const AVATARS = [
  {id:'dino',emoji:'🦕'}, {id:'unicorn',emoji:'🦄'}, {id:'car',emoji:'🚗'},
  {id:'princess',emoji:'👸'}, {id:'fairy',emoji:'🧚'}, {id:'butterfly',emoji:'🦋'},
  {id:'robot',emoji:'🤖'}, {id:'superhero',emoji:'🦸'}, {id:'soccer',emoji:'⚽'},
  {id:'dragon',emoji:'🐉'}, {id:'cat',emoji:'🐱'}, {id:'star',emoji:'🌟'},
];

export default function RegisterForm({ onSubmit, isLoading, error }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(username.trim(), displayName.trim(), password, avatar || null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="text"
          className="input"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. Alice"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="input"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pick your avatar <span className="text-muted font-normal">(optional)</span>
        </label>
        <div className="grid grid-cols-6 gap-1">
          {AVATARS.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAvatar(avatar === a.emoji ? '' : a.emoji)}
              className={`text-2xl p-1.5 rounded-lg transition-all ${avatar === a.emoji ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-100'}`}
              aria-label={a.id}
            >
              {a.emoji}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-500 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
