"use server";

import { createSession } from "@/config/appwrite.config";
import { AuthSession } from "@/utils/AuthSession";


export const logout = async ()=>{
    try{
        const {account} = await createSession();

        await account.deleteSession("current").catch(()=>{});
        await AuthSession.removeSessionToken();
        return {
            success: true,
            message: "Logged out successfully"
        }
    }catch{
        return {
            success: false,
            message: "Failed to logout"
        }
    }
   
}