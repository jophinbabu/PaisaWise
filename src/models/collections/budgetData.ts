import { IndexType, Permission } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config";

import { dbName } from "../dbSetup";

const collectionId = "budgetData";
const collectionName = collectionId;

export const budgetDeptCollectionId = collectionId;

export async function BudgetDataCollectionCreate() {
  try {
    const { database } = await createAdminClient();

    // Create the BudgetData collection
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

    // Create attributes for the BudgetData collection
    await Promise.all([
      database.createStringAttribute(dbName, collectionId, "departmentName", 255, true),
      database.createStringAttribute(dbName, collectionId, "orgId", 255, true),
      database.createIntegerAttribute(dbName, collectionId, "budgetAmount", true),
      
    ]);

    // Create indexes for the BudgetData collection
    await database.createIndex(
      dbName,
      collectionId,
      "orgIdIndex",
      IndexType.Key,
      ["orgId"],
      ["ASC"]
    );

    console.log("BudgetData collection created successfully!");
  } catch (e) {
    console.error("Failed to create budget data collection:", e);
  }
}
