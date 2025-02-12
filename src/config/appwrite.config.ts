import * as sdk from "node-appwrite";

import { AuthSession } from "@/utils/AuthSession";

export class Client {
  async get() {
    const token = await AuthSession.getSessionToken();
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
      .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
      .setSession(token || ""); // The user session to authenticate with

    const account = new sdk.Account(client);
    const database = new sdk.Databases(client);
    const storage = new sdk.Storage(client);

    return { account, database, storage };
  }
}

export class Server {
  get() {
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
      .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
      .setKey(process.env.APPWRITE_PROJECT_API_KEY); // Your secret API key

    const account = new sdk.Account(client);
    const database = new sdk.Databases(client);
    const storage = new sdk.Storage(client);

    return { account, database, storage };
  }
}
