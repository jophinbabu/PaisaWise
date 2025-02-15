"use server";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import { createSession } from "@/config/appwrite.config";

import { anyUser } from "./getUserInfo";

export const requestEmployees = async () => {
    const org = await getOrgs();

    const {teams} = await createSession();

    const employees = await teams.listMemberships(org.$id)

    if (employees.total == 0){
        return []
    }
    else{
        const reqEmp =  await employees.memberships.filter((employee) => employee.roles.includes("request") && !employee.roles.includes("member") && !employee.roles.includes("admin") && !employee.roles.includes("owner"))
        const finalReq = [];
        for (let i = 0; i < reqEmp.length; i++){
            const user = await anyUser(reqEmp[i].userId)
            finalReq.push({
                ...user,
                ...reqEmp[i],
                
                userName: user.name,
                userEmail: user.email
            })
        }
        return finalReq
    }

}