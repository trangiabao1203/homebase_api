import { isEmail } from '@joktec/core';

export function hideValue(value: string): string {
  if (!value) return value;

  if (isEmail(value)) {
    const [name, domain] = value.split('@');
    const [first, last] = name.split('.');
    return `${first[0]}${'*'.repeat(first.length - 1)}.${last[0]}${'*'.repeat(last.length - 1)}@${domain}`;
  }

  if (value.length < 8) {
    return value.slice(0, -Math.floor(value.length / 2)).replace(/./g, '*') + value.slice(-Math.ceil(value.length / 2));
  }
  return value.slice(0, -4).replace(/./g, '*') + value.slice(-4);
}
