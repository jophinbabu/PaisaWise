import React from 'react'

import { getBudget } from './(actions)/Budget';
import BudgetLimitPage from './Budget-Limit'

async function Page() {
    const budget = await getBudget();
  return (
<>
<BudgetLimitPage budgetLimit={budget.budget}/>
</>
  )
}

export default Page