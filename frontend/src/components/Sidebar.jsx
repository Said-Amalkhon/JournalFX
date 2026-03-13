import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Target,
  TrendingUp,
} from 'lucide-react';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/trades', icon: List, label: 'Trade History' },
  { to: '/add-trade', icon: PlusCircle, label: 'Add Trade' },
  { to: '/weekly-target', icon: Target, label: 'Weekly Target' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-bg-border flex flex-col z-40">
      {/* Logo */}
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

      {/* Navigation */}
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
                <Icon
                  size={18}
                  className={isActive ? 'text-accent' : 'text-muted group-hover:text-white transition-colors'}
                />
                <span className="font-medium text-sm">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
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
  );
}
