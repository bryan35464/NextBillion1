import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';
import { formatDateTime } from '@/lib/format';
import { Search, Shield, Ban, CheckCircle2, XCircle, Edit3, X, Save, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('user_profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setUsers(data as UserProfile[]);
    });
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_id.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const startEdit = (user: UserProfile) => {
    setEditing(user);
    setFormData(user);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    await supabase.from('user_profiles').update({
      role: formData.role,
      verification_status: formData.verification_status,
      trading_enabled: formData.trading_enabled,
      account_limit_deposit: formData.account_limit_deposit,
      account_limit_withdrawal: formData.account_limit_withdrawal,
    }).eq('id', editing.id);
    setUsers((prev) => prev.map((u) => (u.id === editing.id ? { ...u, ...formData } as UserProfile : u)));
    setSaving(false);
    setEditing(null);
  };

  const roles = ['user', 'support', 'admin', 'super_admin'];
  const verificationStatuses = ['unverified', 'pending', 'verified', 'rejected'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-dark-400 mt-1">Manage platform users and their permissions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field sm:w-48">
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
                <th className="text-left px-4 py-3">User</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Verification</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">Trading</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.full_name || 'Unnamed'}</p>
                          <p className="text-dark-400 text-xs">{u.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge capitalize ${
                        u.role === 'super_admin' ? 'bg-brand-500/20 text-brand-400' :
                        u.role === 'admin' ? 'bg-accent-500/20 text-accent-400' :
                        u.role === 'support' ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-600 text-dark-200'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge capitalize ${
                        u.verification_status === 'verified' ? 'badge-success' :
                        u.verification_status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                        u.verification_status === 'rejected' ? 'badge-danger' : 'bg-dark-600 text-dark-200'
                      }`}>
                        {u.verification_status}
                      </span>
                    </td>
                    <td className="text-center px-4 py-3 hidden lg:table-cell">
                      {u.trading_enabled ? (
                        <CheckCircle2 className="w-4 h-4 text-success-400 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-danger-400 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-dark-400 text-xs hidden lg:table-cell">{formatDateTime(u.created_at)}</td>
                    <td className="text-right px-4 py-3">
                      <button onClick={() => startEdit(u)} className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-300 hover:text-brand-400 transition-all">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-dark-400">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditing(null)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
              <button onClick={() => setEditing(null)} className="text-dark-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Name</label>
                <input value={formData.full_name || ''} disabled className="input-field opacity-60" />
              </div>

              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserProfile['role'] })} className="input-field">
                  {roles.map((r) => (
                    <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-dark-200 mb-1.5 block">Verification Status</label>
                <select value={formData.verification_status} onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })} className="input-field">
                  {verificationStatuses.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trading_enabled || false}
                  onChange={(e) => setFormData({ ...formData, trading_enabled: e.target.checked })}
                  className="rounded border-dark-600 bg-dark-800 text-brand-500"
                />
                Trading Enabled
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Deposit Limit</label>
                  <input
                    type="number"
                    value={formData.account_limit_deposit || 0}
                    onChange={(e) => setFormData({ ...formData, account_limit_deposit: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm text-dark-200 mb-1.5 block">Withdrawal Limit</label>
                  <input
                    type="number"
                    value={formData.account_limit_withdrawal || 0}
                    onChange={(e) => setFormData({ ...formData, account_limit_withdrawal: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setEditing(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
