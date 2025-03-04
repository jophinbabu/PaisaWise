"use server";
import { revalidatePath } from "next/cache";
import { ID } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balancesheetCollectionId } from "@/models/collections/balancesheet";
import { budgetCollectionId } from "@/models/collections/budgetCollection";
import { dbName } from "@/models/dbSetup";

import { anyUser } from "../../company/employee/(actions)/getUserInfo";



export const getRequestBudgets = async () => {
    try {

        const { database } = await createSession();
        const budgets = await database.listDocuments(dbName, budgetCollectionId);
        const GettingMemberDetailsToo = [];

        for (const budget of budgets.documents) {
            const user = await anyUser(budget.memberId);
            GettingMemberDetailsToo.push({
                user,
                budget,
            });
        }

       

        return {
            success: true,
            budgets: GettingMemberDetailsToo, // Returning only documents
        };
    } catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};
export const updateBudgetApproval = async (budgetId: string, approved: boolean) => {
    try {
        const { database } = await createSession();

        // Get the budget request details
        const budget = await database.getDocument(dbName, budgetCollectionId, budgetId);

        if (!budget) {
            throw new Error("Budget request not found.");
        }

        // Update the approval status of the budget request
        await database.updateDocument(dbName, budgetCollectionId, budgetId, {
            approved: approved,
        });

        // ✅ If approved, add the entry to Balancesheetreal
        if (approved) {
            const newentry = await database.createDocument(
                dbName,
                balancesheetCollectionId,
                ID.unique(),
                {
                    name: budget.title, // Use the budget title
                    description: budget.detailedDescription,
                    type: "liability", // Since it's a budget allocation
                    flow: "outflow",
                    departmentName: budget.involvedDepartments.join(", "), // Save departments as a comma-separated string
                    amount: budget.amountRequired,
                    User: budget.memberId, // The user who requested
                    memberId: "fsfsdfds",
                }
            );
            if (!newentry) {
                console.log(newentry);
                console.log("Failed to record budget in the balance sheet");
            }
        }

        // Revalidate the dashboard page
        revalidatePath("/dashboard/request-budget");

        return {
            success: true,
            message: `Budget ${approved ? "approved and recorded in the balance sheet" : "rejected"} successfully`,
        };
    } catch (e) {
        return {
            success: false,
            message: e instanceof Error ? e.message : "An error occurred",
        };
    }
};

