"use client";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getBalanceSheetByDateRange, getBalanceSheetData } from "./(actions)/balancesheet";
import { BalanceSheetTable } from "./balance-sheet-table";
import { DateRangePicker } from "./date-range-picker";

// Define the BalanceSheetEntry interface
interface BalanceSheetEntry {
  description: string;
  type: "asset" | "liability";
  flow: "inflow" | "outflow";
  amount: number;
  department: string;
  name: string;
  createdat: string;
}

export default function BalanceSheetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set the type of `data` to BalanceSheetEntry[]
  const [data, setData] = useState<BalanceSheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Retrieve date range from URL params
  const initialStartDate = searchParams.get("startDate");
  const initialEndDate = searchParams.get("endDate");

  // Convert params to Date objects and store them in state
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(
    initialStartDate && initialEndDate
      ? { from: new Date(initialStartDate), to: new Date(initialEndDate) }
      : undefined
  );

  // Fetch balance sheet data when selectedDateRange changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let response;

      if (selectedDateRange?.from && selectedDateRange?.to) {
        response = await getBalanceSheetByDateRange(
          format(selectedDateRange.from, "yyyy-MM-dd"),
          format(selectedDateRange.to, "yyyy-MM-dd")
        );
      } else {
        response = await getBalanceSheetData();
      }

      // Set the data state with the fetched data
      setData(response.success ? response.data ?? [] : []);
      setLoading(false);
    }

    fetchData();
  }, [selectedDateRange]);

  // Handle date selection and update URL
  const handleDateChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range);

    if (range?.from && range?.to) {
      router.push(
        `/dashboard/balancesheet?startDate=${format(range.from, "yyyy-MM-dd")}&endDate=${format(range.to, "yyyy-MM-dd")}`
      );
    } else {
      router.push("/dashboard/balancesheet");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Balance Sheet</CardTitle>
          {/* Pass selectedDateRange to DateRangePicker */}
          <DateRangePicker onDateChange={handleDateChange} selectedRange={selectedDateRange} />
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : <BalanceSheetTable initialData={data} />}
        </CardContent>
      </Card>
    </div>
  );
}