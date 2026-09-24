import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentStatus } from '@prisma/client';
import { STATUS_TO_ENUM } from '@/domains/documents/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const document = await prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: {
        client: true,
        lines: { orderBy: { position: 'asc' } },
        sections: { orderBy: { position: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Document GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await request.json();

    const existing = await prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: { lines: true, sections: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Save previous snapshot in DocumentVersion
    const versionCount = await prisma.documentVersion.count({
      where: { documentId: params.id },
    });

    await prisma.documentVersion.create({
      data: {
        documentId: params.id,
        versionNumber: versionCount + 1,
        snapshot: existing as any,
        createdById: user.id,
      },
    });

    // Prepare update data
    const statusEnum = (
      STATUS_TO_ENUM[body.status] || body.status || existing.status
    ) as DocumentStatus;

    // Use transaction to update document, replace lines, replace sections
    const updated = await prisma.$transaction(async (tx) => {
      // Delete old lines & sections
      await tx.documentLine.deleteMany({ where: { documentId: params.id } });
      await tx.documentSection.deleteMany({ where: { documentId: params.id } });

      // Update document root
      return await tx.document.update({
        where: { id: params.id },
        data: {
          clientId: body.clientId || existing.clientId,
          reference: body.reference || existing.reference,
          title: body.title || existing.title,
          intro: body.intro !== undefined ? body.intro : existing.intro,
          status: statusEnum,
          issueDate: body.date ? new Date(body.date) : existing.issueDate,
          dueDate: body.dueDate ? new Date(body.dueDate) : null,
          validityDays: body.validity !== undefined ? Number(body.validity) : existing.validityDays,
          discountPercent: body.discount !== undefined ? Number(body.discount) : existing.discountPercent,
          taxRate: body.taxRate !== undefined ? Number(body.taxRate) : existing.taxRate,
          depositAmount: body.deposit !== undefined ? Number(body.deposit) : existing.depositAmount,
          conditions: body.conditions !== undefined ? body.conditions : existing.conditions,
          notes: body.notes !== undefined ? body.notes : existing.notes,
          options: body.options || existing.options,
          updatedById: user.id,
          lines: {
            create: (body.items || []).map((item: any, idx: number) => ({
              position: idx,
              name: item.name || '',
              description: item.description || null,
              quantity: Number(item.qty ?? 1),
              unitPrice: Number(item.price ?? 0),
            })),
          },
          sections: {
            create: (body.sections || []).map((sec: any, idx: number) => ({
              position: idx,
              title: sec.title || '',
              content: sec.content || '',
              sectionType: sec.sectionType || 'standard',
            })),
          },
        },
        include: {
          client: true,
          lines: { orderBy: { position: 'asc' } },
          sections: { orderBy: { position: 'asc' } },
        },
      });
    });

    return NextResponse.json({ document: updated });
  } catch (error: any) {
    console.error('Document PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur mise à jour document' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await prisma.document.delete({
      where: { id: params.id, organizationId: user.organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Document DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur suppression document' },
      { status: 500 }
    );
  }
}
