import { Models } from 'node-appwrite';
import React from 'react'

import { getTransactions } from './(actions)/cash-flow';
import CashPage, { Entry } from './cash'

async function Page() {
    const transactions = await getTransactions() as Models.DocumentList<Entry>;
  return (
   <>
   <CashPage transactions={transactions}/>
   </>
  )
}

export default Page