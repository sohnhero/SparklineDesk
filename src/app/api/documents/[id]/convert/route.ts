import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { TYPE_META, KEY_TO_ENUM, DocTypeKey } from '@/domains/documents/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();
    const targetTypeKey = (body.targetType?.toLowerCase() as DocTypeKey) || 'invoice';
    const targetEnumType = (KEY_TO_ENUM[targetTypeKey] || 'INVOICE') as DocumentType;

    const source = await prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: { lines: true, sections: true },
    });

    if (!source) {
      return NextResponse.json({ error: 'Document source introuvable' }, { status: 404 });
    }

    const meta = TYPE_META[targetTypeKey] || TYPE_META.invoice;
    const year = new Date().getFullYear();
    const count = await prisma.document.count({
      where: {
        organizationId: user.organizationId,
        type: targetEnumType,
        reference: { contains: String(year) },
      },
    });

    const sequence = count + 1;
    const reference = `${meta.prefix}-${year}-${String(sequence).padStart(3, '0')}`;

    // Target title
    let title = `${meta.label} — ${source.title}`;
    if (targetTypeKey === 'credit') {
      title = `Avoir sur ${source.reference}`;
    }

    const converted = await prisma.document.create({
      data: {
        organizationId: user.organizationId,
        clientId: source.clientId,
        type: targetEnumType,
        reference,
        title,
        intro: source.intro,
        status: DocumentStatus.DRAFT,
        issueDate: new Date(),
        dueDate: targetTypeKey === 'invoice' || targetTypeKey === 'deposit'
          ? new Date(Date.now() + 15 * 86400000)
          : null,
        validityDays: targetTypeKey === 'quote' ? 30 : null,
        currency: source.currency,
        taxRate: source.taxRate,
        discountPercent: source.discountPercent,
        depositAmount: 0,
        conditions: source.conditions,
        notes: source.notes,
        sourceDocumentId: source.id,
        createdById: user.id,
        options: {
          showSignature: true,
          showTax: Number(source.taxRate) > 0,
          coverPage: targetTypeKey === 'proposal',
        },
        lines: {
          create: source.lines.map((l) => ({
            position: l.position,
            name: l.name,
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
          })),
        },
        sections: {
          create: source.sections.map((s) => ({
            position: s.position,
            title: s.title,
            content: s.content,
            sectionType: s.sectionType,
          })),
        },
      },
    });

    return NextResponse.json({ document: converted }, { status: 201 });
  } catch (error: any) {
    console.error('Convert document error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la conversion' },
      { status: 500 }
    );
  }
}
