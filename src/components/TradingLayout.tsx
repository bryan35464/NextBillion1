import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/context/DashboardDataContext';
import {
  LayoutDashboard,
  CandlestickChart,
  Briefcase,
  Wallet,
  Landmark,
  ListOrdered,
  TrendingUp,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Markets', path: '/markets', icon: TrendingUp },
  { label: 'Positions', path: '/positions', icon: Briefcase },
  { label: 'Holdings', path: '/holdings', icon: Landmark },
  { label: 'Funds', path: '/wallet', icon: Wallet },
  { label: 'Orders', path: '/orders', icon: ListOrdered },
  { label: 'Trade', path: '/trade/BTC_USDT', icon: CandlestickChart },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', path: '/profile', icon: Settings },
];

export default function TradingLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { config } = useDashboardData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Desktop Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-60 h-screen bg-dark-900 border-r border-dark-700/50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-dark-700/50">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm block leading-tight">Crypto Trading</span>
              <span className="text-dark-400 text-xs">Company</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-500/12 text-brand-400 border border-brand-500/15'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-400 hover:bg-danger-500/10 transition-all w-full border border-transparent"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log Out
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-dark-900/90 backdrop-blur-xl border-b border-dark-700/50">
          {/* Price ticker row */}
          <div className="flex items-center gap-6 px-4 lg:px-6 py-2 border-b border-dark-700/30 text-sm overflow-x-auto no-scrollbar whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="text-dark-400 text-xs">BTC</span>
              <span className="text-white font-medium">₹{(config?.btc_price || 95000).toLocaleString('en-IN')}</span>
              <span className={`text-xs font-medium ${(config?.btc_change || 0) >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {(config?.btc_change || 0) >= 0 ? '+' : ''}{config?.btc_change?.toFixed(2) || '0.00'}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-dark-400 text-xs">ETH</span>
              <span className="text-white font-medium">₹{(config?.eth_price || 3500).toLocaleString('en-IN')}</span>
              <span className={`text-xs font-medium ${(config?.eth_change || 0) >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {(config?.eth_change || 0) >= 0 ? '+' : ''}{config?.eth_change?.toFixed(2) || '0.00'}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-dark-400 text-xs">SOL</span>
              <span className="text-white font-medium">₹{(config?.sol_price || 195.5).toLocaleString('en-IN')}</span>
              <span className={`text-xs font-medium ${(config?.sol_change || 0) >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
                {(config?.sol_change || 0) >= 0 ? '+' : ''}{config?.sol_change?.toFixed(2) || '0.00'}%
              </span>
            </div>
          </div>

          {/* Main header row */}
          <div className="flex items-center justify-between px-4 lg:px-6 h-14 gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-dark-200 hover:text-white p-1.5">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="relative flex-1 max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coins, pairs, charts..."
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-dark-400 focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs text-white font-medium">{dateStr}</span>
                <span className="text-xs text-dark-400">{timeStr} IST</span>
              </div>
              <button className="text-dark-300 hover:text-white p-2 rounded-lg hover:bg-dark-800 transition-all relative">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="text-dark-300 hover:text-white p-2 rounded-lg hover:bg-dark-800 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500" />
              </button>
              <Link to="/profile" className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg px-2.5 py-1.5 transition-all">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                  {config?.user_name?.charAt(0).toUpperCase() || 'T'}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-white text-xs font-medium">{config?.user_name || 'Trader'}</p>
                  <p className="text-dark-400 text-xs">{config?.kyc_status || 'Verified'}</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
