import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../api/client';

const REASON_TAGS = [
  { value: 'followed_plan', label: 'Followed Plan', desc: 'Executed the plan perfectly' },
  { value: 'good_entry', label: 'Good Entry', desc: 'Entered at the right price' },
  { value: 'bad_entry', label: 'Bad Entry', desc: 'Entered at the wrong price' },
  { value: 'fomo', label: 'FOMO', desc: 'Fear of missing out' },
  { value: 'overtrading', label: 'Overtrading', desc: 'Took too many trades' },
  { value: 'closed_early', label: 'Closed Early', desc: 'Exited too soon' },
  { value: 'held_long', label: 'Held Too Long', desc: 'Stayed in too late' },
  { value: 'lucky_move', label: 'Lucky Move', desc: 'Got lucky this time' },
  { value: 'clean_setup', label: 'Clean Setup', desc: 'Picture-perfect setup' },
];

const MOOD_TAGS = [
  { value: 'calm', label: '😌 Calm', desc: 'Relaxed and focused' },
  { value: 'confident', label: '💪 Confident', desc: 'Felt sure of the trade' },
  { value: 'nervous', label: '😰 Nervous', desc: 'Felt uncertain or anxious' },
  { value: 'greedy', label: '🤑 Greedy', desc: 'Wanted more than planned' },
  { value: 'revenge', label: '😤 Revenge', desc: 'Trading to recover losses' },
];

const INSTRUMENTS = ['XAUUSD', 'BTCUSD', 'ETHUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'NASDAQ', 'SPX500', 'GBPJPY', 'AUDCAD'];

export default function AddTrade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    instrument: '',
    side: 'BUY',
    result_type: 'profit',
    amount: '',
    note: '',
    reason_tag: '',
    mood_tag: '',
    trade_date: today,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.getTrade(id).then(t => {
        setForm({
          instrument: t.instrument,
          side: t.side,
          result_type: t.result_type,
          amount: String(t.amount),
          note: t.note || '',
          reason_tag: t.reason_tag || '',
          mood_tag: t.mood_tag || '',
          trade_date: t.trade_date,
        });
      }).catch(() => setError('Trade not found'));
    }
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instrument || !form.amount || !form.trade_date) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (isEdit) {
        await api.updateTrade(id, payload);
      } else {
        await api.createTrade(payload);
      }
      setSaved(true);
      setTimeout(() => navigate('/trades'), 1200);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save trade.');
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-64 fade-in-up">
        <div className="w-16 h-16 rounded-full bg-profit-dim flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-profit" />
        </div>
        <p className="text-white text-lg font-semibold">Trade {isEdit ? 'updated' : 'saved'}!</p>
        <p className="text-muted text-sm mt-1">Redirecting to trade history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-muted hover:text-white hover:bg-bg-hover transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Trade' : 'Add Trade'}</h1>
          <p className="text-muted text-sm mt-0.5">Record your trading activity</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-loss-dim border border-loss/30 text-loss text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Basic Info Card */}
        <div className="card p-6 space-y-5">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Trade Details</h2>

          {/* Instrument */}
          <div>
            <label className="label">Instrument *</label>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map(inst => (
                <button
                  type="button"
                  key={inst}
                  onClick={() => set('instrument', inst)}
                  className={`px-4 py-2 rounded-xl text-sm font-mono font-medium transition-all duration-150
                    ${form.instrument === inst
                      ? 'bg-accent text-white shadow-glow'
                      : 'bg-bg-secondary text-muted border border-bg-border hover:text-white hover:border-subtle'
                    }`}
                >
                  {inst}
                </button>
              ))}
              <input
                type="text"
                placeholder="Custom..."
                value={INSTRUMENTS.includes(form.instrument) ? '' : form.instrument}
                onChange={e => set('instrument', e.target.value)}
                className="input w-28 text-sm"
              />
            </div>
          </div>

          {/* Side */}
          <div>
            <label className="label">Direction *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => set('side', 'BUY')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 border
                  ${form.side === 'BUY'
                    ? 'bg-profit-dim text-profit border-profit/30'
                    : 'bg-bg-secondary text-muted border-bg-border hover:text-white'
                  }`}
              >
                <TrendingUp size={16} /> BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => set('side', 'SELL')}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 border
                  ${form.side === 'SELL'
                    ? 'bg-loss-dim text-loss border-loss/30'
                    : 'bg-bg-secondary text-muted border-bg-border hover:text-white'
                  }`}
              >
                <TrendingDown size={16} /> SELL / SHORT
              </button>
            </div>
          </div>

          {/* Result + Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Result *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => set('result_type', 'profit')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border
                    ${form.result_type === 'profit'
                      ? 'bg-profit-dim text-profit border-profit/30'
                      : 'bg-bg-secondary text-muted border-bg-border hover:text-white'
                    }`}
                >
                  Profit
                </button>
                <button
                  type="button"
                  onClick={() => set('result_type', 'loss')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border
                    ${form.result_type === 'loss'
                      ? 'bg-loss-dim text-loss border-loss/30'
                      : 'bg-bg-secondary text-muted border-bg-border hover:text-white'
                    }`}
                >
                  Loss
                </button>
              </div>
            </div>
            <div>
              <label className="label">Amount (USD) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  className="input pl-8 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="label">Trade Date *</label>
            <input
              type="date"
              value={form.trade_date}
              onChange={e => set('trade_date', e.target.value)}
              className="input"
              required
            />
          </div>

          {/* Note */}
          <div>
            <label className="label">Note</label>
            <textarea
              placeholder="What happened? Any observations..."
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={3}
              className="input resize-none"
            />
          </div>
        </div>

        {/* Trade Reflection Score — Killer Feature */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
              <span className="text-accent text-sm">✦</span>
            </div>
            <h2 className="text-white font-semibold">Trade Reflection Score</h2>
          </div>
          <p className="text-muted text-sm mb-5">Why was this trade a {form.result_type}?</p>
          <div className="grid grid-cols-3 gap-2">
            {REASON_TAGS.map(tag => (
              <button
                type="button"
                key={tag.value}
                onClick={() => set('reason_tag', form.reason_tag === tag.value ? '' : tag.value)}
                className={`p-3 rounded-xl text-left transition-all duration-150 border
                  ${form.reason_tag === tag.value
                    ? 'bg-accent/15 border-accent/30 text-white'
                    : 'bg-bg-secondary border-bg-border text-muted hover:text-white hover:border-subtle'
                  }`}
              >
                <p className="font-medium text-xs">{tag.label}</p>
                <p className="text-xs mt-0.5 opacity-60 leading-tight">{tag.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Tag */}
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-2">Mood Tag</h2>
          <p className="text-muted text-sm mb-4">How were you feeling when you took this trade?</p>
          <div className="flex gap-2 flex-wrap">
            {MOOD_TAGS.map(tag => (
              <button
                type="button"
                key={tag.value}
                onClick={() => set('mood_tag', form.mood_tag === tag.value ? '' : tag.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border
                  ${form.mood_tag === tag.value
                    ? 'bg-accent/15 border-accent/30 text-white'
                    : 'bg-bg-secondary border-bg-border text-muted hover:text-white hover:border-subtle'
                  }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : isEdit ? 'Update Trade' : 'Save Trade'
            }
          </button>
        </div>
      </form>
    </div>
  );
}
