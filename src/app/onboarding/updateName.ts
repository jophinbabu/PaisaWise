"use server";
import { createSession } from "@/config/appwrite.config";

export const updateUserName = async (name: string) => {
    // get user prefs
   const {account} = await createSession();
    await account.updateName(name).catch(()=>{
        throw new Error("Unable to update name");
    });
    return true;
}