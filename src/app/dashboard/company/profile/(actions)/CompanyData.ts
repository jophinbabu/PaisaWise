"use server";
import { revalidatePath } from "next/cache";

import { getOrgs } from "@/app/dashboard/(actions)/getOrgs";
import { createSession } from "@/config/appwrite.config";

import { isOwner } from "../../../(actions)/isActivemember";

export const getCompanyData = async () => {
    const { $id, prefs, name } = await getOrgs();

    return {
        companyId: $id,
        companyName: name,
        description: prefs?.description ?? "",
        category: prefs?.category ?? "",
    };
};

export const setCompanyData = async (data: { description: string; category: string; name: string }) => {
    const isOwnerRes = await isOwner();

    if (!isOwnerRes) {
        return {
            success: false,
            message: "You are not authorized to update company details.",
        };
    }

    try {
        const { $id: orgId } = await getOrgs();
        const { teams } = await createSession();

        const prefs = {
            description: data.description,
            category: data.category,
        };

        await teams.updateName(orgId, data.name);
        await teams.updatePrefs(orgId, prefs);

        revalidatePath(`/dashboard`);

        return {
            success: true,
        };
    } catch (e) {
        if (e instanceof Error) {
            return {
                success: false,
                message: e.message,
            };
        }
        return {
            success: false,
            message: "An error occurred",
        };
    }
};
