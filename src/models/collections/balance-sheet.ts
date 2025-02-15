import { IndexType, Permission } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config";

import { dbName } from "../dbSetup";

const collectionId = "balanceSheetData";
const collectionName = collectionId;

export const balanceDataCollectionId = collectionId;

export async function balanceDataCollectionCreate() {
  try {
    const { database } = await createAdminClient();

    // Create the FinancialData collection
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

    // Create attributes for the FinancialData collection
    await Promise.all([
      database.createStringAttribute(dbName, collectionId, "orgId", 36, true),
      database.createStringAttribute(dbName, collectionId, "year", 4, true), // e.g., "2025"
      database.createStringAttribute(dbName, collectionId, "quarter", 10, true), // e.g., "Q1", "Q2"
      database.createStringAttribute(
        dbName,
        collectionId,
        "currentAssets",
        900,
        false // JSON string for current assets
      ),
      database.createStringAttribute(
        dbName,
        collectionId,
        "nonCurrentAssets",
        900,
        false // JSON string for non-current assets
      ),
      database.createStringAttribute(
        dbName,
        collectionId,
        "currentLiabilities",
        900,
        false // JSON string for current liabilities
      ),
      database.createStringAttribute(
        dbName,
        collectionId,
        "nonCurrentLiabilities",
        900,
        false // JSON string for non-current liabilities
      ),
      database.createStringAttribute(
        dbName,
        collectionId,
        "shareholdersEquity",
        900,
        false // JSON string for shareholder's equity
      ),
    ]);

    // Create indexes for the FinancialData collection

      await database.createIndex(
        dbName,
        collectionId,
        "orgId",
        IndexType.Key,
        ["orgId"],
        ["ASC"]
      )


    await database.createIndex(
      dbName,
      collectionId,
      "quarter",
      IndexType.Key,
      ["quarter"],
      ["ASC"]
    );

    await database.createIndex(
      dbName,
      collectionId,
      "year",
      IndexType.Key,
      ["year"],
      ["ASC"]
    );

    console.log("FinancialData collection created successfully!");
  } catch (e) {
    console.error("Failed to create financial data collection:", e);
  }
}
