import { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [displayName, setDisplayName] = useState('');

  async function handleSubmit(username, name, password, avatar) {
    setError('');
    setIsLoading(true);
    try {
      await register(username, name, password, avatar);
      setDisplayName(name);
      setRegistered(true);
    } catch (err) {
      if (err.status === 409) {
        setError('That username is already taken. Try another.');
      } else {
        setError(err.message || 'Could not create account');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          {/* Pending icon */}
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">You're on the list, {displayName}!</h1>
          <p className="text-sm text-muted leading-relaxed">
            Your account is waiting for admin approval. You'll be able to log in once it's been approved.
          </p>
          <p className="text-sm text-muted">
            Already approved?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500 tracking-tight">Taskly</h1>
          <p className="text-muted text-sm mt-1">Create your account</p>
        </div>
        <div className="card p-6">
          <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
