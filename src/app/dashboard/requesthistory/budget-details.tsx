"use client"

import { Eye } from "lucide-react"

import { formatIndianCurrency } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface BudgetDetailsDialogProps {
  budget: {
    userName: string
    title: string
    purpose: string
    businessImpact: string
    involvedDepartments: string[]
    amountRequired: number
    detailedDescription: string
    approved: boolean
  }
}

export function BudgetDetailsDialog({ budget }: BudgetDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{budget.title}</DialogTitle>
          <DialogDescription>Budget Request Details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Amount:</span>
            <span className="col-span-3">{formatIndianCurrency(budget.amountRequired)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Purpose:</span>
            <span className="col-span-3">{budget.purpose}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Business Impact:</span>
            <span className="col-span-3">{budget.businessImpact}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Requested By:</span>
            <span className="col-span-3">{budget.userName}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Departments:</span>
            <div className="col-span-3 flex flex-wrap gap-1">
              {budget.involvedDepartments.map((dept) => (
                <span key={dept} className="bg-muted px-2 py-1 rounded-md text-sm">
                  {dept}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <span className="font-medium">Description:</span>
            <div className="col-span-3 whitespace-pre-wrap">{budget.detailedDescription}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

