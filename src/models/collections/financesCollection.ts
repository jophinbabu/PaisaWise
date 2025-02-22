import { IndexType, Permission } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config";

import { dbName } from "../dbSetup";

const collectionId = "financialRecords";
const collectionName = collectionId;

export const financialRecordsCollectionId = collectionId;


export async function FinancialRecordsCollectionCreate() {
   try {
      const { database } = await createAdminClient();
  
      // Create the FinancialRecords collection
      await database.createCollection(
        dbName,
        collectionId,
        collectionName,
        [
          Permission.read("any"),
          Permission.write("users"),
          Permission.update("users"),
          Permission.delete("users"),
        ],
        undefined,
        true
      );
  
      // Create attributes for the FinancialRecords collection
      await Promise.all([
        database.createStringAttribute(
          dbName,
          collectionId,
          "name",
          100,
          true // Required
        ),
        database.createStringAttribute(
          dbName,
          collectionId,
          "description",
          500,
          false // Optional
        ),
        database.createEnumAttribute(
          dbName,
          collectionId,
          "type",
          ["asset", "liability"],
          true // Required
        ),
        database.createEnumAttribute(
          dbName,
          collectionId,
          "flow",
          ["inflow", "outflow"],
          true // Required
        ),
        database.createFloatAttribute(
          dbName,
          collectionId,
          "amount",
          true // Required
        ),
        // Add the new departmentName attribute
        database.createStringAttribute(
          dbName,
          collectionId,
          "departmentName",
          100,
          false // Optional
        ),
        database.createStringAttribute(
          dbName,
          collectionId,
          "User",
          100,
          false // Optional
        ),
        database.createDatetimeAttribute(
          dbName,
          collectionId,
          "createdAt",
          true,
          new Date().toISOString()
        ),
        // Add the new memberId attribute
        database.createStringAttribute(
          dbName,
          collectionId,
          "memberId",
          100, // Max length
          true // Required
        ),
      ]);
  
      // Create indexes for the FinancialRecords collection
      await Promise.all([
        database.createIndex(
          dbName,
          collectionId,
          "memberId",
          IndexType.Key,
          ["memberId"],
          ["ASC"]
        ),
        database.createIndex(
          dbName,
          collectionId,
          "type",
          IndexType.Key,
          ["type"],
          ["ASC"]
        ),
        database.createIndex(
          dbName,
          collectionId,
          "flow",
          IndexType.Key,
          ["flow"],
          ["ASC"]
        ),
        // Add an index for departmentName (optional)
        database.createIndex(
          dbName,
          collectionId,
          "department",
          IndexType.Key,
          ["department"],
          ["ASC"]
        ),
        database.createIndex(
          dbName,
          collectionId,
          "User",
          IndexType.Key,
          ["user"],
          ["DESC"]
        ),
      ]);
  
      console.log("FinancialRecords collection created successfully!");
    } catch (e) {
      console.error("Failed to create financial records collection:", e);
    }
  }