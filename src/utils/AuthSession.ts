
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import { getCookie, removeCookie, setCookie } from "./cookies";
import { getUser } from "./getUser";

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

    await setCookie(authCookieName, token, cookieOptions);
    return token;
  }
  static async getSessionToken() {
  
    const token = await getCookie(authCookieName);
    return token;
  }

  static async removeSessionToken() {

    await removeCookie(authCookieName);

    return true;
  }

  static async isAuthenticated() {

    return (await this.getSessionToken()) ? true : false;
  }

  static async getUser(){
    return await getUser();


   
  }
}
