import React from "react";

import { getBudget } from "./(actions)/Budget";
import BudgetLimitPage from "./Budget-Limit";

async function Page() {
  // Dummy data for budgetLimits
  const budget = await getBudget();

  return (
    <>
      <BudgetLimitPage budgetLimits={budget} />
    </>
  );
}

export default Page;
