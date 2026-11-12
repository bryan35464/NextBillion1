import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { validateImageFile, validateMessageBody, SUPPORT_MESSAGE_MAX_LENGTH } from '@/lib/supportValidation';

interface ChatComposerProps {
  disabled?: boolean;
  onSendText: (body: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
}

export function ChatComposer({ disabled, onSendText, onSendImage }: ChatComposerProps) {
  const [body, setBody] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clearAttachment = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const fileError = validateImageFile(selected);
    if (fileError) {
      setError(fileError);
      event.target.value = '';
      return;
    }
    setError(null);
    setFile(selected);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending || disabled) return;

    setSending(true);
    setError(null);
    try {
      if (file) {
        await onSendImage(file);
        clearAttachment();
      }
      if (body.trim()) {
        const bodyError = validateMessageBody(body);
        if (bodyError) {
          setError(bodyError);
          return;
        }
        await onSendText(body);
        setBody('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const canSend = !disabled && !sending && (file !== null || body.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="border-t border-dark-700 bg-dark-900/80 p-3">
      {previewUrl && (
        <div className="animate-slide-up mb-3 flex items-center gap-3 rounded-xl border border-dark-700 bg-dark-800 p-2">
          <img src={previewUrl} alt="Selected attachment" className="h-14 w-14 rounded-lg object-cover" />
          <p className="flex-1 truncate text-xs text-dark-300">{file?.name}</p>
          <button type="button" onClick={clearAttachment} className="rounded-full p-1 text-dark-400 transition-colors hover:bg-dark-700 hover:text-dark-100" aria-label="Remove attachment">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mb-2 text-xs text-danger-300">{error}</p>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-dark-700 text-dark-300 transition-colors hover:border-brand-500 hover:text-brand-300 disabled:opacity-40"
          aria-label="Attach an image"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit(event);
            }
          }}
          maxLength={SUPPORT_MESSAGE_MAX_LENGTH}
          rows={1}
          disabled={disabled}
          placeholder={disabled ? 'Chat is unavailable right now' : 'Type your message...'}
          className="input-field max-h-32 min-h-10 flex-1 resize-none py-2.5 text-sm"
          aria-label="Message"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="btn-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full p-0 disabled:opacity-40"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </form>
  );
}
