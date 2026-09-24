import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { TYPE_META, KEY_TO_ENUM, DocTypeKey } from '@/domains/documents/types';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q')?.trim();

    const where: any = {
      organizationId: user.organizationId,
      archivedAt: null,
    };

    if (typeParam && typeParam !== 'all') {
      const enumType = KEY_TO_ENUM[typeParam as DocTypeKey] || typeParam;
      where.type = enumType as DocumentType;
    }

    if (statusParam && statusParam !== 'all') {
      where.status = statusParam as DocumentStatus;
    }

    if (q) {
      where.OR = [
        { reference: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { client: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        client: true,
        lines: { orderBy: { position: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Erreur chargement documents' }, { status: 500 });
  }
}

const createDocSchema = z.object({
  type: z.string(),
  clientId: z.string().min(1, 'Le client est obligatoire'),
  title: z.string().optional(),
  intro: z.string().optional(),
  date: z.string().optional(),
  dueDate: z.string().optional(),
  validity: z.number().optional(),
  items: z.array(z.any()).optional(),
  sections: z.array(z.any()).optional(),
  discount: z.number().optional(),
  taxRate: z.number().optional(),
  deposit: z.number().optional(),
  conditions: z.string().optional(),
  notes: z.string().optional(),
  options: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const json = await request.json();
    const data = createDocSchema.parse(json);

    const typeKey = (data.type.toLowerCase() as DocTypeKey) || 'quote';
    const enumType = (KEY_TO_ENUM[typeKey] || 'QUOTE') as DocumentType;
    const meta = TYPE_META[typeKey] || TYPE_META.quote;

    const year = new Date().getFullYear();
    const currentCount = await prisma.document.count({
      where: {
        organizationId: user.organizationId,
        type: enumType,
        reference: { contains: String(year) },
      },
    });

    const sequence = currentCount + 1;
    const reference = `${meta.prefix}-${year}-${String(sequence).padStart(3, '0')}`;

    const issueDate = data.date ? new Date(data.date) : new Date();
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const document = await prisma.document.create({
      data: {
        organizationId: user.organizationId,
        clientId: data.clientId,
        type: enumType,
        reference,
        title: data.title || meta.label,
        intro: data.intro || null,
        status: DocumentStatus.DRAFT,
        issueDate,
        dueDate,
        validityDays: data.validity ?? 30,
        taxRate: data.taxRate ?? 0,
        discountPercent: data.discount ?? 0,
        depositAmount: data.deposit ?? 0,
        conditions: data.conditions || null,
        notes: data.notes || null,
        options: data.options || {
          showSignature: true,
          showTax: (data.taxRate || 0) > 0,
          coverPage: typeKey === 'proposal',
        },
        createdById: user.id,
        lines: {
          create: (data.items || []).map((item: any, idx: number) => ({
            position: idx,
            name: item.name || 'Prestation',
            description: item.description || null,
            quantity: item.qty ?? 1,
            unitPrice: item.price ?? 0,
          })),
        },
        sections: {
          create: (data.sections || []).map((sec: any, idx: number) => ({
            position: idx,
            title: sec.title || 'Section',
            content: sec.content || '',
            sectionType: sec.sectionType || 'standard',
          })),
        },
      },
      include: {
        client: true,
        lines: true,
        sections: true,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error('Document POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du document' },
      { status: 400 }
    );
  }
}
