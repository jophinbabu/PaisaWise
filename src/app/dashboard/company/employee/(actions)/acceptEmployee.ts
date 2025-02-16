"use server";

import { revalidatePath } from "next/cache";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import {  createSession } from "@/config/appwrite.config";

export const acceptEmployee = async (id:string)=>{
    try{
        const {teams} = await createSession();
        const {$id:orgId} = await getOrgs();
    
        await teams.updateMembership(orgId,id,["member"]);
        revalidatePath(`/dashboard/company/employee`);
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