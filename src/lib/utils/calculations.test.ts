import { describe, it, expect } from 'vitest';
import { calculateDocumentTotals } from './calculations';

describe('calculateDocumentTotals', () => {
  it('calculates subtotal correctly with multiple line items', () => {
    const res = calculateDocumentTotals({
      items: [
        { qty: 1, price: 80000 },
        { qty: 3, price: 100000 },
      ],
      discount: 0,
      taxRate: 0,
      deposit: 0,
    });

    expect(res.subtotal).toBe(380000);
    expect(res.discountAmount).toBe(0);
    expect(res.netBeforeTax).toBe(380000);
    expect(res.taxAmount).toBe(0);
    expect(res.grossTotal).toBe(380000);
    expect(res.depositAmount).toBe(0);
    expect(res.totalToPay).toBe(380000);
  });

  it('applies discount percentage properly before tax', () => {
    const res = calculateDocumentTotals({
      items: [{ qty: 1, price: 100000 }],
      discount: 10, // 10%
      taxRate: 18, // 18% VAT
      deposit: 0,
    });

    expect(res.subtotal).toBe(100000);
    expect(res.discountAmount).toBe(10000);
    expect(res.netBeforeTax).toBe(90000);
    expect(res.taxAmount).toBe(16200); // 18% of 90000
    expect(res.grossTotal).toBe(106200);
    expect(res.totalToPay).toBe(106200);
  });

  it('deducts deposit amount correctly from gross total', () => {
    const res = calculateDocumentTotals({
      items: [{ qty: 2, price: 200000 }],
      discount: 0,
      taxRate: 0,
      deposit: 150000,
    });

    expect(res.subtotal).toBe(400000);
    expect(res.grossTotal).toBe(400000);
    expect(res.depositAmount).toBe(150000);
    expect(res.totalToPay).toBe(250000);
  });

  it('ensures remaining to pay cannot be negative if deposit exceeds total', () => {
    const res = calculateDocumentTotals({
      items: [{ qty: 1, price: 50000 }],
      discount: 0,
      taxRate: 0,
      deposit: 70000,
    });

    expect(res.totalToPay).toBe(0);
  });
});
