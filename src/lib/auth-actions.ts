'use server';

import { setAdminSession, clearAdminSession } from './auth';

export async function loginAdmin(formData: FormData) {
  const username = formData.get('username') as string | null;
  const password = formData.get('password') as string | null;

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return { error: 'Server authentication is not configured. Please set ADMIN_PASSWORD.' };
  }

  if (username === expectedUsername && password === expectedPassword) {
    await setAdminSession(username);
    return { success: true };
  }

  return { error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
}

export async function logoutAdmin() {
  await clearAdminSession();
  return { success: true };
}
