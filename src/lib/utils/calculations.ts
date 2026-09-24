export interface CalculationItem {
  qty: number | string;
  price: number | string;
}

export interface CalculationInput {
  items?: CalculationItem[];
  discount?: number | string;
  taxRate?: number | string;
  deposit?: number | string;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  netBeforeTax: number;
  taxAmount: number;
  grossTotal: number;
  depositAmount: number;
  totalToPay: number;
}

export function calculateDocumentTotals(doc: CalculationInput): CalculationResult {
  const items = doc.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0),
    0
  );

  const discountRate = Number(doc.discount || 0);
  const discountAmount = (subtotal * discountRate) / 100;
  const netBeforeTax = subtotal - discountAmount;

  const taxRate = Number(doc.taxRate || 0);
  const taxAmount = (netBeforeTax * taxRate) / 100;

  const grossTotal = netBeforeTax + taxAmount;
  const depositAmount = Number(doc.deposit || 0);

  const totalToPay = Math.max(0, grossTotal - depositAmount);

  return {
    subtotal: Math.round(subtotal),
    discountAmount: Math.round(discountAmount),
    netBeforeTax: Math.round(netBeforeTax),
    taxAmount: Math.round(taxAmount),
    grossTotal: Math.round(grossTotal),
    depositAmount: Math.round(depositAmount),
    totalToPay: Math.round(totalToPay),
  };
}
