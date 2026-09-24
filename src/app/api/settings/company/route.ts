import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(1),
  legalName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const json = await request.json();
    const data = companySchema.parse(json);

    const updated = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        name: data.name.trim(),
        legalName: data.legalName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || '+221 78 942 24 23',
        website: data.website?.trim() || 'www.sparkline.sn',
        address: data.address?.trim() || 'Dakar, Sénégal',
        city: data.city?.trim() || 'Dakar',
        country: data.country?.trim() || 'Sénégal',
      },
    });

    return NextResponse.json({ organization: updated });
  } catch (error: any) {
    console.error('Company settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Données entreprise invalides' },
      { status: 400 }
    );
  }
}
