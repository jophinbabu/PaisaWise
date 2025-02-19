"use server";

import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { budgetCollectionId } from "@/models/collections/budgetCollection";
import { dbName } from "@/models/dbSetup";
import { AuthSession } from "@/utils/AuthSession";

import {  specificBudget } from "../../limit-expenses/(actions)/Budget";


export const createRequestBudget = async (data:{title:string,   purpose:string,impact:string,amount:number,description:string,departmentNames:string[]})=>{
    try{
        // gettig sum of all the departments
        const allDeptBudget = await data.departmentNames.map(async (dept)=>{
            const budget = await specificBudget(dept);
            return parseFloat(budget?.limit) || 0 as number;
        })

        const resolvedBudgets = await Promise.all(allDeptBudget);
        const total = resolvedBudgets.reduce((acc, curr) => parseFloat(String(acc)) + parseFloat(String(curr)), 0);


        const {$id} = await AuthSession.getUser();

    
        if (data.amount > total) {
            throw new Error("Amount exceeds the budget limit");
        }
    
        const {database} = await createSession();
    
        await database.createDocument(dbName,budgetCollectionId,ID.unique(),{
            title:data.title,
            purpose:data.purpose,
            businessImpact:data.impact,
            involvedDepartments:[],
            amountRequired:data.amount,
            detailedDescription:data.description,
            memberId:$id
        })
    
        revalidatePath("/dashboard/request-budget")
    
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
            message:"An error occurred"}
    }


    

}