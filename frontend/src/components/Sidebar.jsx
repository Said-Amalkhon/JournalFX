import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Target,
  TrendingUp,
} from 'lucide-react';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', short: 'Home' },
  { to: '/trades', icon: List, label: 'Trade History', short: 'History' },
  { to: '/add-trade', icon: PlusCircle, label: 'Add Trade', short: 'Add' },
  { to: '/weekly-target', icon: Target, label: 'Weekly Target', short: 'Target' },
];

export default function Sidebar() {
  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-bg-border flex-col z-40">
        <div className="px-6 py-7 border-b border-bg-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">Journal</span>
              <span className="font-bold text-accent text-lg tracking-tight">FX</span>
            </div>
          </div>
          <p className="text-muted text-xs mt-1.5 ml-11">Trade smarter. Reflect deeper.</p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-accent/15 text-white border border-accent/20 shadow-glow'
                  : 'text-muted hover:text-white hover:bg-bg-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-accent' : 'text-muted group-hover:text-white transition-colors'} />
                  <span className="font-medium text-sm">{label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-bg-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              TR
            </div>
            <div>
              <p className="text-white text-sm font-medium">Trader</p>
              <p className="text-muted text-xs">Pro Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-bg-secondary border-b border-bg-border flex items-center px-5 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Journal<span className="text-accent">FX</span>
          </span>
        </div>
      </header>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-bg-border grid grid-cols-4">
        {nav.map(({ to, icon: Icon, short }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center py-3 gap-1 transition-colors
              ${isActive ? 'text-accent' : 'text-muted'}`
            }
          >
            {({ isActive }) => (
              <>
                {to === '/add-trade' ? (
                  <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shadow-glow -mt-5 border-4 border-bg-primary">
                    <Icon size={19} className="text-white" />
                  </div>
                ) : (
                  <Icon size={20} />
                )}
                <span className="text-[10px] font-medium leading-none">{short}</span>
                {isActive && to !== '/add-trade' && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-accent" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
