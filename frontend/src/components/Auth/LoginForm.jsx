import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginForm({ onSubmit, isLoading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(username.trim(), password);
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="input"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-muted">
        New here?{' '}
        <Link to="/register" className="text-primary-500 font-medium hover:underline">
          Request access
        </Link>
      </p>
    </form>
  );
}
