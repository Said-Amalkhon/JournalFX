import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { api } from '../api/client';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetToken = location.state?.resetToken || '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!resetToken) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-muted mb-4">Invalid reset session.</p>
          <Link to="/forgot-password" className="text-accent hover:underline">Start over</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await api.resetPassword(resetToken, form.password);
      navigate('/login', { state: { message: 'Password updated! Please sign in.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. Please start over.');
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
          <h1 className="text-xl font-bold text-white mb-1">New password</h1>
          <p className="text-muted text-sm mb-6">Choose a strong password for your account.</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-loss/10 border border-loss/20 text-loss text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input w-full pr-10"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-muted text-xs uppercase tracking-wider font-medium block mb-1.5">Confirm Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                className="input w-full"
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Set New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
