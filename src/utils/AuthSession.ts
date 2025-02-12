"use server";

import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const authCookieName = "auth";
const cookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  priority: "high",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

export class AuthSession {
  static async setSessionToken(token: string) {
    const cookieStore = await cookies();
    await cookieStore.set(authCookieName, token, cookieOptions);
    return token;
  }
  static async getSessionToken() {
    const cookieStore = await cookies();
    const token = await cookieStore.get(authCookieName)?.value;
    return token;
  }

  static async removeSessionToken() {
    const cookieStore = await cookies();
    await cookieStore.delete(authCookieName);

    return true;
  }
}
