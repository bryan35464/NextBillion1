import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
  Menu,
  X,
  Search,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Wallet,
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
} from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, isAdmin } = useAuth();
  const { settings, assets } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Markets', path: '/markets' },
    { label: 'Trade', path: '/trade/BTC_USDT' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Wallet', path: '/wallet' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="hidden sm:flex flex-col leading-none">
                  <span className="text-white font-bold text-lg">
                    {settings?.site_name?.split(' ')[0] || 'Next'}
                    <span className="text-brand-400">{settings?.site_name?.split(' ')[1]?.charAt(0)?.toUpperCase() || 'B'}T</span>
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-dark-400 group-hover:text-dark-300 transition-colors">
                    Crypto Trading Company
                  </span>
                </span>
              </Link>

              <div className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden sm:flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 transition-all group"
              >
                <Search className="w-4 h-4 text-dark-400 group-hover:text-brand-400" />
                <span className="text-dark-400 text-sm">Search...</span>
                <kbd className="text-xs text-dark-500 bg-dark-700 px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>


              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl px-3 py-2 transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                      {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className="w-4 h-4 text-dark-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 card rounded-xl shadow-2xl py-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-dark-700">
                          <p className="text-sm text-white font-medium truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-dark-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/portfolio"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          to="/wallet"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors"
                        >
                          <Wallet className="w-4 h-4" /> Wallet
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-700 hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-400 hover:bg-dark-700 transition-colors"
                          >
                            <Shield className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-danger-400 hover:bg-dark-700 w-full transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm">
                    Sign In
                  </Link>
                  <Link to="/signup" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden text-dark-200 hover:text-white p-2"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-dark-900 border-b border-dark-700 p-4 animate-fade-in z-40">
            <div className="max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search assets, markets, pages..."
                autoFocus
                className="input-field"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setSearchOpen(false);
                }}
              />
              <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                {assets.slice(0, 6).map((asset) => (
                  <Link
                    key={asset.id}
                    to={`/trade/${asset.symbol}_USDT`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between px-3 py-2 hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-brand-400">
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <p className="text-sm text-white">{asset.name}</p>
                        <p className="text-xs text-dark-400">{asset.symbol}/USDT</p>
                      </div>
                    </div>
                    <span className="text-sm text-dark-300">
                      ${asset.price.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {mobileOpen && (
          <div className="lg:hidden bg-dark-900 border-t border-dark-700 animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-brand-500/10 text-brand-400'
                      : 'text-dark-200 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-3 space-y-2 border-t border-dark-700">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="btn-secondary w-full text-center text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full text-center text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
