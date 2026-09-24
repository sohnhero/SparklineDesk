import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate, initials, addDays } from './format';
import { TYPE_META, STATUS_MAP } from '@/domains/documents/types';

describe('Format utilities', () => {
  it('formats money in FCFA without decimals', () => {
    const formatted = formatMoney(380000, 'FCFA');
    expect(formatted).toContain('380 000');
    expect(formatted).toContain('FCFA');
  });

  it('formats dates in fr-FR format', () => {
    const formatted = formatDate('2026-09-05');
    expect(formatted).toBe('05/09/2026');
  });

  it('calculates initials from names correctly', () => {
    expect(initials('FIDÈLE SARL')).toBe('FS');
    expect(initials('Sparkline')).toBe('S');
    expect(initials('')).toBe('CL');
  });

  it('adds days to date strings correctly', () => {
    expect(addDays('2026-09-05', 15)).toBe('2026-09-20');
  });

  it('has valid metadata for all 10 document types', () => {
    const keys = Object.keys(TYPE_META);
    expect(keys).toHaveLength(10);
    expect(TYPE_META.quote.prefix).toBe('DEV');
    expect(TYPE_META.invoice.prefix).toBe('FAC');
    expect(TYPE_META.proposal.prefix).toBe('PROP');
  });

  it('maps database statuses to French labels', () => {
    expect(STATUS_MAP.DRAFT).toBe('Brouillon');
    expect(STATUS_MAP.SENT).toBe('Envoyé');
    expect(STATUS_MAP.ACCEPTED).toBe('Accepté');
    expect(STATUS_MAP.PAID).toBe('Payé');
  });
});
