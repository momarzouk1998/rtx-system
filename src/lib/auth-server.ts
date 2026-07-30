import { cookies } from "next/headers";
import { COOKIE_NAME, decrypt, UserSessionPayload } from "@/lib/auth";

export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  return await decrypt(token);
}
