declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      APPWRITE_PROJECT_ID: string;
      APPWRITE_ENDPOINT: string;
      APPWRITE_PROJECT_API_KEY: string;
    }
  }
}

export {};
