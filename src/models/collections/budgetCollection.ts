// import { create } from "domain";
import { IndexType, Permission } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config";

import { dbName } from "../dbSetup";

const collectionId = "budgetRequests";
const collectionName = collectionId;

export const budgetCollectionId = collectionId;

export async function BudgetRequestsCollectionCreate() {
  try {
    const { database } = await createAdminClient();
    // Create the BudgetRequests collection
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

    // Create attributes for the BudgetRequests collection
    await Promise.all([
      database.createStringAttribute(
        dbName,
        collectionId,
        "memberId",
        36,
        true
      ),
      database.createStringAttribute(dbName, collectionId, "title", 100, true),
      database.createStringAttribute(dbName, collectionId, "purpose", 50, true),
      database.createStringAttribute(
        dbName,
        collectionId,
        "involvedDepartments",
        255,
        false,
        undefined,
        true // Array attribute
      ),
      database.createIntegerAttribute(
        dbName,
        collectionId,
        "amountRequired",
        true
      ),
      database.createStringAttribute(
        dbName,
        collectionId,
        "detailedDescription",
        500,
        true
      ),
      database.createStringAttribute(
        dbName,
        collectionId,
        "businessImpact",
        500,
        false
      ),
      database.createBooleanAttribute(
        dbName,
        collectionId,
        "approved",
        true,
      ),
      database.createDatetimeAttribute(
        dbName,
        collectionId,
        "createdat",
        true,
        new Date().toISOString()
      ),
    ]);

    // Create indexes for the BudgetRequests collection
    await database.createIndex(
        dbName,
        collectionId,
        "memberId",
        IndexType.Key,
        ["memberId"],
        ["ASC"]
      )
    await database.createIndex(
        dbName,
        collectionId,
        "createdat",
        IndexType.Key,
        ["createdat"],
        ["DESC"]
      )

    // await database.createIndex(
    //   dbName,
    //   collectionId,
    //   "title",
    //   IndexType.Fulltext,
    //   ["title"],
    //   ["ASC"]
    // );

    console.log("BudgetRequests collection created successfully!");
  } catch (e) {
    console.error("Failed to create budget requests collection:", e);
  }
}
