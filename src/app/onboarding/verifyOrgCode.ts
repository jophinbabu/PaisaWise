"use server";


import { AppwriteException, Query } from "node-appwrite";

import { createAdminClient, createSession } from "@/config/appwrite.config";

import { setOnboardingTrue } from "./setOnBoardingTrue";



export const verifyOrgCode = async (orgCode: string) => {
    const {account} = await createSession();
    const {teams}  = await createAdminClient();

    const userData =await account.get();

    // get team by org code
    try{
        const team = await teams.get(orgCode);

        // check if user is already a member of the team
        const existing = await teams.list([Query.limit(1)]);

        if (existing.teams.length > 0){
             await setOnboardingTrue();
            throw new Error("You are already a member of an organization or have a pending request")
        }

        // check if user is already a member of the team
        const memberships = await teams.listMemberships(team.$id,[Query.equal("email",userData.email),Query.limit(1)]);
        if (memberships.memberships.length > 0){
            await setOnboardingTrue();
            throw new Error("You are already a member of this organization")
        }
        // create membership with role as request
        await teams.createMembership(team.$id, ["request"],userData.email,userData.$id);
        return team;
    }catch(e){
        if (e instanceof AppwriteException){
            const type = e.type
            if (type == "team_not_found"){
                throw new Error("Invalid organization code")
            }
            throw new Error("An error occurred")
        }

        throw new Error("An error occurred")
        
    }




    
}