"use server";

import { createSession } from "@/config/appwrite.config";
import { UserPrefs } from "@/types/userprefs";

export const isOnBoardingCompleted = async () => {
    const {account} = await createSession();

    // get user prefs
    try{
        const prefs = await account.getPrefs<UserPrefs>();

        return prefs.isOnboardingCompleted ?? false;
    }catch{
        return false;

    }


}