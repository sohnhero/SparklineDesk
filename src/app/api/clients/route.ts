import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const clientSchema = z.object({
  name: z.string().min(1, 'Le nom du client est obligatoire'),
  sector: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const clients = await prisma.client.findMany({
      where: { organizationId: user.organizationId, archivedAt: null },
      include: {
        documents: {
          include: { lines: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Clients GET error:', error);
    return NextResponse.json({ error: 'Erreur chargement clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const json = await request.json();
    const data = clientSchema.parse(json);

    const client = await prisma.client.create({
      data: {
        organizationId: user.organizationId,
        name: data.name.trim(),
        sector: data.sector?.trim() || null,
        contactName: data.contactName?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || 'Dakar, Sénégal',
        notes: data.notes?.trim() || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error: any) {
    console.error('Clients POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Données client invalides' },
      { status: 400 }
    );
  }
}
