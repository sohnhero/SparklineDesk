import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentStatus } from '@prisma/client';
import { calculateDocumentTotals } from '@/lib/utils/calculations';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const { invoiceId, amount, method, reference, note } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'ID de facture manquant' }, { status: 400 });
    }

    const invoice = await prisma.document.findUnique({
      where: { id: invoiceId, organizationId: user.organizationId },
      include: { lines: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    const totals = calculateDocumentTotals({
      items: invoice.lines.map((l) => ({ qty: Number(l.quantity), price: Number(l.unitPrice) })),
      discount: Number(invoice.discountPercent),
      taxRate: Number(invoice.taxRate),
      deposit: Number(invoice.depositAmount),
    });

    const paymentAmount = amount !== undefined ? Number(amount) : totals.grossTotal;

    await prisma.$transaction(async (tx) => {
      // Create payment
      await tx.payment.create({
        data: {
          invoiceId,
          amount: paymentAmount,
          method: method || 'Virement bancaire',
          reference: reference || null,
          note: note || 'Règlement enregistré',
          createdById: user.id,
        },
      });

      // Update invoice status to PAID
      await tx.document.update({
        where: { id: invoiceId },
        data: {
          status: DocumentStatus.PAID,
          paidAt: new Date(),
          updatedById: user.id,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          organizationId: user.organizationId,
          actorId: user.id,
          entityType: 'Document',
          entityId: invoiceId,
          action: 'PAYMENT_RECORDED',
          metadata: { amount: paymentAmount, reference: invoice.reference },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’enregistrement du paiement' },
      { status: 500 }
    );
  }
}
