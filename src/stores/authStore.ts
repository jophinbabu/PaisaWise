import { AppwriteException } from "node-appwrite";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { AuthSession } from "@/utils/AuthSession";

interface IAuthStore {
  hydrated: boolean;
  userId: string | null;
  fetched: boolean;
  isLoggedIn: boolean;

  name: string;
  email: string;

  setHydrated(): void;
  rehydrate(): void;
}

export const useAuthStore = create<IAuthStore>()(
  persist(
    immer((set) => ({
      userId: null,
      fetched: false,
      isLoggedIn: false,
      name: "",
      email: "",
      hydrated: false,

      setHydrated() {
        set({ hydrated: true, fetched: true });
      },

      async rehydrate() {
        if (!window){
          return;
        }

        const isAuthenticated = await AuthSession.isAuthenticated();

        if (!isAuthenticated) {
          set({
            userId: null,
            isLoggedIn: false,
            hydrated: true,
            fetched: true,
          });
          return;
        }

        let user = null;
        try{
          user = await AuthSession.getUser()
        }catch(err){
          // check if error is type of AppwriteException
          console.log(err);
          if (err instanceof AppwriteException){
            // check if error code is user not loggged in
            const type = err.type;

            console.log(type);
            // since i am using JWT token, i will check if the error is of type 
            if (type == "user_jwt_invalid"){
                // this means the user is not logged in
                // so i will remove the token from the cookie
                await AuthSession.removeSessionToken();

                // i will again say to rehydrate the store
                this.rehydrate();

            }

        }
        }


        // if user is not found, then try again this will ke on trying until the user is found or isUserAuthenticated is false
        if (!user){
          console.log("User not found");  
          return;
            // this.rehydrate();
        }

        set({
          name: user?.name || "",
          email: user?.email || "",
          userId: user?.$id || "",
          isLoggedIn: isAuthenticated,
          hydrated: true,
          fetched: true,
        });
      },

    })),
    {
      name: "auth",
      onRehydrateStorage() {
        return async (state, error) => {
          if (!error && state) {
            state.hydrated = false;
            state.fetched = false;
          }
        };
      },
    }
  )
);
