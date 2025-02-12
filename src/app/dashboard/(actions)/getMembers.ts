"use server";

import { createSession } from "@/config/appwrite.config";

import { getOrgs } from "./getOrgs";

export const getAllOrgAssociated =async ()=>{
    const org = await getOrgs();

    const {teams} = await createSession();

    const members = await teams.listMemberships(org.$id);

    return members.memberships;
}

export const getMembers = async ()=>{
    const orgs = await getAllOrgAssociated();

    const members = orgs.filter((org)=>org.roles.includes("member"));

    return members;
}

export const getRequestes = async ()=>{
    const orgs = await getAllOrgAssociated();

    const requests = orgs.filter((org)=>org.roles.includes("request"));

    return requests;
}