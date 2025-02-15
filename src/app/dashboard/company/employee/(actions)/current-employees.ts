"use server";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import { createSession } from "@/config/appwrite.config";

import { anyUser } from "./getUserInfo";

export const currentEmployees = async () => {
    const org = await getOrgs();

    const {teams} = await createSession();

    const employees = await teams.listMemberships(org.$id)

    if (employees.total == 0){
        return []
    }
    else{
        const emp = employees.memberships.filter((employee) => employee.roles.includes("member") && !employee.roles.includes("admin") && !employee.roles.includes("owner"))

        const finalEmp = [];
        for (let i = 0; i < emp.length; i++){
            const user = await anyUser(emp[i].userId)
            finalEmp.push({
                ...user,
                ...emp[i],
           
                userName: user.name,
                userEmail: user.email
            })
        }

        return finalEmp
    }

}