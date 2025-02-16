"use server";

import { revalidatePath } from "next/cache";

import { createSession } from "@/config/appwrite.config";

import { getOrgs } from "../../(actions)/getOrgs";

export const getBudget = async ()=>{

    const {prefs} =await getOrgs();

    return {
        budget: prefs?.budget ?? 0,

    }

}


export const setBudget = async (newLimit:string)=>{

    try{
        const {$id:orgId} = await getOrgs();
        const {teams} = await createSession();
    
        const prefs = {
            budget:parseFloat(newLimit)
        }
    
    
        await teams.updatePrefs(orgId,prefs);
    
        revalidatePath(`/dashboard/limit-expenses`);
    
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
            message:"An error occurred"
        }
    }
  
}