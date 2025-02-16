"use server";
import { revalidatePath } from "next/cache";
import { AppwriteException } from "node-appwrite";

import { createSession } from "@/config/appwrite.config"
import { UserPrefs } from "@/types/userprefs";

export const setOnboardingTrue = async () => {
    const {account} = await createSession();

    try{
        await account.updatePrefs<UserPrefs>({
            isOnboardingCompleted: true
        })
    }catch(e){
        if (e instanceof AppwriteException){
            return {
                success:false,
                message:e.message
            }
        }
        return {
            success:false,
            message:"An error occurred"

        }
    }


    revalidatePath("/onboarding")
    
    return {
        success:true
    }

}