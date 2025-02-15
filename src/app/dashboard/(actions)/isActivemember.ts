"use server";

import { getCurrentUsermembershipId } from "./getCurrentUserMembershipId";

export const isActiveMember = async ()=>{

    const userMembership = await getCurrentUsermembershipId();

    // console.log("userMembership", userMembership);

    return userMembership.roles.some((role)=>role === "member");

}