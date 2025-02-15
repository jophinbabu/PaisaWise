"use server";
"use server"

import { revalidatePath } from "next/cache"
import { Query } from "node-appwrite";

import { createSession } from "@/config/appwrite.config";
import { balanceDataCollectionId } from "@/models/collections/balance-sheet";
import { dbName } from "@/models/dbSetup";

import { getOrgs } from "../../(actions)/getOrgs";

export interface BalanceSheetData {
  year: string
  quarter:string
  currentAssets: Record<string, string>
  nonCurrentAssets: Record<string, string>
  currentLiabilities: Record<string, string>
  nonCurrentLiabilities: Record<string, string>
  shareholdersEquity: Record<string, string>
}

export async function checkExistingData(year: string, quarter: string): Promise<boolean> {
  // Simulate API call
  console.log("Checking existing data for year", year, "and quarter", quarter)  
  const {database} = await createSession();
  const orgdata =await getOrgs();
  const data = await database.listDocuments(dbName,balanceDataCollectionId,[
    Query.limit(1),
    Query.and([
      Query.equal("year",year),
      Query.equal("quarter",quarter),
      Query.equal("orgId",orgdata.$id)

    ])
  ])

  if (data.total > 0) {
    console.log("Data exists")
    return true
  }
  // Return random boolean to simulate existing data
  return false
}

export async function fetchBalanceSheetData(year: string, quarter: string): Promise<BalanceSheetData> {
  // Simulate API call
  const {database} = await createSession();
  const orgdata =await getOrgs();
  const data = await database.listDocuments(dbName,balanceDataCollectionId,[
    Query.limit(1),
    Query.and([
      Query.equal("year",year),
      Query.equal("quarter",quarter),
      Query.equal("orgId",orgdata.$id)

    ])
  ])

  if (data.total > 0) {
    console.log("Data exists")
    return {
      year: data.documents[0].year,
      quarter: data.documents[0].quarter,

      currentAssets: JSON.parse(data.documents[0].currentAssets),
      nonCurrentAssets: JSON.parse(data.documents[0].nonCurrentAssets),
      currentLiabilities: JSON.parse(data.documents[0].currentLiabilities),
      nonCurrentLiabilities: JSON.parse(data.documents[0].nonCurrentLiabilities),
      shareholdersEquity: JSON.parse(data.documents[0].shareholdersEquity),
    }
  }
  // Return dummy data
  return {
    year: year,
    quarter: quarter,
    currentAssets: {  },
    nonCurrentAssets: {  },
    currentLiabilities: {  },
    nonCurrentLiabilities: {  },
    shareholdersEquity: {  },
  }
}

export async function saveBalanceSheetData(data: BalanceSheetData): Promise<void> {
  // Simulate API call
  console.log("Saving balance sheet data:", data)
  const {database} = await createSession();
  const orgdata =await getOrgs();

  const isExisting = await checkExistingData(data.year, data.quarter);

  if (!isExisting){
    await database.createDocument(dbName,balanceDataCollectionId,orgdata.$id,{
      year: data.year,
      orgId: orgdata.$id,
      quarter: data.quarter,
      currentAssets: JSON.stringify(data.currentAssets),
      nonCurrentAssets: JSON.stringify(data.nonCurrentAssets),
      currentLiabilities: JSON.stringify(data.currentLiabilities),
      nonCurrentLiabilities: JSON.stringify(data.nonCurrentLiabilities),
      shareholdersEquity: JSON.stringify(data.shareholdersEquity),
    })
  }else{
    await database.updateDocument(dbName,balanceDataCollectionId,orgdata.$id,{
      year: data.year,
      orgId: orgdata.$id,
      quarter: data.quarter,
      currentAssets: JSON.stringify(data.currentAssets),
      nonCurrentAssets: JSON.stringify(data.nonCurrentAssets),
      currentLiabilities: JSON.stringify(data.currentLiabilities),
      nonCurrentLiabilities: JSON.stringify(data.nonCurrentLiabilities),
      shareholdersEquity: JSON.stringify(data.shareholdersEquity),
    })
  }



  revalidatePath("/balance-sheet")
}

