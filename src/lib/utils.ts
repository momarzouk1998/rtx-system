import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * تنسيق الأرقام والمبالغ المالية بالأرقام الإنجليزية دائماً (en-US)
 */
export function formatNumber(
  val: number | string | null | undefined,
  maximumFractionDigits = 2
): string {
  if (val === null || val === undefined || val === '') return '0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US', {
    maximumFractionDigits,
  });
}

/**
 * يحوّل أي تاريخ (Date أو ISO string) لصيغة YYYY-MM-DD
 * المطلوبة لقيمة <input type="date">. يرجّع تاريخ اليوم كـ fallback.
 * مهم: نستخدم toISOString عشان نتجنّب مشاكل الـ timezone في الـ input.
 */
export function toDateInputValue(date: Date | string | null | undefined): string {
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

/** تاريخ اليوم بصيغة YYYY-MM-DD — للاستخدام كـ default في فورمات الإضافة */
export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
