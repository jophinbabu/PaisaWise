"use client"

import { format } from "date-fns"
import { Download } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { formatIndianCurrency } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"

interface BalanceSheetEntry {
  description: string
  type: "asset" | "liability"
  flow: "inflow" | "outflow"
  amount: number
  department: string
  name: string
  createdat: string
}

interface BalanceSheetTableProps {
  initialData: BalanceSheetEntry[]
}

export function BalanceSheetTable({ initialData }: BalanceSheetTableProps) {
  const [data] = useState(initialData)

  const handlePrint = () => {
    window.print()
  }

  const inflow = data.filter((item) => item.type === "asset")
  const outflow = data.filter((item) => item.type === "liability")

  const calculateTotal = (items: BalanceSheetEntry[]) => {
    return items.reduce((acc, item) => {
      return acc + (item.flow === "inflow" ? item.amount : -item.amount)
    }, 0)
  }

  const assetsTotal = calculateTotal(inflow)
  const liabilitiesTotal = calculateTotal(outflow)
  const netBalance = assetsTotal + liabilitiesTotal

  return (
    <div className="space-y-6">
      {/* Download PDF Button (Hidden in Print Mode) */}
      <div className="flex justify-end print:hidden">
        <Button variant="outline" size="sm" className="ml-auto print:hidden" onClick={handlePrint}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Assets Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-4">Inflow</h3>
          <div className="space-y-2">
            {inflow.map((item, index) => (
              <div key={index} className="grid grid-cols-2 py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.department} • {format(new Date(item.createdat), "PP")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={item.flow === "inflow" ? "text-green-600" : "text-red-600"}>
                    {item.flow === "inflow" ? "+" : "-"} {formatIndianCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2">
                <p className="font-semibold">Total Inflow</p>
                <p className="text-right font-semibold">{formatIndianCurrency(assetsTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liabilities Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-4">Outflow</h3>
          <div className="space-y-2">
            {outflow.map((item, index) => (
              <div key={index} className="grid grid-cols-2 py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.department} • {format(new Date(item.createdat), "PP")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={item.flow === "inflow" ? "text-green-600" : "text-red-600"}>
                    {item.flow === "inflow" ? "+" : "-"} {formatIndianCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2">
                <p className="font-semibold">Total Outflow</p>
                <p className="text-right font-semibold">{formatIndianCurrency(liabilitiesTotal)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-2">
          <p className="text-lg font-semibold">Net Balance</p>
          <p className={`text-lg font-semibold text-right ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatIndianCurrency(netBalance)}
          </p>
        </div>
      </div>
      <Button className="print:hidden">
        <Link href="/dashboard/finances">
       Advanced balance sheet
       </Link>
      </Button>
    </div>
  )
}
