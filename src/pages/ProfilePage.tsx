import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Bell,
  Smartphone,
  Monitor,
  Tablet,
  LogOut,
  Camera,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications' | 'sessions';

export default function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(profile?.two_factor_enabled || false);
  const [notifSettings, setNotifSettings] = useState({
    emailNotifications: true,
    tradeAlerts: true,
    depositAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone);
      setCountry(profile.country);
      setAvatarUrl(profile.avatar_url);
      setTwoFactorEnabled(profile.two_factor_enabled);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await supabase
      .from('user_profiles')
      .update({ full_name: fullName, phone, country, avatar_url: avatarUrl })
      .eq('user_id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (!error) {
      setCurrentPassword('');
      setNewPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleToggle2FA = async () => {
    if (!user) return;
    const newValue = !twoFactorEnabled;
    setTwoFactorEnabled(newValue);
    await supabase
      .from('user_profiles')
      .update({ two_factor_enabled: newValue })
      .eq('user_id', user.id);
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'sessions', label: 'Sessions', icon: Monitor },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
        <p className="text-dark-400 mt-1">Manage your account and security settings</p>
      </div>

      {/* Profile Header */}
      <div className="card p-6 mb-6 flex items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-brand-500 hover:bg-brand-600 flex items-center justify-center cursor-pointer transition-all">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{fullName || 'User'}</h2>
          <p className="text-dark-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge capitalize ${
              profile?.verification_status === 'verified' ? 'badge-success' :
              profile?.verification_status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-600 text-dark-200'
            }`}>
              {profile?.verification_status || 'unverified'}
            </span>
            {profile?.role && profile.role !== 'user' && (
              <span className="badge bg-brand-500/10 text-brand-400 capitalize">{profile.role.replace('_', ' ')}</span>
            )}
            {twoFactorEnabled && (
              <span className="badge badge-success">
                <Shield className="w-3 h-3 mr-1" /> 2FA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar border-b border-dark-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'text-brand-400 border-brand-500' : 'text-dark-400 border-transparent hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {saved && (
        <div className="mb-4 bg-success-500/10 border border-success-500/30 rounded-xl px-4 py-3 text-sm text-success-400 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4" /> Saved successfully
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input value={user?.email || ''} disabled className="input-field pl-11 opacity-60" />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 0123" className="input-field pl-11" />
              </div>
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Country</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" className="input-field pl-11" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
            <button onClick={() => { setFullName(profile?.full_name || ''); setPhone(profile?.phone || ''); setCountry(profile?.country || ''); }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-brand-400" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="input-field pl-11 pr-11"
                  />
                  <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                    {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input-field pl-11"
                  />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={!newPassword} className="btn-primary disabled:opacity-50">
                Update Password
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-400" /> Two-Factor Authentication
                </h3>
                <p className="text-dark-400 text-sm mt-1">Add an extra layer of security to your account</p>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`relative w-14 h-7 rounded-full transition-all ${twoFactorEnabled ? 'bg-success-500' : 'bg-dark-600'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${twoFactorEnabled ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>
            {twoFactorEnabled && (
              <div className="mt-4 bg-dark-900/50 rounded-xl p-4 animate-fade-in">
                <p className="text-sm text-dark-200 mb-3">2FA is enabled. Use your authenticator app to generate codes.</p>
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-brand-400" />
                  <span className="text-sm text-white">Authenticator App</span>
                  <span className="badge badge-success ml-auto">Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card p-6 space-y-1">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive emails about your account activity' },
            { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Get notified when your orders are filled' },
            { key: 'depositAlerts', label: 'Deposit & Withdrawal Alerts', desc: 'Notifications for all fund movements' },
            { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security-related notifications' },
            { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotional offers and platform updates' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-dark-700/30 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-dark-400 text-xs">{item.desc}</p>
              </div>
              <button
                onClick={() => setNotifSettings((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                className={`relative w-14 h-7 rounded-full transition-all ${notifSettings[item.key as keyof typeof notifSettings] ? 'bg-brand-500' : 'bg-dark-600'}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all ${notifSettings[item.key as keyof typeof notifSettings] ? 'left-7' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="card p-6 space-y-3">
          <h3 className="text-white font-medium mb-4">Active Sessions</h3>
          {[
            { device: 'Chrome on Windows', icon: Monitor, location: 'New York, US', current: true, lastActive: 'Active now' },
            { device: 'Safari on iPhone', icon: Smartphone, location: 'New York, US', current: false, lastActive: '2 hours ago' },
            { device: 'Firefox on Linux', icon: Monitor, location: 'San Francisco, US', current: false, lastActive: '1 day ago' },
          ].map((session, i) => {
            const Icon = session.icon;
            return (
              <div key={i} className="flex items-center justify-between p-4 bg-dark-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-dark-300" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && <span className="badge badge-success">Current</span>}
                    </p>
                    <p className="text-dark-400 text-xs">{session.location} · {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-danger-400 hover:text-danger-300 text-sm">Revoke</button>
                )}
              </div>
            );
          })}

          <div className="pt-4 mt-4 border-t border-dark-700">
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-danger-400 hover:text-danger-300 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> Sign Out of All Sessions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
