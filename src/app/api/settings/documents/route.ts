import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { z } from 'zod';

const docSettingsSchema = z.object({
  currency: z.string().min(1),
  taxRate: z.number().min(0),
  quoteValidityDays: z.number().min(1),
  paymentTerms: z.string(),
});

export const dynamic = 'force-dynamic';

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const json = await request.json();
    const data = docSettingsSchema.parse(json);

    const updated = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        currency: data.currency.trim(),
        taxRate: data.taxRate,
        quoteValidityDays: data.quoteValidityDays,
        paymentTerms: data.paymentTerms.trim(),
      },
    });

    return NextResponse.json({ organization: updated });
  } catch (error: any) {
    console.error('Doc settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Préférences invalides' },
      { status: 400 }
    );
  }
}
