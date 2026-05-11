import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

function statusMessage(errMsg) {
  if (errMsg === 'account_pending') {
    return {
      type: 'warning',
      text: 'Your account is pending approval. Check back soon!',
    };
  }
  if (errMsg === 'account_rejected') {
    return {
      type: 'error',
      text: 'Your account request was not approved. Contact the admin for help.',
    };
  }
  return { type: 'error', text: errMsg || 'Invalid username or password' };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(username, password) {
    setFeedback(null);
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setFeedback(statusMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500 tracking-tight">Taskly</h1>
          <p className="text-muted text-sm mt-1">Sign in to your account</p>
        </div>
        <div className="card p-6">
          {feedback && (
            <div
              className={[
                'mb-4 px-3 py-2 rounded-lg text-sm',
                feedback.type === 'warning'
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-700 border border-red-200',
              ].join(' ')}
            >
              {feedback.text}
            </div>
          )}
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
