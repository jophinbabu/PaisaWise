"use server";

import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balancesheetCollectionId } from "@/models/collections/balancesheet";
import { dbName } from "@/models/dbSetup";
import { AuthSession } from "@/utils/AuthSession";

import { getCurrentUsermembershipId } from "../../(actions)/getCurrentUserMembershipId";
import { Entry } from "../cash";
// name: "",
// description: "",
// type: "asset",
// flow: "inflow",
// amount: 0,

export const getTransactions = async () => {

    const {database} = await createSession();
 

    const transactions = await database.listDocuments(dbName, balancesheetCollectionId)


    return transactions


}


export const createTransactions = async (data:{
    description: string,
    type: string,
    flow: string,
    amount: number
    department: string,
    name: string
}) => {
    const authdata =await AuthSession.getUser();
try{
    const {database} = await createSession();
    const {roles} = await getCurrentUsermembershipId();

    if (!roles.includes("owner")){
        throw new Error("You are not authorized to perform this action");
    }

    const {$id} = await getCurrentUsermembershipId();


    const transaction = await database.createDocument(dbName, balancesheetCollectionId,ID.unique() ,{
        name: data.name,
        description: data.description,
        type: data.type,
        flow: data.flow,
        memberId: $id,
        department:data.department,
        amount: data.amount,
        user:authdata.name
    })
    revalidatePath("/dashboard/cash-flow")
    return {
        success:true,
        transaction:transaction as Entry
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


export const deleteTransactions = async (id:string) => {
    try{
        const {database} = await createSession();
        const {roles} = await getCurrentUsermembershipId();
    
        if (!roles.includes("owner")){
            throw new Error("You are not authorized to perform this action");
        }
    
         await database.deleteDocument(dbName, balancesheetCollectionId, id)
        revalidatePath("/dashboard/cash-flow")
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