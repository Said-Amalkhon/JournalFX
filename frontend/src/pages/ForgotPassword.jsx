import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { api } from '../api/client';

export default function ForgotPassword() {
  const [login, setLogin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(login);
      navigate('/verify-code', { state: { login } });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-glow">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="font-bold text-white text-2xl tracking-tight">
            Journal<span className="text-accent">FX</span>
          </span>
        </div>

        <div className="card p-6">
          <h1 className="text-xl font-bold text-white mb-1">Reset password</h1>
          <p className="text-muted text-sm mb-6">
            Enter your username or email — we'll send a 6-digit code.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-loss/10 border border-loss/20 text-loss text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                className="input w-full"
                placeholder="trader123 or you@example.com"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Send Code'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          <Link to="/login" className="text-accent hover:underline font-medium">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
