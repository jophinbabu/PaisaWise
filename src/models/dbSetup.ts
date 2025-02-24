import { AppwriteException } from "node-appwrite";

import { createAdminClient } from "@/config/appwrite.config"

import { balanceDataCollectionCreate } from "./collections/balance-sheet";
import { balancesheetCreate } from "./collections/balancesheet";
import { budgetCollectionId, BudgetRequestsCollectionCreate } from "./collections/budgetCollection";
import { BudgetDataCollectionCreate, budgetDeptCollectionId } from "./collections/budgetData";
import { FinancialRecordsCollectionCreate } from "./collections/financesCollection";

export const dbName = "main"

export default async function CreateOrSetupDB(){
    try{
        const {database} = await createAdminClient();

        await database.get(dbName).catch(async (e)=>{
            if (e instanceof AppwriteException){
                if (e.code == 404 && e.type == "database_not_found"){
                    console.log("Creating DB")
                    await database.create(dbName,dbName,true)
                }}
        })
        console.log("DB existsw")
            // check if collections exist and create them 
    await Promise.all([
        (async function(){
            await database.getCollection(dbName,budgetCollectionId).catch(async e=>{
                if (e instanceof AppwriteException){
                    if (e.code == 404 && e.type == "collection_not_found"){
                        await BudgetRequestsCollectionCreate()
                    }
                }
            })
            console.log("Budget Collection exists")
        })(),
        (async function(){
            await database.getCollection(dbName,"financialRecords").catch(async e=>{
                if (e instanceof AppwriteException){
                    if (e.code == 404 && e.type == "collection_not_found"){
                        await FinancialRecordsCollectionCreate()
                    }
                }
            })
            console.log("Financial Records Collection exists")
        })(),
        (async function(){
            await database.getCollection(dbName,"balanceSheetData").catch(async e=>{
                if (e instanceof AppwriteException){
                    if (e.code == 404 && e.type == "collection_not_found"){
                        await balanceDataCollectionCreate()
                    }
                }
            })
            console.log("Balance Sheet Collection exists")
        })(),
        (async function(){
            await database.getCollection(dbName,"balancesheetreal").catch(async e=>{
                if (e instanceof AppwriteException){
                    if (e.code == 404 && e.type == "collection_not_found"){
                        await balancesheetCreate()
                    }
                }
            })
            console.log("Balance Sheet Real Collection exists")
        }
        )(),
        (async function(){
            await database.getCollection(dbName,budgetDeptCollectionId).catch(async e=>{
                if (e instanceof AppwriteException){
                    if (e.code == 404 && e.type == "collection_not_found"){
                        await BudgetDataCollectionCreate()
                    }
                }
            })
            console.log("Budget Data Collection exists")
        })()
    ])
    }catch(e){
        console.error(e)

    }
  






        
    
}