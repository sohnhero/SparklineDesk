export function formatMoney(
  value: number | string | null | undefined,
  currency: string = 'FCFA'
): string {
  const num = Number(value || 0);
  return (
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
      .format(num)
      .replace(/\u202f/g, ' ') +
    ' ' +
    currency
  );
}

export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value + (value.length === 10 ? 'T12:00:00' : ''));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: string | Date | null | undefined): string {
  const d = parseDate(value);
  return d
    ? new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(d)
    : '—';
}

export function initials(name: string = ''): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0])
      .join('')
      .toUpperCase() || 'CL'
  );
}

export function uid(): string {
  return (
    Math.random().toString(36).slice(2, 9) +
    Date.now().toString(36).slice(-5)
  );
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
