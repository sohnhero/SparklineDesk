import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail et mot de passe requis.' },
        { status: 400 }
      );
    }

    const result = await loginUser(email, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Auth login error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur d’authentification' },
      { status: 500 }
    );
  }
}
