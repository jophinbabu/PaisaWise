"use server";
import { createSession } from "@/config/appwrite.config"
import { UserPrefs } from "@/types/userprefs";

export const setOnboardingTrue = async () => {
    const {account} = await createSession();

    await account.updatePrefs<UserPrefs>({
        isOnboardingCompleted: true
    }).catch(()=>{
        throw new Error("Unable to update onboarding status");
    })


}