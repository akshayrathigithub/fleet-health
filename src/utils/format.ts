import { DAY_MS, HOUR_MS, MINUTE_MS } from '@/constants';

/** "2 min ago", "3 h ago", "6 days ago". `now` is injectable for tests. */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const elapsed = Math.max(0, now.getTime() - new Date(iso).getTime());

  if (elapsed < MINUTE_MS) return 'just now';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} min ago`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)} h ago`;

  const days = Math.floor(elapsed / DAY_MS);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** "14 Mar 2022" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
