"use server";
import { Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balancesheetCollectionId } from "@/models/collections/balancesheet"; // Import balancesheet collection ID
import { dbName } from "@/models/dbSetup";

interface BalanceSheetEntry {
    description: string;
    type: "asset" | "liability";
    flow: "inflow" | "outflow";
    amount: number;
    department: string;
    name: string;
    createdat: string;
  }
  
  export const getBalanceSheetData = async (): Promise<{ success: boolean; data?: BalanceSheetEntry[]; message?: string }> => {
    try {
      const { database } = await createSession();
      const records = await database.listDocuments(dbName, balancesheetCollectionId);
  
      console.log("Records.docs:", records.documents);
  
      // Map the records to match BalanceSheetEntry type
      const formattedData: BalanceSheetEntry[] = records.documents.map((doc) => ({
        description: doc.description,
        type: doc.type,
        flow: doc.flow,
        amount: doc.amount,
        department: doc.departmentName, // Mapping from `departmentName`
        name: doc.User, // Mapping from `User`
        createdat: doc.$createdAt, // Using `$createdAt`
      }));
  
      return {
        success: true,
        data: formattedData,
      };
    } catch (e) {
      return {
        success: false,
        message: e instanceof Error ? e.message : "An error occurred",
      };
    }
  };
  

  export const getBalanceSheetByDateRange = async (
    startDate: string, 
    endDate: string
): Promise<{ success: boolean; data?: BalanceSheetEntry[]; message?: string }> => {
    try {
        const { database } = await createSession();

        // Fetch records where $createdAt falls between startDate and endDate
        const records = await database.listDocuments(dbName, balancesheetCollectionId, [
            Query.between("$createdAt", startDate, endDate),
        ]);

        console.log("Raw Records:", records.documents);

        // Mapping raw records to BalanceSheetEntry type
        const formattedData: BalanceSheetEntry[] = records.documents.map((doc) => ({
            description: doc.description,
            type: doc.type as "asset" | "liability", // Explicitly typecasting
            flow: doc.flow as "inflow" | "outflow", // Explicitly typecasting
            amount: Number(doc.amount), // Ensuring amount is a number
            department: doc.departmentName, // Mapping from `departmentName`
            name: doc.User, // Mapping from `User`
            createdat: doc.$createdAt, // Using `$createdAt`
        }));

        console.log("Formatted Data:", formattedData);

        return {
            success: true,
            data: formattedData,
        };
    } catch (e) {
        console.error("Error fetching balance sheet by date range:", e);
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};

