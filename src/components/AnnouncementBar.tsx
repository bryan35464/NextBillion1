import { useState, useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Megaphone, X, AlertTriangle, Wrench } from 'lucide-react';

export default function AnnouncementBar() {
  const { settings, announcements } = useSettings();
  const [visible, setVisible] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (!visible) return null;

  if (settings?.maintenance_mode) {
    return (
      <div className="bg-danger-500/20 border-b border-danger-500/30 px-4 py-2.5 text-center">
        <div className="flex items-center justify-center gap-2 text-danger-400 text-sm font-medium">
          <Wrench className="w-4 h-4" />
          {settings.maintenance_message}
        </div>
      </div>
    );
  }

  if (announcements.length === 0) return null;

  const current = announcements[currentIdx];
  if (!current) return null;

  const typeStyles: Record<string, string> = {
    info: 'bg-brand-500/15 border-brand-500/30 text-brand-300',
    success: 'bg-success-500/15 border-success-500/30 text-success-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    error: 'bg-danger-500/15 border-danger-500/30 text-danger-400',
  };

  return (
    <div className={`border-b px-4 py-2.5 ${typeStyles[current.type] || typeStyles.info}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
        <Megaphone className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium">{current.title}</span>
        <span className="opacity-70 hidden sm:inline">— {current.content}</span>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
