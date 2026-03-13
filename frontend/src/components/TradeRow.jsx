import { format } from 'date-fns';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REASON_LABELS = {
  followed_plan: 'Followed Plan',
  good_entry: 'Good Entry',
  bad_entry: 'Bad Entry',
  fomo: 'FOMO',
  overtrading: 'Overtrading',
  closed_early: 'Closed Early',
  held_long: 'Held Too Long',
  lucky_move: 'Lucky Move',
  clean_setup: 'Clean Setup',
};

const MOOD_LABELS = {
  calm: '😌 Calm',
  confident: '💪 Confident',
  nervous: '😰 Nervous',
  greedy: '🤑 Greedy',
  revenge: '😤 Revenge',
};

export default function TradeRow({ trade, onDelete }) {
  const navigate = useNavigate();
  const isProfit = trade.result_type === 'profit';

  let dateStr = trade.trade_date;
  try {
    dateStr = format(new Date(trade.trade_date + 'T00:00:00'), 'MMM dd, yyyy');
  } catch (_) {}

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-bg-border hover:border-subtle hover:bg-bg-hover transition-all duration-200 group">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${isProfit ? 'bg-profit-dim' : 'bg-loss-dim'}`}>
        {isProfit
          ? <TrendingUp size={16} className="text-profit" />
          : <TrendingDown size={16} className="text-loss" />
        }
      </div>

      {/* Instrument + Side */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm font-mono">{trade.instrument}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded
            ${trade.side === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
            {trade.side}
          </span>
          {trade.reason_tag && (
            <span className="text-xs text-muted bg-bg-secondary px-2 py-0.5 rounded border border-bg-border">
              {REASON_LABELS[trade.reason_tag] || trade.reason_tag}
            </span>
          )}
          {trade.mood_tag && (
            <span className="text-xs text-muted">{MOOD_LABELS[trade.mood_tag] || trade.mood_tag}</span>
          )}
        </div>
        {trade.note && (
          <p className="text-muted text-xs mt-1 truncate max-w-xs">{trade.note}</p>
        )}
      </div>

      {/* Date */}
      <div className="text-muted text-xs text-right hidden sm:block flex-shrink-0 w-28">
        {dateStr}
      </div>

      {/* Amount */}
      <div className={`text-base font-bold font-mono flex-shrink-0 w-28 text-right
        ${isProfit ? 'text-profit' : 'text-loss'}`}>
        {isProfit ? '+' : '-'}${trade.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => navigate(`/add-trade/${trade.id}`)}
          className="p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(trade.id)}
          className="p-2 rounded-lg text-muted hover:text-loss hover:bg-loss-dim transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
