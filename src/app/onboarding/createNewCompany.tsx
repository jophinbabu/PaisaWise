"use server";
import { revalidatePath } from "next/cache";
import { AppwriteException, ID, Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";

import { setOnboardingTrue } from "./setOnBoardingTrue";

export const creaeNewOrg = async (name: string) => {
    // get user prefs
    try{
        const { teams } = await createSession();


        // check if user is already a member of the team
        const existing = await teams.list([Query.limit(1)]);
    
        if (existing.teams.length > 0) {
            await setOnboardingTrue();
            throw new Error("You are already a member of an organization or have a pending request")
        }
    
        await teams.create(ID.unique(), `${name}'s company`, [
            "admin",
            "request",
            "member"
        ]).catch((e) => {
            if (e instanceof AppwriteException) {
                throw new Error(e.message)
            }
    
            throw new Error("An error occurred")
        })

        revalidatePath("/onboarding");

        return {
            success: true
        }
    }catch(e){
        if (e instanceof Error) {
            return {
                success: false,
                message: e.message
            }
        }
        return {
            success: false,
            message: "An error occurred while creating the organization"
        }
    
        
    }

}