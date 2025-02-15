import * as sdk from "node-appwrite";

import { AuthSession } from "@/utils/AuthSession";

export const createSession = async () => {
  const token = await AuthSession.getSessionToken();
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
    .setSession(token || ""); // The user session to authenticate with

  return {
    get account() {
      return new sdk.Account(client);
    },
    get database() {
      return new sdk.Databases(client);
    },
    get storage() {
      return new sdk.Storage(client);
    },
    get teams() {
      return new sdk.Teams(client);
    },
    get avatar() {
      return new sdk.Avatars(client);
    },
  };
};

export const createAdminClient = async () => {
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
    .setKey(process.env.APPWRITE_PROJECT_API_KEY); // Your secret API key

  return {
    get account() {
      return new sdk.Account(client);
    },
    get database() {
      return new sdk.Databases(client);
    },
    get Users(){
      return new sdk.Users(client);
    },
    get storage() {
      return new sdk.Storage(client);
    },
    get teams() {
      return new sdk.Teams(client);
    },
  };
};
