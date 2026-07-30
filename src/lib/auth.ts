import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_rtx_2026';
const key = new TextEncoder().encode(JWT_SECRET);

export const COOKIE_NAME = 'rtx_session';

export interface UserSessionPayload {
  sub: string;
  role: 'MANAGER' | 'USER';
  name?: string;
}

export async function encrypt(payload: UserSessionPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Sessions last for 30 days
    .sign(key);
}

export async function decrypt(input: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSessionPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
