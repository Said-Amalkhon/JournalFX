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
    <div className="flex items-center gap-3 px-3 sm:px-5 py-3 sm:py-4 rounded-xl border border-bg-border hover:border-subtle hover:bg-bg-hover transition-all duration-200 group">
      {/* Icon */}
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${isProfit ? 'bg-profit-dim' : 'bg-loss-dim'}`}>
        {isProfit
          ? <TrendingUp size={15} className="text-profit" />
          : <TrendingDown size={15} className="text-loss" />
        }
      </div>

      {/* Instrument + Side */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-white text-sm font-mono">{trade.instrument}</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded
            ${trade.side === 'BUY' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'}`}>
            {trade.side}
          </span>
          {trade.reason_tag && (
            <span className="hidden sm:inline text-xs text-muted bg-bg-secondary px-2 py-0.5 rounded border border-bg-border">
              {REASON_LABELS[trade.reason_tag] || trade.reason_tag}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-muted text-xs sm:hidden">{dateStr}</p>
          {trade.note && (
            <p className="text-muted text-xs truncate max-w-[160px] sm:max-w-xs hidden sm:block">{trade.note}</p>
          )}
        </div>
      </div>

      {/* Date — desktop only */}
      <div className="text-muted text-xs text-right hidden sm:block flex-shrink-0 w-28">
        {dateStr}
      </div>

      {/* Amount */}
      <div className={`text-sm sm:text-base font-bold font-mono flex-shrink-0 text-right
        ${isProfit ? 'text-profit' : 'text-loss'}`}>
        {isProfit ? '+' : '-'}${trade.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Actions — always visible on mobile, hover on desktop */}
      <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => navigate(`/add-trade/${trade.id}`)}
          className="p-1.5 sm:p-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
          title="Edit"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(trade.id)}
          className="p-1.5 sm:p-2 rounded-lg text-muted hover:text-loss hover:bg-loss-dim transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
