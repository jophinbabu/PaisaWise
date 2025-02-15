"use server";
import { Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { AuthSession } from "@/utils/AuthSession";

import { getOrgs } from "./getOrgs";

export const getCurrentUsermembershipId = async () => {
  const { teams } = await createSession();
  const usersTeam = await getOrgs();

  const userinfo = await AuthSession.getUser();

    const member = await teams.listMemberships(usersTeam.$id,[Query.equal("userId", userinfo.$id),Query.limit(1)]);
    if (member.memberships.length === 0) {
        throw new Error("No Member found");
    }

    return member.memberships[0]


  
};
