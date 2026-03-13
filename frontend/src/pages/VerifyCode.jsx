import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { api } from '../api/client';

export default function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = location.state?.login || '';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleDigit = (i, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) return setError('Enter the full 6-digit code');
    setError('');
    setLoading(true);
    try {
      const data = await api.verifyCode(login, code);
      navigate('/reset-password', { state: { resetToken: data.resetToken } });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.forgotPassword(login);
      setResendCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } catch {}
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
          <h1 className="text-xl font-bold text-white mb-1">Check your inbox</h1>
          <p className="text-muted text-sm mb-6">
            We sent a 6-digit code to the email linked to <span className="text-white font-medium">{login}</span>.
            It expires in 3 minutes.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-loss/10 border border-loss/20 text-loss text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKey(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold font-mono text-white bg-bg-secondary border border-bg-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              ))}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Verify Code'}
            </button>
          </form>

          <div className="mt-4 text-center">
            {resendCooldown > 0 ? (
              <span className="text-muted text-sm">Resend in {resendCooldown}s</span>
            ) : (
              <button onClick={handleResend} className="text-accent text-sm hover:underline">
                Resend code
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-muted text-sm mt-6">
          <Link to="/forgot-password" className="text-accent hover:underline font-medium">← Back</Link>
        </p>
      </div>
    </div>
  );
}
