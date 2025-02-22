"use server";

import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balancesheetCollectionId } from "@/models/collections/balancesheet"; // Import balancesheet collection ID
import { budgetCollectionId } from "@/models/collections/budgetCollection";
import { dbName } from "@/models/dbSetup";
import { AuthSession } from "@/utils/AuthSession";

import { specificBudget } from "../../limit-expenses/(actions)/Budget";

export const createRequestBudget = async (data: {
    title: string;
    purpose: string;
    impact: string;
    amount: number;
    description: string;
    departmentNames: string[];
}) => {
    try {
        // Getting sum of all the department budgets
        const allDeptBudget = await Promise.all(
            data.departmentNames.map(async (dept) => {
                const budget = await specificBudget(dept);
                return parseFloat(budget?.limit) || 0;
            })
        );
        console.log("All Department Budgets:", allDeptBudget);
        const total = allDeptBudget.reduce((acc, curr) => acc + curr, 0);
        const { $id, name } = await AuthSession.getUser();
        const { database } = await createSession();

        // Determine approval status
        const approved = data.amount <= total;
        console.log("Approved:", approved);
        console.log("Total:", total);

        // Save the budget request
        await database.createDocument(dbName, budgetCollectionId, ID.unique(), {
            title: data.title,
            purpose: data.purpose,
            businessImpact: data.impact,
            involvedDepartments: data.departmentNames, // Save involved departments
            amountRequired: data.amount,
            detailedDescription: data.description,
            memberId: $id,
            approved, // Save approval status
        });

        // ✅ If approved, add the entry to Balancesheetreal
        if (approved) {
            await database.createDocument(
                dbName,
                balancesheetCollectionId,
                ID.unique(),
                {
                    name: data.title, // Use title as name
                    description: data.description,
                    type: "liability", // Since it's a budget allocation
                    flow: "outflow",
                    departmentName: data.departmentNames.join(", "), // Save departments as a comma-separated string
                    amount: data.amount,
                    User: name, // The user who requested
                    createdAt: new Date().toISOString(),
                }
            );
        }

        // Revalidate the request-budget dashboard
        revalidatePath("/dashboard/request-budget");

        return {
            success: true,
            approved, // Return approval status for frontend handling
        };
    } catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};
