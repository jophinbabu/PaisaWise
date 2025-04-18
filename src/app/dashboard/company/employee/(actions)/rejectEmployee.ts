"use server";

import { revalidatePath } from "next/cache";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import { createAdminClient, createSession } from "@/config/appwrite.config";

export const rejectEmployee = async (id:string)=>{
    try{
        const {teams} = await createSession();
    const {$id:orgId} = await getOrgs();

    const membership = await teams.updateMembership(orgId,id,[]);

    // also we will have to delete the user from the team and his account coz thats the flow

    const {Users} = await createAdminClient();

    revalidatePath(`/dashboard/company/employee`);
await Users.delete(membership.userId);
    return {
        success:true
    }
    }catch(e){
        if (e instanceof Error){
            return {
                success:false,
                message:e.message
            }
        }
        return {
            success:false,
            message:"An error occurred"}
    }
    


}