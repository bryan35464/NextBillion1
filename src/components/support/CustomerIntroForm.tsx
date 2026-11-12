import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { createConversation } from '@/lib/supportApi';
import {
  normalizeIndianMobile,
  validateCustomerName,
  validateCustomerPhone,
} from '@/lib/supportValidation';
import type { SupportConversation } from '@/types/support';

interface CustomerIntroFormProps {
  customerId: string;
  onCreated: (conversation: SupportConversation) => void;
}

export function CustomerIntroForm({ customerId, onCreated }: CustomerIntroFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nameError = validateCustomerName(name);
    if (nameError) return setError(nameError);
    const phoneError = validateCustomerPhone(phone);
    if (phoneError) return setError(phoneError);
    const normalizedPhone = normalizeIndianMobile(phone);
    if (!normalizedPhone) return setError(phoneError);

    setSubmitting(true);
    setError(null);
    try {
      const conversation = await createConversation(customerId, name.trim(), normalizedPhone);
      onCreated(conversation);
    } catch {
      setError('We could not start your chat. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in flex flex-1 flex-col gap-5 overflow-y-auto p-6">
      <div>
        <h3 className="text-lg font-semibold text-dark-50">Start a conversation</h3>
        <p className="mt-1 text-sm leading-relaxed text-dark-400">
          Tell us who you are so our support team can help you faster.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-dark-300">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            autoComplete="name"
            className="input-field"
            placeholder="Your full name"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-dark-300">Mobile number</span>
          <div className="flex overflow-hidden rounded-lg border border-dark-700 bg-dark-800 focus-within:border-brand-500">
            <span className="flex items-center border-r border-dark-700 px-3 text-sm text-dark-300">+91</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel-national"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-dark-50 outline-none placeholder:text-dark-500"
              placeholder="10-digit mobile number"
            />
          </div>
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger-500/30 bg-danger-500/10 px-3 py-2 text-xs text-danger-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary mt-auto flex w-full items-center justify-center gap-2">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Start chat
      </button>
    </form>
  );
}
