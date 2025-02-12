"use server";

import { createAdminClient } from "@/config/appwrite.config";
import { AuthSession } from "@/utils/AuthSession";

export const verifyOTP = async (userId: string, otp: string) => {
      // send email
      const {account} = await createAdminClient()

      const sessionData = await account.createSession(userId, otp);

      await AuthSession.setSessionToken(sessionData.secret);
  
      return sessionData;
  
}