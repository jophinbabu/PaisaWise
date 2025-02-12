"use server";

import { createSession } from "@/config/appwrite.config";
import { AuthSession } from "@/utils/AuthSession";


export const logout = async ()=>{
    const {account} = await createSession();

    await account.deleteSession("current").catch(()=>{});
    await AuthSession.removeSessionToken();
}