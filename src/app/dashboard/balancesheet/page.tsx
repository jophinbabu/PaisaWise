import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getBalanceSheetData } from "./(actions)/balancesheet";
import { BalanceSheetTable } from "./balance-sheet-table";
import { DateRangePicker } from "./date-range-picker";

export default async function BalanceSheetPage() {
    const response = await getBalanceSheetData();
    const data = response.success ? response.data ?? [] : []; // Ensure `data` is always an array

    console.log("Data:", data);

    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Balance Sheet</CardTitle>
            <DateRangePicker />
          </CardHeader>
          <CardContent>
            <BalanceSheetTable initialData={data} />
          </CardContent>
        </Card>
      </div>
    );
}
