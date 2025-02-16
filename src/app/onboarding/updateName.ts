"use server";
import { revalidatePath } from "next/cache";
import { AppwriteException } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";

export const updateUserName = async (name: string) => {
  // get user prefs
  const { account } = await createSession();
  try {
    await account.updateName(name)
  } catch (e) {
    if (e instanceof AppwriteException) {
      return {
        success: false,
        message: e.message,
      };
    }
    return {
      success: false,
      message: "Unable to update name",
    };
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  
  return {
    success:true
  };
};
