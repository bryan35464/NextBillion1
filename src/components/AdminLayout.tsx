import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
  LayoutDashboard,
  Settings,
  Coins,
  FileText,
  Users,
  Activity,
  Shield,
  Megaphone,
  HelpCircle,
  Newspaper,
  LogOut,
  Menu,
  X,
  Eye,
  Bell,
  SlidersHorizontal,
  MessageCircle,
} from 'lucide-react';

const adminLinks = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Content', path: '/admin/content', icon: FileText },
  { label: 'Markets', path: '/admin/markets', icon: Coins },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
  { label: 'Blog', path: '/admin/blog', icon: Newspaper },
  { label: 'Audit Logs', path: '/admin/audit', icon: Activity },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Support', path: '/admin/support', icon: MessageCircle },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Control Panel', path: '/admin/control-panel', icon: SlidersHorizontal },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = (path: string) => (window.location.href = path);
  const { profile, signOut } = useAuth();
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-dark-900 border-r border-dark-700 flex flex-col transition-transform duration-300`}
      >
        <div className="p-5 border-b border-dark-700">
          <Link to="/" className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm block">
                {settings?.site_name?.split(' ')[0] || 'Next'} BT
              </span>
              <span className="text-xs text-brand-400">Admin Panel</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-3 border-t border-dark-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-300 hover:bg-dark-800 hover:text-white transition-all mb-1"
          >
            <Eye className="w-4 h-4" /> View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger-400 hover:bg-danger-500/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-dark-200 hover:text-white p-2"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-400" />
              <span className="text-white font-semibold text-sm hidden sm:block">
                {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'} Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-dark-800 border border-dark-600 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-sm text-dark-200 hidden sm:block">
                {profile?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
