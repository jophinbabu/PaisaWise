import { IndexType, Permission } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config";

import { dbName } from "../dbSetup";

const collectionId = "Balancesheetreal";
const collectionName = collectionId;

export const balancesheetCollectionId = collectionId;

export async function balancesheetCreate() {
  try {
    const { database } = await createAdminClient();

    // ✅ Create the collection
    await database.createCollection(dbName, collectionId, collectionName);
    console.log("Collection created. Waiting for stabilization...");

    // ✅ Wait for collection creation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // ✅ Add attributes (removed default value from `createdAt`)
    await Promise.all([
      database.createStringAttribute(dbName, collectionId, "name", 100, true),
      database.createStringAttribute(dbName, collectionId, "description", 500, false),
      database.createEnumAttribute(dbName, collectionId, "type", ["asset", "liability"], true),
      database.createEnumAttribute(dbName, collectionId, "flow", ["inflow", "outflow"], true),
      database.createFloatAttribute(dbName, collectionId, "amount", true),
      database.createStringAttribute(dbName, collectionId, "departmentName", 100, false),
      database.createStringAttribute(dbName, collectionId, "User", 100, false),
      database.createDatetimeAttribute(dbName, collectionId, "createdAt", true),
    ]);

    console.log("Attributes added. Waiting for stabilization...");

    // ✅ Wait for attributes to be fully processed
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // ✅ Fix incorrect attribute names in indexes
    await Promise.all([
      database.createIndex(dbName, collectionId, "type", IndexType.Key, ["type"], ["ASC"]),
      database.createIndex(dbName, collectionId, "flow", IndexType.Key, ["flow"], ["ASC"]),
      database.createIndex(dbName, collectionId, "departmentName", IndexType.Key, ["departmentName"], ["ASC"]),
      database.createIndex(dbName, collectionId, "User", IndexType.Key, ["User"], ["DESC"]),
    ]);

    console.log("Indexes added successfully!");

    // ✅ Set correct permissions
    await database.updatePermissions(dbName, collectionId, [
      Permission.read("any"),
      Permission.write("user:$id"),
      Permission.update("user:$id"),
      Permission.delete("user:$id"),
    ]);

    console.log("Permissions set successfully!");

  } catch (e) {
    console.error("Failed to create financial records collection:", e);
  }
}
