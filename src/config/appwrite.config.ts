import * as sdk from "node-appwrite";

import { AuthSession } from "@/utils/AuthSession";

export const createSession = async () => {
  const token = await AuthSession.getSessionToken();
  const client = new sdk.Client()
    .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
    .setProject("67b4bb8100158998d759") // Your project ID
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
    .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
    .setProject("67b4bb8100158998d759") // Your project ID
    .setKey("standard_7484127252e752d3f5743e72e0f185170b0c3653c236530b72ad34e4b4728826ae06072c9578bc79a0d690b85b1662fff5ce43df30fcf056a9427495b4c7943f6de69b2852b9dd64cf2e0b0963199966cba936c87d4c19ad54b248da59152ed517fb51f76bcbdd3107789e777866aaa80f02dc82b997f55163790b58c9b46be9"); // Your secret API key

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
