'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { encrypt, COOKIE_NAME, verifyPassword } from '@/lib/auth';

export async function login(formData: FormData) {
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;

  if (!phone || !password) {
    return { success: false, error: 'رقم الهاتف وكلمة المرور مطلوبان' };
  }

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    return { success: false, error: 'بيانات الدخول غير صحيحة' };
  }

  const isMatch = await verifyPassword(password, user.password);
  
  if (!isMatch) {
    return { success: false, error: 'بيانات الدخول غير صحيحة' };
  }

  const session = await encrypt({ sub: user.id, role: user.role, name: user.name });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  return { success: true };
}
