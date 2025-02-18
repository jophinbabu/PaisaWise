"use server";

import { createAdminClient } from "@/config/appwrite.config";
import { AuthSession } from "@/utils/AuthSession";

export const verifyOTP = async (userId: string, otp: string) => {
try{
            // send email
            const {account} = await createAdminClient()

            const sessionData = await account.createSession(userId, otp);
      
            await AuthSession.setSessionToken(sessionData.secret);
            return {
                  success: true,
                  message: "OTP verified successfully",
                  data: sessionData
            }
        
}catch(e){
      if (e instanceof Error){
            return {
                  success: false,
                  message: e.message
            }
      
      }
      return {
            success: false,
            message: "Failed to verify OTP"
      }
}
 
  
}