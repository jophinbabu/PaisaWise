import { IndexType, Permission } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config";

import { dbName } from "../dbSetup";

const collectionId = "Balancesheetreal";
const collectionName = collectionId;

export const balancesheetCollectionId = collectionId;

export async function balancesheetCreate() {
  try {
    const { database } = await createAdminClient();

    // Create the Balancesheetreal collection
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

    // Create attributes for the Balancesheetreal collection
    await Promise.all([
      database.createStringAttribute(dbName, collectionId, "name", 100, true),
      database.createStringAttribute(dbName, collectionId, "description", 500, false),
      database.createEnumAttribute(dbName, collectionId, "type", ["asset", "liability"], true),
      database.createEnumAttribute(dbName, collectionId, "flow", ["inflow", "outflow"], true),
      database.createFloatAttribute(dbName, collectionId, "amount", true),
      database.createStringAttribute(dbName, collectionId, "departmentName", 100, false),
      database.createStringAttribute(dbName, collectionId, "User", 100, false),
      database.createDatetimeAttribute(dbName, collectionId, "createdAt", true,(new Date (Date.now())).toISOString()),
      database.createStringAttribute(dbName, collectionId, "memberId", 100, true),
    ]);

    // Create indexes for the Balancesheetreal collection
    await Promise.all([
      database.createIndex(dbName, collectionId, "memberId", IndexType.Key, ["memberId"], ["ASC"]),
      database.createIndex(dbName, collectionId, "type", IndexType.Key, ["type"], ["ASC"]),
      database.createIndex(dbName, collectionId, "flow", IndexType.Key, ["flow"], ["ASC"]),
      database.createIndex(dbName, collectionId, "departmentName", IndexType.Key, ["departmentName"], ["ASC"]),
      database.createIndex(dbName, collectionId, "User", IndexType.Key, ["User"], ["DESC"]),
    ]);

    console.log("Balancesheetreal collection created successfully!");
  } catch (e) {
    console.error("Failed to create balancesheet collection:", e);
  }
}
