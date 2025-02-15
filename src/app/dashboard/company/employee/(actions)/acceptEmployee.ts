"use server";

import { revalidatePath } from "next/cache";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import {  createSession } from "@/config/appwrite.config";

export const acceptEmployee = async (id:string)=>{
    const {teams} = await createSession();
    const {$id:orgId} = await getOrgs();

    const membership = await teams.updateMembership(orgId,id,["member"]);
    revalidatePath(`/dashboard/company/employee`);

    return membership
}