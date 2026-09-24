import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentStatus } from '@prisma/client';
import { TYPE_META, ENUM_TO_KEY, DocTypeKey } from '@/domains/documents/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const source = await prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: { lines: true, sections: true },
    });

    if (!source) {
      return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });
    }

    const typeKey = (ENUM_TO_KEY[source.type] || 'quote') as DocTypeKey;
    const meta = TYPE_META[typeKey] || TYPE_META.quote;

    const year = new Date().getFullYear();
    const count = await prisma.document.count({
      where: {
        organizationId: user.organizationId,
        type: source.type,
        reference: { contains: String(year) },
      },
    });

    const sequence = count + 1;
    const reference = `${meta.prefix}-${year}-${String(sequence).padStart(3, '0')}`;

    const duplicate = await prisma.document.create({
      data: {
        organizationId: user.organizationId,
        clientId: source.clientId,
        type: source.type,
        reference,
        title: `${source.title} — copie`,
        intro: source.intro,
        status: DocumentStatus.DRAFT,
        issueDate: new Date(),
        dueDate: source.dueDate,
        validityDays: source.validityDays,
        currency: source.currency,
        taxRate: source.taxRate,
        discountPercent: source.discountPercent,
        depositAmount: source.depositAmount,
        conditions: source.conditions,
        notes: source.notes,
        options: source.options as any,
        createdById: user.id,
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

    return NextResponse.json({ document: duplicate }, { status: 201 });
  } catch (error: any) {
    console.error('Duplicate error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la duplication' },
      { status: 500 }
    );
  }
}
