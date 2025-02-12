"use server";
import { createSession } from "@/config/appwrite.config";

export const getUser = async ()=>{
    const {account} = await createSession();

    return account.get();
}