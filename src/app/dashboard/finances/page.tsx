"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import {
  type BalanceSheetData,
  checkExistingData,
  fetchBalanceSheetData,
  saveBalanceSheetData,
} from "./(actions)/balance-sheet-actions";

const BalanceSheet = () => {
  const [year, setYear] = useState<string>("");
  const [quarter, setQuarter] = useState<string>("");
  const [showBalanceSheet, setShowBalanceSheet] = useState<boolean>(false);
  const [showSaveDialog, setShowSaveDialog] = useState<boolean>(false);
  const [showDataCheckDialog, setShowDataCheckDialog] = useState<boolean>(false);
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData>({
    year: year,
    quarter: quarter,
    currentAssets: {},
    nonCurrentAssets: {},
    currentLiabilities: {},
    nonCurrentLiabilities: {},
    shareholdersEquity: {},
  });

  const [checkDataStatus, setCheckDataStatus] = useState<string>("idle");
 

  const { toast } = useToast();

  const currentAssets = [
    "Cash and Cash Equivalents",
    "Bank Deposits",
    "Trade Receivables",
    "Investments",
    "Other Current Financial Assets",
    "Unbilled Receivables",
    "Current Income Tax assets",
    "Other Current Assets",
  ];

  const nonCurrentAssets = [
    "Bank Deposits",
    "Other Non Current Financial Assets",
    "Non Current Income Tax Assets",
    "Deferred Income Tax Assets",
    "Property, Plant and Equipment, net",
    "Right-of-use assets",
    "Goodwill, net",
    "Other Intangible Assets, net",
    "Investments",
    "Trade Receivables",
    "Unbilled Receivables",
    "Other Non-Current Assets",
  ];

  const currentLiabilities = [
    "Trade and Other Payables",
    "Short-term Borrowings",
    "Mandatorily Redeemable Preference shares with Tata Sons Ltd",
    "Lease liabilities",
    "Other Current Financial Liabilities",
    "Unearned and Deferred Revenue",
    "Employee Benefit Obligations",
    "Other provisions",
    "Current Income Tax Liabilities",
    "Accrued Expenses and Other Current Liabilities",
  ];

  const nonCurrentLiabilities = [
    "Long-Term Debt / Borrowings",
    "Lease liabilities",
    "Other Non Current Financial Liabilities",
    "Unearned and deferred revenue",
    "Employee Benefit Obligation",
    "Other provisions",
    "Deferred Income Tax Liabilities",
    "Other Non-Current Liabilities",
  ];

  const shareholdersEquity = [
    "Share Capital",
    "Share premium",
    "Other reserves",
    "Retained Earnings",
    "Non Controlling Interests",
  ];

  const handleYearChange = (value: string) => {
    console.log(value);
    const yearNum = parseInt(value);
    console.log(yearNum);
    if (value === "" || (!isNaN(yearNum))) {
      setYear(()=>value);
    }
  };

  const handleInputChange = (section: keyof BalanceSheetData, item: string, value: string) => {
    setBalanceSheetData((prevData) => ({
      ...prevData,
      [section]: {
        ...(typeof prevData[section] === 'object' && prevData[section] !== null ? prevData[section] : {}),
        [item]: value,
      },
    }));
  };

  const renderTable = (section: keyof BalanceSheetData, items: string[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Amount (INR Mn)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item}>
            <TableCell>{item}</TableCell>
            <TableCell>
              <Input
                type="number"
                value={(balanceSheetData[section] as Record<string, string>)[item] || ""}
                onChange={(e) => handleInputChange(section, item, e.target.value)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const handleContinue = async () => {
    if (!year || !quarter) {
      toast({
        title: "Error",
        description: "Please enter both year and quarter",
        variant: "destructive",
      });
      return;
    }

    const yearNum = Number.parseInt(year);
    if (yearNum < 1900 || yearNum > 2100) {
      toast({
        title: "Error",
        description: "Please enter a valid year between 1900 and 2100",
        variant: "destructive",
      });
      return;
    }

    setShowDataCheckDialog(true);
    setCheckDataStatus("executing");
    const dataExists = await checkExistingData(year, quarter);
    setCheckDataStatus("idle");

    if (dataExists) {
      toast({
        title: "Existing Data Found",
        description: "Previous data found for the selected year and quarter. Proceeding will update the existing data.",
      });
    } else {
      toast({
        title: "New Data Entry",
        description: "No existing data found. A new entry will be created.",
      });
    }

    // setFetchDataStatus("executing");
    const fetchedData = await fetchBalanceSheetData(year, quarter);
    setBalanceSheetData(fetchedData);
    // setFetchDataStatus("idle");

    setShowDataCheckDialog(false);
    setShowBalanceSheet(true);
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const confirmSave = async () => {
    // setSaveDataStatus("executing");
    await saveBalanceSheetData(balanceSheetData).then(res=>{
      if (!res.success){
        throw new Error(res.message)}
    }).catch((e)=>{
      if (e instanceof Error){
        toast({
          title: "Error",
          description: e.message,
          variant: "destructive",
        });
      }else{
        toast({
          title: "Error",
          description: "An error occurred",
          variant: "destructive",
        });
      }

    });
    // setSaveDataStatus("idle");

    toast({
      title: "Success",
      description: "Data saved successfully!",
    });

    setShowSaveDialog(false);
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([balanceSheetData]);
    XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");
    XLSX.writeFile(wb, `BalanceSheet_${year}_Q${quarter}.xlsx`);
  };

  const renderSaveDialog = () => (
    <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Balance Sheet Data</AlertDialogTitle>
          <AlertDialogDescription>Please review the following data before saving:</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current Assets</h3>
            {renderConfirmationTable("currentAssets", currentAssets)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Non-Current Assets</h3>
            {renderConfirmationTable("nonCurrentAssets", nonCurrentAssets)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Current Liabilities</h3>
            {renderConfirmationTable("currentLiabilities", currentLiabilities)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Non-Current Liabilities</h3>
            {renderConfirmationTable("nonCurrentLiabilities", nonCurrentLiabilities)}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Shareholders' Equity</h3>
            {renderConfirmationTable("shareholdersEquity", shareholdersEquity)}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const renderConfirmationTable = (section: keyof BalanceSheetData, items: string[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Amount (INR Mn)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item}>
            <TableCell>{item}</TableCell>
            <TableCell>{(balanceSheetData[section] as Record<string, string>)[item] || "0"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderDataCheckDialog = () => (
    <AlertDialog open={showDataCheckDialog} onOpenChange={setShowDataCheckDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {checkDataStatus === "executing" ? "Checking for existing data..." : "Data Check Complete"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {checkDataStatus === "executing"
              ? "Please wait while we check for existing data."
              : "Data check complete. You can now proceed."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {checkDataStatus !== "executing" && (
            <>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setShowDataCheckDialog(false)}>Proceed</AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (!showBalanceSheet) {
    return (
      <>
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Enter Balance Sheet Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="string"
                  placeholder="e.g., 2023"
                  value={year}
                  onChange={(e) => handleYearChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quarter">Quarter</Label>
                <Select onValueChange={setQuarter} value={quarter}>
                  <SelectTrigger id="quarter">
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1</SelectItem>
                    <SelectItem value="Q2">Q2</SelectItem>
                    <SelectItem value="Q3">Q3</SelectItem>
                    <SelectItem value="Q4">Q4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleContinue} className="w-full">Continue</Button>
            </div>
          </CardContent>
        </Card>
        {renderDataCheckDialog()}
      </>
    );
  }

  return (
    <>
      <Tabs defaultValue="currentAssets" className="w-full">
        <TabsList>
          <TabsTrigger value="currentAssets">Current Assets</TabsTrigger>
          <TabsTrigger value="nonCurrentAssets">Non-Current Assets</TabsTrigger>
          <TabsTrigger value="currentLiabilities">Current Liabilities</TabsTrigger>
          <TabsTrigger value="nonCurrentLiabilities">Non-Current Liabilities</TabsTrigger>
          <TabsTrigger value="shareholdersEquity">Shareholders' Equity</TabsTrigger>
        </TabsList>
        <TabsContent value="currentAssets">
          {renderTable("currentAssets", currentAssets)}
        </TabsContent>
        <TabsContent value="nonCurrentAssets">
          {renderTable("nonCurrentAssets", nonCurrentAssets)}
        </TabsContent>
        <TabsContent value="currentLiabilities">
          {renderTable("currentLiabilities", currentLiabilities)}
        </TabsContent>
        <TabsContent value="nonCurrentLiabilities">
          {renderTable("nonCurrentLiabilities", nonCurrentLiabilities)}
        </TabsContent>
        <TabsContent value="shareholdersEquity">
          {renderTable("shareholdersEquity", shareholdersEquity)}
        </TabsContent>
      </Tabs>
      <div className="flex justify-end space-x-4 mt-4">
        <Button onClick={handleExport}>Export</Button>
        <Button onClick={handleSave} variant="secondary">Save</Button>
      </div>
      {renderSaveDialog()}
    </>
  );
};

export default BalanceSheet;
