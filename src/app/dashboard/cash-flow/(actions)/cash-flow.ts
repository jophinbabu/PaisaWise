"use server";

import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { financialRecordsCollectionId } from "@/models/collections/financesCollection";
import { dbName } from "@/models/dbSetup";

import { getCurrentUsermembershipId } from "../../(actions)/getCurrentUserMembershipId";
import { Entry } from "../cash";

// name: "",
// description: "",
// type: "asset",
// flow: "inflow",
// amount: 0,

export const getTransactions = async () => {

    const {database} = await createSession();
 

    const transactions = await database.listDocuments(dbName, financialRecordsCollectionId)


    return transactions


}


export const createTransactions = async (data:{
    name: string,
    description: string,
    type: string,
    flow: string,
    amount: number

}) => {

    const {database} = await createSession();
    const {roles} = await getCurrentUsermembershipId();

    if (!roles.includes("owner")){
        throw new Error("You are not authorized to perform this action");
    }

    const {$id} = await getCurrentUsermembershipId();


    const transaction = await database.createDocument(dbName, financialRecordsCollectionId,ID.unique() ,{
        name: data.name,
        description: data.description,
        type: data.type,
        flow: data.flow,
        memberId: $id,
        
        amount: data.amount
    })
    revalidatePath("/dashboard/cash-flow")
    return transaction as Entry

}                                           


export const deleteTransactions = async (id:string) => {

    const {database} = await createSession();
    const {roles} = await getCurrentUsermembershipId();

    if (!roles.includes("owner")){
        throw new Error("You are not authorized to perform this action");
    }

    const transaction = await database.deleteDocument(dbName, financialRecordsCollectionId, id)
    revalidatePath("/dashboard/cash-flow")
    return transaction

}