"use server";

import { redirect } from "next/navigation";
import { Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";

export const getOrgs = async ()=>{
    const {teams} = await createSession();

    const orgs = await teams.list([Query.limit(1)]);

    


    if (orgs.total === 0) {
        redirect("/onboarding");
        // throw new Error("No Company found");
    }

    return orgs.teams[0];
    


}