import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuditLog } from '@/types';
import { formatDateTime } from '@/lib/format';
import { Activity, Search } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => {
      if (data) setLogs(data as AuditLog[]);
    });
  }, []);

  const entities = ['all', ...Array.from(new Set(logs.map((l) => l.entity)))];

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.admin_email.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase());
    const matchEntity = entityFilter === 'all' || l.entity === entityFilter;
    return matchSearch && matchEntity;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-dark-400 mt-1">Track all admin modifications to the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="input-field sm:w-48">
          {entities.map((e) => (
            <option key={e} value={e}>{e === 'all' ? 'All Entities' : e}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-dark-400 text-xs uppercase border-b border-dark-700">
                <th className="text-left px-4 py-3">Admin</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Entity</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Changes</th>
                <th className="text-right px-4 py-3">Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((log) => (
                  <tr key={log.id} className="border-b border-dark-700/30 hover:bg-dark-800/50">
                    <td className="px-4 py-3 text-dark-200 text-sm">{log.admin_email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge capitalize ${
                        log.action === 'create' ? 'badge-success' :
                        log.action === 'delete' ? 'badge-danger' : 'bg-brand-500/10 text-brand-400'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{log.entity}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {log.previous_value && log.new_value ? (
                        <div className="text-xs space-y-1 max-w-md">
                          {Object.keys(log.new_value).slice(0, 3).map((key) => {
                            const prev = (log.previous_value as Record<string, unknown>)?.[key];
                            const next = (log.new_value as Record<string, unknown>)?.[key];
                            if (prev === next) return null;
                            return (
                              <div key={key} className="text-dark-400">
                                <span className="text-dark-500">{key}:</span>{' '}
                                <span className="text-danger-400 line-through">{String(prev).slice(0, 30)}</span>{' '}
                                →{' '}
                                <span className="text-success-400">{String(next).slice(0, 30)}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-dark-500 text-xs">{log.action === 'create' ? 'Created' : 'Deleted'}</span>
                      )}
                    </td>
                    <td className="text-right px-4 py-3 text-dark-400 text-xs">{formatDateTime(log.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-dark-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No audit logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
