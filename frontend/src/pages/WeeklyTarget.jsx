import { useEffect, useState } from 'react';
import { Target, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { api } from '../api/client';

function fmt(n) {
  const abs = Math.abs(n);
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${str}` : `$${str}`;
}

export default function WeeklyTarget() {
  const [target, setTarget] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    const [t, d] = await Promise.all([api.getCurrentTarget(), api.getDashboard()]);
    setTarget(t);
    setDashboard(d);
    if (t?.target_amount) setNewAmount(String(t.target_amount));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newAmount || parseFloat(newAmount) <= 0) return;
    setSaving(true);
    try {
      await api.setTarget({ target_amount: parseFloat(newAmount) });
      await load();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const weekly = dashboard?.weekly || {};
  const targetAmount = weekly.targetAmount || 0;
  const achieved = Math.max(0, weekly.netPnl || 0);
  const remaining = Math.max(0, targetAmount - achieved);
  const progress = targetAmount > 0 ? Math.min(100, (achieved / targetAmount) * 100) : 0;
  const daysLeft = weekly.daysLeft || 0;

  const weekStart = weekly.weekStart;
  const weekEnd = weekly.weekEnd;

  let weekLabel = '';
  try {
    const ws = new Date(weekStart + 'T00:00:00');
    const we = new Date(weekEnd + 'T00:00:00');
    weekLabel = `${format(ws, 'MMM d')} – ${format(we, 'MMM d, yyyy')}`;
  } catch (_) {}

  const status = !targetAmount
    ? 'none'
    : progress >= 100
    ? 'completed'
    : daysLeft <= 1 && progress < 50
    ? 'behind'
    : 'on_track';

  const statusConfig = {
    none: { label: 'No Target Set', color: 'text-muted', icon: Target, bg: 'bg-bg-secondary' },
    completed: { label: 'Target Completed!', color: 'text-profit', icon: CheckCircle, bg: 'bg-profit-dim' },
    on_track: { label: 'On Track', color: 'text-accent', icon: TrendingUp, bg: 'bg-accent/10' },
    behind: { label: 'Behind Schedule', color: 'text-loss', icon: AlertTriangle, bg: 'bg-loss-dim' },
  };

  const sc = statusConfig[status];
  const StatusIcon = sc.icon;

  return (
    <div className="max-w-2xl mx-auto fade-in-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Weekly Target</h1>
        <p className="text-muted text-sm mt-1">{weekLabel || 'Current week'}</p>
      </div>

      {/* Status card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl ${sc.bg} flex items-center justify-center`}>
            <StatusIcon size={22} className={sc.color} />
          </div>
          <div>
            <p className={`text-lg font-bold ${sc.color}`}>{sc.label}</p>
            {targetAmount > 0 && (
              <p className="text-muted text-sm">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining this week</p>
            )}
          </div>
        </div>

        {targetAmount > 0 ? (
          <>
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Progress</span>
                <span className={`font-bold font-mono ${progress >= 100 ? 'text-profit' : 'text-white'}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-3 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${progress >= 100 ? 'bg-profit' : 'bg-accent'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-bg-secondary rounded-xl p-4 text-center">
                <p className="text-muted text-xs mb-1">Achieved</p>
                <p className="text-profit font-bold font-mono text-lg">{fmt(achieved)}</p>
              </div>
              <div className="bg-bg-secondary rounded-xl p-4 text-center">
                <p className="text-muted text-xs mb-1">Remaining</p>
                <p className="text-white font-bold font-mono text-lg">{fmt(remaining)}</p>
              </div>
              <div className="bg-bg-secondary rounded-xl p-4 text-center">
                <p className="text-muted text-xs mb-1">Target</p>
                <p className="text-accent font-bold font-mono text-lg">{fmt(targetAmount)}</p>
              </div>
            </div>

            {/* Text summary */}
            <div className="mt-5 p-4 bg-bg-secondary rounded-xl border border-bg-border">
              <p className="text-white text-sm">
                {progress >= 100
                  ? `You've hit your $${targetAmount} target! Keep going — stay disciplined.`
                  : remaining > 0
                  ? `${fmt(achieved)} of ${fmt(targetAmount)} completed. You need ${fmt(remaining)} more to reach your goal.`
                  : 'Great work this week!'
                }
              </p>
            </div>
          </>
        ) : (
          <p className="text-muted text-sm">Set a weekly profit goal below to start tracking your progress.</p>
        )}
      </div>

      {/* Set target form */}
      <div className="card p-6">
        <h2 className="text-white font-semibold mb-1">
          {targetAmount > 0 ? 'Update Target' : 'Set Weekly Target'}
        </h2>
        <p className="text-muted text-sm mb-5">How much profit are you aiming for this week?</p>

        <form onSubmit={handleSave} className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="1"
              placeholder="e.g. 300.00"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              className="input pl-8 font-mono"
              required
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex-shrink-0 px-6">
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : saved
              ? <><CheckCircle size={16} /> Saved!</>
              : <><Target size={16} /> Set Target</>
            }
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex gap-2 mt-4">
          <p className="text-muted text-xs self-center">Quick:</p>
          {[100, 200, 300, 500, 1000].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setNewAmount(String(n))}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors
                ${newAmount === String(n)
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'text-muted border-bg-border hover:text-white hover:border-subtle'
                }`}
            >
              ${n}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly breakdown */}
      {dashboard && (
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-5">Week Breakdown</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-3 border-b border-bg-border">
              <span className="text-muted text-sm">Total Trades</span>
              <span className="text-white font-semibold font-mono">{weekly.trades || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg-border">
              <span className="text-muted text-sm">Days Left</span>
              <span className="text-white font-semibold font-mono flex items-center gap-1">
                <Clock size={12} className="text-muted" /> {daysLeft}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg-border">
              <span className="text-muted text-sm">Weekly Profit</span>
              <span className="text-profit font-semibold font-mono">{fmt(weekly.profit || 0)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg-border">
              <span className="text-muted text-sm">Weekly Loss</span>
              <span className="text-loss font-semibold font-mono">{fmt(weekly.loss || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
