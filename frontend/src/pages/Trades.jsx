import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { api } from '../api/client';
import TradeRow from '../components/TradeRow';

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getTrades(filter === 'all' ? null : filter);
      setTrades(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this trade?')) return;
    await api.deleteTrade(id);
    load();
  };

  const totalProfit = trades.filter(t => t.result_type === 'profit').reduce((s, t) => s + t.amount, 0);
  const totalLoss = trades.filter(t => t.result_type === 'loss').reduce((s, t) => s + t.amount, 0);
  const winRate = trades.length > 0
    ? Math.round((trades.filter(t => t.result_type === 'profit').length / trades.length) * 100)
    : 0;

  return (
    <div className="space-y-6 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade History</h1>
          <p className="text-muted text-sm mt-1">{trades.length} trades found</p>
        </div>
        <button onClick={() => navigate('/add-trade')} className="btn-primary">
          <Plus size={16} /> New Trade
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 border-profit/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-profit-dim flex items-center justify-center">
            <TrendingUp size={16} className="text-profit" />
          </div>
          <div>
            <p className="text-muted text-xs">Total Profit</p>
            <p className="text-profit font-bold font-mono text-lg">
              +${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="card p-4 border-loss/20 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-loss-dim flex items-center justify-center">
            <TrendingDown size={16} className="text-loss" />
          </div>
          <div>
            <p className="text-muted text-xs">Total Loss</p>
            <p className="text-loss font-bold font-mono text-lg">
              -${totalLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Filter size={16} className="text-accent" />
          </div>
          <div>
            <p className="text-muted text-xs">Win Rate</p>
            <p className="text-white font-bold font-mono text-lg">{winRate}%</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {['all', 'profit', 'loss'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200
              ${filter === f
                ? f === 'profit'
                  ? 'bg-profit-dim text-profit border border-profit/20'
                  : f === 'loss'
                  ? 'bg-loss-dim text-loss border border-loss/20'
                  : 'bg-accent/15 text-white border border-accent/20'
                : 'text-muted border border-bg-border hover:text-white hover:bg-bg-hover'
              }`}
          >
            {f === 'all' ? 'All Trades' : f === 'profit' ? 'Wins' : 'Losses'}
          </button>
        ))}
      </div>

      {/* Trade list */}
      <div className="card p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trades.length > 0 ? (
          <div className="space-y-2">
            {trades.map(t => (
              <TradeRow key={t.id} trade={t} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-base mb-4">No trades found.</p>
            <button onClick={() => navigate('/add-trade')} className="btn-primary mx-auto">
              <Plus size={14} /> Add Trade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
