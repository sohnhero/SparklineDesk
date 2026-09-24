import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const clientUpdateSchema = z.object({
  name: z.string().min(1, 'Le nom du client est obligatoire'),
  sector: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const json = await request.json();
    const data = clientUpdateSchema.parse(json);

    const client = await prisma.client.update({
      where: { id: params.id, organizationId: user.organizationId },
      data: {
        name: data.name.trim(),
        sector: data.sector?.trim() || null,
        contactName: data.contactName?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    return NextResponse.json({ client });
  } catch (error: any) {
    console.error('Client PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur mise à jour client' },
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

    // Check if client has linked documents
    const docCount = await prisma.document.count({
      where: { clientId: params.id, organizationId: user.organizationId },
    });

    if (docCount > 0) {
      return NextResponse.json(
        {
          error:
            'Ce client est lié à des documents. Supprimez ou réaffectez-les d’abord.',
        },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: { id: params.id, organizationId: user.organizationId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Client DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur suppression client' },
      { status: 500 }
    );
  }
}
