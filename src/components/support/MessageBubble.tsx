import { useEffect, useState } from 'react';
import { Check, CheckCheck, ImageOff } from 'lucide-react';
import { getImageUrl } from '@/lib/supportApi';
import { ANVI_DISPLAY_NAME } from '@/lib/supportIdentity';
import type { SupportMessage, SupportSenderRole } from '@/types/support';

interface MessageBubbleProps {
  message: SupportMessage;
  viewerRole: SupportSenderRole;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function SignedImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getImageUrl(path)
      .then((signed) => {
        if (!cancelled) setUrl(signed);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (failed) {
    return (
      <div className="flex h-32 w-48 items-center justify-center gap-2 rounded-lg bg-dark-800 text-xs text-dark-400">
        <ImageOff className="h-4 w-4" /> Image unavailable
      </div>
    );
  }
  if (!url) {
    return <div className="h-32 w-48 animate-pulse rounded-lg bg-dark-800" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg">
      <img src={url} alt="Shared attachment" className="max-h-64 w-full max-w-[240px] object-cover transition-transform duration-200 hover:scale-[1.02]" />
    </a>
  );
}

export function MessageBubble({ message, viewerRole }: MessageBubbleProps) {
  const isOwn = message.sender_role === viewerRole;
  const isAnviMessage = message.sender_role === 'admin';

  return (
    <div className={`flex w-full animate-slide-up ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {isAnviMessage && (
          <span className="mb-1 px-1 text-xs font-medium text-dark-400">{ANVI_DISPLAY_NAME}</span>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? 'rounded-br-md bg-brand-600 text-white'
              : 'rounded-bl-md border border-dark-700 bg-dark-800 text-dark-100'
          }`}
        >
          {message.image_path && <SignedImage path={message.image_path} />}
          {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
        </div>
        <div className="mt-1 flex items-center gap-1 px-1 text-[11px] text-dark-400">
          <span>{formatTime(message.created_at)}</span>
          {isOwn &&
            (message.read_at ? (
              <CheckCheck className="h-3.5 w-3.5 text-success-400" aria-label="Read" />
            ) : (
              <Check className="h-3.5 w-3.5" aria-label="Delivered" />
            ))}
        </div>
      </div>
    </div>
  );
}
