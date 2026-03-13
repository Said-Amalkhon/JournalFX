import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Plus, Target } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../api/client';
import KPICard from '../components/KPICard';
import TradeRow from '../components/TradeRow';

function fmt(n) {
  const abs = Math.abs(n);
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${str}` : `$${str}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div className="bg-bg-card border border-bg-border rounded-xl px-4 py-3 shadow-card">
        <p className="text-muted text-xs mb-1">{label}</p>
        <p className={`font-bold font-mono ${val >= 0 ? 'text-profit' : 'text-loss'}`}>
          {val >= 0 ? '+' : ''}{fmt(val)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const d = await api.getDashboard();
      setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this trade?')) return;
    await api.deleteTrade(id);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const d = data || {};
  const weekly = d.weekly || {};
  const chartData = (d.dailyPnl || []).map(row => ({
    date: (() => { try { return format(new Date(row.trade_date + 'T00:00:00'), 'MMM d'); } catch { return row.trade_date; } })(),
    pnl: row.net_pnl,
  }));

  // Top reason for losses and wins
  const lossReasons = (d.reasonStats || []).filter(r => r.result_type === 'loss').slice(0, 3);
  const winReasons = (d.reasonStats || []).filter(r => r.result_type === 'profit').slice(0, 3);

  const REASON_LABELS = {
    followed_plan: 'Followed Plan', good_entry: 'Good Entry', bad_entry: 'Bad Entry',
    fomo: 'FOMO', overtrading: 'Overtrading', closed_early: 'Closed Early',
    held_long: 'Held Too Long', lucky_move: 'Lucky Move', clean_setup: 'Clean Setup',
  };

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Track your trading performance</p>
        </div>
        <button onClick={() => navigate('/add-trade')} className="btn-primary">
          <Plus size={16} />
          New Trade
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Profit"
          value={fmt(d.totalProfit || 0)}
          icon={TrendingUp}
          variant="profit"
          subtitle={`${d.totalTrades || 0} total trades`}
        />
        <KPICard
          title="Total Loss"
          value={fmt(d.totalLoss || 0)}
          icon={TrendingDown}
          variant="loss"
          subtitle="All time"
        />
        <KPICard
          title="Net PnL"
          value={fmt(d.netPnl || 0)}
          icon={DollarSign}
          variant="net"
          subtitle="All time net"
        />
        <KPICard
          title="Weekly Progress"
          value={weekly.targetAmount > 0 ? `${Math.round(weekly.targetProgress || 0)}%` : 'No target'}
          icon={Target}
          variant="default"
          subtitle={weekly.targetAmount > 0
            ? `${fmt(Math.max(0, weekly.netPnl || 0))} of ${fmt(weekly.targetAmount)}`
            : 'Set a weekly target'
          }
        />
      </div>

      {/* Chart + Weekly summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PnL Chart */}
        <div className="card lg:col-span-2 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-semibold">PnL Chart</h3>
              <p className="text-muted text-xs mt-0.5">Last 30 days</p>
            </div>
            <BarChart2 size={18} className="text-muted" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E3A" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#8B8BAD', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8B8BAD', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="pnl"
                  stroke="#6366F1" strokeWidth={2}
                  fill="url(#pnlGrad)"
                  dot={{ fill: '#6366F1', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#6366F1', r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted text-sm">
              No trade data yet. Add your first trade!
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="card p-4 sm:p-6 flex flex-col">
          <h3 className="text-white font-semibold mb-5">This Week</h3>
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Trades</span>
              <span className="text-white font-semibold font-mono">{weekly.trades || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Profit</span>
              <span className="text-profit font-semibold font-mono">{fmt(weekly.profit || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm">Loss</span>
              <span className="text-loss font-semibold font-mono">{fmt(weekly.loss || 0)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-bg-border pt-4">
              <span className="text-muted text-sm">Net PnL</span>
              <span className={`font-bold font-mono ${(weekly.netPnl || 0) >= 0 ? 'text-profit' : 'text-loss'}`}>
                {fmt(weekly.netPnl || 0)}
              </span>
            </div>
          </div>

          {/* Weekly target progress */}
          {weekly.targetAmount > 0 && (
            <div className="mt-5 pt-5 border-t border-bg-border">
              <div className="flex justify-between text-xs text-muted mb-2">
                <span>Weekly Target</span>
                <span>{weekly.daysLeft}d left</span>
              </div>
              <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, weekly.targetProgress || 0))}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-muted">{fmt(Math.max(0, weekly.netPnl || 0))}</span>
                <span className="text-accent font-medium">{Math.round(weekly.targetProgress || 0)}%</span>
                <span className="text-muted">{fmt(weekly.targetAmount)}</span>
              </div>
            </div>
          )}

          {!weekly.targetAmount && (
            <button
              onClick={() => navigate('/weekly-target')}
              className="mt-4 text-xs text-accent hover:underline text-center"
            >
              + Set weekly target
            </button>
          )}
        </div>
      </div>

      {/* Reflection Score + Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trade Reflection Score */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-white font-semibold mb-5">Reflection Score</h3>
          <div className="space-y-4">
            {(lossReasons.length > 0 || winReasons.length > 0) ? (
              <>
                {winReasons.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2 font-medium">Top Win Reasons</p>
                    <div className="space-y-2">
                      {winReasons.map(r => (
                        <div key={r.reason_tag + r.result_type} className="flex items-center justify-between">
                          <span className="text-sm text-white">{REASON_LABELS[r.reason_tag] || r.reason_tag}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-profit rounded-full" style={{ width: `${Math.min(r.count * 20, 80)}px` }} />
                            <span className="text-profit text-xs font-mono">{r.count}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lossReasons.length > 0 && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider mb-2 font-medium">Top Loss Reasons</p>
                    <div className="space-y-2">
                      {lossReasons.map(r => (
                        <div key={r.reason_tag + r.result_type} className="flex items-center justify-between">
                          <span className="text-sm text-white">{REASON_LABELS[r.reason_tag] || r.reason_tag}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-loss rounded-full" style={{ width: `${Math.min(r.count * 20, 80)}px` }} />
                            <span className="text-loss text-xs font-mono">{r.count}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted text-sm">No reflection data yet.</p>
                <p className="text-muted text-xs mt-1">Add trades with reason tags to see patterns.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className="card lg:col-span-2 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Recent Trades</h3>
            <button
              onClick={() => navigate('/trades')}
              className="text-xs text-accent hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {(d.recentTrades || []).length > 0 ? (
              d.recentTrades.map(t => (
                <TradeRow key={t.id} trade={t} onDelete={handleDelete} />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted text-sm mb-3">No trades yet.</p>
                <button onClick={() => navigate('/add-trade')} className="btn-primary mx-auto">
                  <Plus size={14} /> Add First Trade
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
