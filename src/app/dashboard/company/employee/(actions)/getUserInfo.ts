"use server";

import { createAdminClient } from "@/config/appwrite.config";

export const anyUser = async (id:string)=>{
    const {Users} = await createAdminClient();

    const user = await Users.get(id);

    return user

} 