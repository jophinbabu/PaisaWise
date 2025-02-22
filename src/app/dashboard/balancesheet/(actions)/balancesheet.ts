"use server";

import { revalidatePath } from "next/cache";
import { Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balancesheetCollectionId } from "@/models/collections/balancesheet"; // Import balancesheet collection ID
import { dbName } from "@/models/dbSetup";

export const getBalanceSheetData = async () => {
    try {
        const { database } = await createSession();
        const records = await database.listDocuments(dbName, balancesheetCollectionId);
        revalidatePath("/dashboard/balancesheet");
        return {
            success: true,
            data: records.documents, // Return the list of records
        };
    } catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};
export const getBalanceSheetByDateRange = async (startDate: string, endDate: string) => {
    try {
        const { database } = await createSession();

        // Fetch records where createdAt falls between startDate and endDate
        const records = await database.listDocuments(dbName, balancesheetCollectionId, [
            Query.between("createdAt", startDate, endDate),
        ]);

        return {
            success: true,
            data: records.documents,
        };
    } catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};
