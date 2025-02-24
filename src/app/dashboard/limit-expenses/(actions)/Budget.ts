"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { budgetDeptCollectionId } from "@/models/collections/budgetData";
import { dbName } from "@/models/dbSetup";

import { getOrgs } from "../../(actions)/getOrgs";
import { isOwner } from "../../(actions)/isActivemember";

export const getBudget = async ()=>{

    const {$id} =await getOrgs();

    const {database} = await createSession();

    const doc = await database.listDocuments(dbName,budgetDeptCollectionId,[
        Query.equal("orgId",$id),

    ])

    const standard = [
        { department: "Engineering", limit: 0 },
        { department: "Marketing", limit: 0 },
        { department: "Sales", limit: 0 },
        { department: "Finance", limit:0 },
        { department: "Human Resources", limit: 0 },
        { department: "Operations", limit: 0 },
        { department: "Research & Development", limit: 0 },
        { department: "Customer Support", limit: 0 },
      ];

    if (doc.total === 0) {
        return standard
    };

    // update standard with the data from the database
    const data = doc.documents.map(doc=>{
        return {
            department:doc.departmentName,
            limit:doc.budgetAmount
        }
    })
    console.log("Data:",data);




    // update standard data with the data from the database
    const updatedData = standard.map((std)=>{
        const found = data.find(d=>d.department === std.department);
        if (found) {
            return found
        }
        return std
    })



    return updatedData

}

export const specificBudget = async (dept:string)=>{
    const budget = await getBudget();

    return budget.find(b=>b.department === dept);
}


export const setBudget = async (dept:string,newLimit:string)=>{

    try{
        const {$id:orgId} = await getOrgs();

        const owner = await isOwner();

        if (!owner) {
            throw new Error("You are not authorized to perform this action");
        }

        const {database} = await createSession();

        const doc = await database.listDocuments(dbName,budgetDeptCollectionId,[Query.and([
            Query.equal("orgId",orgId),
            Query.equal("departmentName",dept)
        ])]);

        if (doc.total === 0) {
            await database.createDocument(dbName,budgetDeptCollectionId,ID.unique(),{
                orgId,
                departmentName:dept,
                budgetAmount:parseInt(newLimit)
            })
                   }else{
            await database.updateDocument(dbName,budgetDeptCollectionId,doc.documents[0].$id,{
                budgetAmount:parseInt(newLimit)
            })
        }

       

    
        revalidatePath(`/dashboard/limit-expenses`);
    
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
            message:"An error occurred"
        }
    }
  
}