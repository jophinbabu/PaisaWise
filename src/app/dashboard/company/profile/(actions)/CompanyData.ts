"use server";

import { revalidatePath } from "next/cache";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import { createSession } from "@/config/appwrite.config";

export const getCompanyData = async ()=>{
    const {$id,prefs,name} =await getOrgs();

    return {
        companyId:$id,
        companyName :name ,
        description : prefs?.description ?? "",
        category : prefs?.category ?? "",

    }

}


export const setCompanyData = async (data:{description:string,category:string,name:string})=>{

    const {$id:orgId} = await getOrgs();
    const {teams} = await createSession();

    const prefs = {
        description:data.description,
        category:data.category
    }

    const company = await teams.updateName(orgId,data.name);

    await teams.updatePrefs(orgId,prefs);

    revalidatePath(`/dashboard`);

    return company
}