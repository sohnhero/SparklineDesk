import { cookies } from 'next/headers';
import prisma from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Role } from '@prisma/client';

const SESSION_COOKIE_NAME = 'sparkline_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  organization: {
    id: string;
    name: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    country: string;
    currency: string;
    taxRate: number;
    quoteValidityDays: number;
    paymentTerms: string;
    logoDarkUrl: string;
    logoLightUrl: string;
    symbolUrl: string;
  };
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          include: { organization: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    const { user } = session;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        legalName: user.organization.legalName,
        email: user.organization.email,
        phone: user.organization.phone,
        website: user.organization.website,
        address: user.organization.address,
        city: user.organization.city,
        country: user.organization.country,
        currency: user.organization.currency,
        taxRate: Number(user.organization.taxRate),
        quoteValidityDays: user.organization.quoteValidityDays,
        paymentTerms: user.organization.paymentTerms,
        logoDarkUrl: user.organization.logoDarkUrl,
        logoLightUrl: user.organization.logoLightUrl,
        symbolUrl: user.organization.symbolUrl,
      },
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export async function loginUser(email: string, password: string):Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, error: 'Identifiants incorrects.' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Identifiants incorrects.' };
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expiresAt,
      },
    });

    cookies().set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Une erreur est survenue lors de la connexion.' };
  }
}

export async function logoutUser(): Promise<void> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function checkPermission(
  requiredRoles: Role[] = [Role.OWNER, Role.ADMIN, Role.MEMBER]
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Non authentifié.');
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    throw new Error('Action non autorisée pour votre rôle.');
  }

  return user;
}
