import Link from "next/link";
import { Models } from "node-appwrite";
import React from "react";

import { Button } from "@/components/ui/button";

import { getTransactions } from "./(actions)/cash-flow";
import CashPage, { Entry } from "./cash";

async function Page() {
  const transactions = (await getTransactions()) as Models.DocumentList<Entry>;

  return (
    <>
      <CashPage transactions={transactions} />
      <Link href="/dashboard/finances">
        <Button>Advanced Balance Sheet</Button>
      </Link>
    </>
  );
}

export default Page;
