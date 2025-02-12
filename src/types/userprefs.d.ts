import { Models } from "node-appwrite";

export type UserPrefs = Models.Preferences & {
    isOnboardingCompleted: boolean;
}