import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';
import { timeAgo } from '@/lib/format';
import { Bell, Send, Loader2 } from 'lucide-react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setNotifications(data as Notification[]);
    });
  }, []);

  const handleSend = async () => {
    if (!title || !message) return;
    setSending(true);
    await supabase.from('notifications').insert({
      title,
      message,
      type,
      is_read: false,
    });
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      if (data) setNotifications(data as Notification[]);
    });
    setTitle('');
    setMessage('');
    setSending(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-dark-400 mt-1">Send platform-wide notifications to users</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Compose Notification</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" className="input-field" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message" rows={3} className="input-field resize-y" />
            </div>
            <div>
              <label className="text-sm text-dark-200 mb-1.5 block">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <button onClick={handleSend} disabled={!title || !message || sending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Notification
            </button>
          </div>
        </div>

        {/* History */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Notifications</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <Bell className={`w-4 h-4 ${
                      n.type === 'success' ? 'text-success-400' :
                      n.type === 'warning' ? 'text-amber-400' :
                      n.type === 'error' ? 'text-danger-400' : 'text-brand-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <p className="text-dark-400 text-xs">{n.message}</p>
                    <p className="text-dark-500 text-xs mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-dark-400 text-sm">No notifications sent yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
