import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_PASSWORD || 'wtp-edumedia-default-secret-key-12345';
const COOKIE_NAME = 'wtp_admin_session';

export function signToken(payload: { username: string }): string {
  const data = JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.scryptSync(SECRET_KEY, 'salt', 32),
    Buffer.alloc(16, 0)
  );
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function verifyToken(token: string): { username: string } | null {
  try {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.scryptSync(SECRET_KEY, 'salt', 32),
      Buffer.alloc(16, 0)
    );
    let decrypted = decipher.update(token, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const parsed = JSON.parse(decrypted);
    if (parsed.exp < Date.now()) return null;
    return { username: parsed.username };
  } catch (err) {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  if (!tokenCookie || !tokenCookie.value) return null;
  return verifyToken(tokenCookie.value);
}

export async function setAdminSession(username: string) {
  const token = signToken({ username });
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
