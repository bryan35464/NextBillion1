export const SUPPORT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const SUPPORT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const SUPPORT_MESSAGE_MAX_LENGTH = 2000;
export const SUPPORT_ADMIN_ONLINE_WINDOW_MS = 90_000;

const INDIAN_MOBILE_PATTERN = /^[6-9][0-9]{9}$/;

export function normalizeIndianMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (!INDIAN_MOBILE_PATTERN.test(digits)) return null;
  return `+91${digits}`;
}

export function validateCustomerName(raw: string): string | null {
  const name = raw.trim();
  if (name.length < 2) return 'Please enter your full name.';
  if (name.length > 100) return 'Name must be 100 characters or fewer.';
  return null;
}

export function validateCustomerPhone(raw: string): string | null {
  if (normalizeIndianMobile(raw) === null) {
    return 'Enter a valid 10-digit Indian mobile number starting with 6 to 9.';
  }
  return null;
}

export function validateImageFile(file: File): string | null {
  if (!(SUPPORT_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Only JPG, JPEG, PNG and WEBP images are supported.';
  }
  if (file.size === 0) {
    return 'This image appears to be empty.';
  }
  return null;
}

export function validateMessageBody(raw: string): string | null {
  const body = raw.trim();
  if (body.length === 0) return 'Type a message first.';
  if (body.length > SUPPORT_MESSAGE_MAX_LENGTH) {
    return `Messages must be ${SUPPORT_MESSAGE_MAX_LENGTH} characters or fewer.`;
  }
  return null;
}
