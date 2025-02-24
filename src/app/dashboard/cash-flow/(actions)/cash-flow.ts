"use server";

import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balancesheetCollectionId } from "@/models/collections/balancesheet"; // Import balancesheet collection ID
import { financialRecordsCollectionId } from "@/models/collections/financesCollection";
import { dbName } from "@/models/dbSetup";
import { AuthSession } from "@/utils/AuthSession";

import { getCurrentUsermembershipId } from "../../(actions)/getCurrentUserMembershipId";
import { Entry } from "../cash";

// Fetch all transactions
export const getTransactions = async () => {
    const { database } = await createSession();
    return await database.listDocuments(dbName, financialRecordsCollectionId);
};

// Create a new transaction and add it to balancesheet
export const createTransactions = async (data: {
    description: string;
    type: string;
    flow: string;
    amount: number;
    department: string;
    name: string;
}) => {
    try {
        const authData = await AuthSession.getUser();
        const { database } = await createSession();
        const userMembership = await getCurrentUsermembershipId();
        const { roles, $id } = userMembership;

        // Check if the user is authorized
        if (!roles.includes("owner")) {
            throw new Error("You are not authorized to perform this action");
        }

        // Create transaction in financialRecordsCollection
        const transaction = await database.createDocument(
            dbName,
            financialRecordsCollectionId,
            ID.unique(),
            {
                name: data.name,
                description: data.description,
                type: data.type,
                flow: data.flow,
                memberId: $id,
                departmentName: data.department,
                amount: data.amount,
                User: authData.name,
            }
        );
        console.log("Transaction:", transaction);

        // ✅ Also add entry to balancesheetCollection
        const balance = await database.createDocument(
            dbName,
            balancesheetCollectionId, // Using the balancesheet collection
            ID.unique(),
            {
                name: data.name,
                description: data.description,
                type: data.type,
                flow: data.flow,
                departmentName: data.department,
                amount: data.amount,
                User: authData.name,
                memberId: $id,
            }
        );

        if (!balance) {
            throw new Error("Failed to record transaction in the balance sheet");
        }
        console.log("Transaction added to balancesheet");

        // Revalidate the cash-flow dashboard
        revalidatePath("/dashboard/cash-flow");

        return {
            success: true,
            transaction: transaction as Entry,
        };
    } catch (e) {
        console.error("Error creating transaction:", e);
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};