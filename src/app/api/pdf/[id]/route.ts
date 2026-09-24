import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { jsPDF } from 'jspdf';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { formatMoney, formatDate } from '@/lib/utils/format';
import { TYPE_META, ENUM_TO_KEY, DocTypeKey } from '@/domains/documents/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const doc = await prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: {
        client: true,
        lines: { orderBy: { position: 'asc' } },
        sections: { orderBy: { position: 'asc' } },
        organization: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    }

    const typeKey = (ENUM_TO_KEY[doc.type] || 'quote') as DocTypeKey;
    const meta = TYPE_META[typeKey] || TYPE_META.quote;
    const isFinancial = meta.kind === 'financial';
    const currency = doc.currency || doc.organization.currency || 'FCFA';

    // Create jsPDF A4 document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [17, 17, 17]; // #111
    const orangeColor = [255, 122, 0]; // #ff7a00
    const grayColor = [115, 115, 115]; // #737373
    const lightBg = [247, 247, 244]; // #f7f7f4

    let y = 20;

    // Header Logo & Reference
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('SPARKLINE', 20, y);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text('DIGITAL SOLUTIONS', 20, y + 5);

    // Right-aligned Document Meta
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    pdf.text(meta.label.toUpperCase(), 190, y - 2, { align: 'right' });

    pdf.setFontSize(16);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(doc.reference, 190, y + 5, { align: 'right' });

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text(`Date : ${formatDate(doc.issueDate)}`, 190, y + 10, { align: 'right' });
    if (doc.dueDate) {
      pdf.text(`Échéance : ${formatDate(doc.dueDate)}`, 190, y + 15, { align: 'right' });
    }

    y += 28;

    // Orange Accent Line
    pdf.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
    pdf.rect(20, y, 12, 1.5, 'F');
    y += 7;

    // Document Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(doc.title, 20, y);
    y += 7;

    if (doc.intro) {
      pdf.setFontSize(9.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      const introLines = pdf.splitTextToSize(doc.intro, 170);
      pdf.text(introLines, 20, y);
      y += introLines.length * 5 + 4;
    }

    // Client Info Strip
    pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    pdf.roundedRect(20, y, 170, 22, 2, 2, 'F');

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text('À L’ATTENTION DE', 25, y + 6);
    pdf.text('COORDONNÉES', 110, y + 6);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(doc.client?.name || 'Client à renseigner', 25, y + 12);
    pdf.text(doc.client?.contactName || doc.client?.email || '—', 110, y + 12);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text(doc.client?.sector || '', 25, y + 17);
    pdf.text(doc.client?.address || doc.client?.phone || '', 110, y + 17);

    y += 30;

    if (isFinancial) {
      // Financial Table Header
      pdf.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      pdf.rect(20, y, 170, 7, 'F');

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      pdf.text('PRESTATION', 24, y + 5);
      pdf.text('QTÉ', 115, y + 5);
      pdf.text('PRIX UNITAIRE', 135, y + 5);
      pdf.text('TOTAL', 186, y + 5, { align: 'right' });

      y += 8;

      // Lines
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

      doc.lines.forEach((item) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.text(item.name, 24, y + 4);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(String(Number(item.quantity)), 115, y + 4);
        pdf.text(formatMoney(Number(item.unitPrice), currency), 135, y + 4);
        pdf.text(
          formatMoney(Number(item.quantity) * Number(item.unitPrice), currency),
          186,
          y + 4,
          { align: 'right' }
        );

        let itemHeight = 7;
        if (item.description) {
          pdf.setFontSize(7.5);
          pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
          const descLines = pdf.splitTextToSize(item.description, 80);
          pdf.text(descLines, 24, y + 9);
          itemHeight += descLines.length * 4;
          pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        }

        // Row border
        pdf.setDrawColor(230, 230, 225);
        pdf.line(20, y + itemHeight, 190, y + itemHeight);
        y += itemHeight + 2;
      });

      y += 5;

      // Totals Box
      const totals = calculateDocumentTotals({
        items: doc.lines.map((l) => ({ qty: Number(l.quantity), price: Number(l.unitPrice) })),
        discount: Number(doc.discountPercent),
        taxRate: Number(doc.taxRate),
        deposit: Number(doc.depositAmount),
      });

      const totalX = 120;
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
      pdf.text('Sous-total', totalX, y);
      pdf.text(formatMoney(totals.subtotal, currency), 186, y, { align: 'right' });
      y += 5;

      if (Number(doc.discountPercent) > 0) {
        pdf.text(`Remise (${Number(doc.discountPercent)}%)`, totalX, y);
        pdf.text(`− ${formatMoney(totals.discountAmount, currency)}`, 186, y, { align: 'right' });
        y += 5;
      }

      if (Number(doc.taxRate) > 0) {
        pdf.text(`TVA (${Number(doc.taxRate)}%)`, totalX, y);
        pdf.text(formatMoney(totals.taxAmount, currency), 186, y, { align: 'right' });
        y += 5;
      }

      if (Number(doc.depositAmount) > 0) {
        pdf.text('Acompte payé', totalX, y);
        pdf.text(`− ${formatMoney(totals.depositAmount, currency)}`, 186, y, { align: 'right' });
        y += 5;
      }

      pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.line(totalX, y, 190, y);
      y += 5;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      pdf.text('Total', totalX, y);
      pdf.text(formatMoney(totals.totalToPay, currency), 186, y, { align: 'right' });
      y += 12;

      // Conditions
      if (doc.conditions) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Conditions particulières', 20, y);
        y += 5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        const condLines = pdf.splitTextToSize(doc.conditions, 170);
        pdf.text(condLines, 20, y);
        y += condLines.length * 4.5 + 5;
      }
    } else {
      // Proposal Sections
      doc.sections.forEach((sec, idx) => {
        if (y > 240) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(orangeColor[0], orangeColor[1], orangeColor[2]);
        pdf.text(String(idx + 1).padStart(2, '0'), 20, y);

        pdf.setFontSize(11);
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.text(sec.title, 28, y);
        y += 6;

        pdf.setFontSize(8.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        const contentLines = pdf.splitTextToSize(sec.content, 170);
        pdf.text(contentLines, 20, y);
        y += contentLines.length * 4.5 + 8;
      });
    }

    // Footer at bottom
    pdf.setDrawColor(230, 230, 225);
    pdf.line(20, 275, 190, 275);

    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(doc.organization.legalName, 20, 281);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    pdf.text(
      `${doc.organization.address} • ${doc.organization.phone} • ${doc.organization.email}`,
      20,
      285
    );

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const safeFilename = `${doc.reference}-${(doc.client?.name || 'Document').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}
