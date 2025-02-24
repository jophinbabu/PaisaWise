import { formatIndianCurrency } from "@/app/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toaster } from "@/components/ui/toaster"

import { getRequestBudgets } from "./(action)/viewrequest"
import { BudgetDetailsDialog, BudgetDetailsDialogProps } from "./budget-details"
import { BudgetActions } from "./budgetactions"

export default async function BudgetsPage() {
  const { success, budgets } = await getRequestBudgets()
  console.log("budgets", budgets)

  if (!success || !budgets) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Failed to load budget requests.</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Budget Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="hidden md:table-cell">Business Impact</TableHead>
                  <TableHead className="hidden lg:table-cell">Departments</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((budget) => (
                  <TableRow key={budget.$id}>
                    <TableCell className="font-medium">{budget.title}</TableCell>
                    <TableCell>{budget.purpose}</TableCell>
                    <TableCell className="hidden md:table-cell">{budget.businessImpact}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {budget.involvedDepartments.map((dept: string) => (
                          <Badge key={dept} variant="secondary">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatIndianCurrency(budget.amountRequired)}</TableCell>
                    <TableCell>
                      <Badge variant={budget.approved ? "success" : "secondary"}>
                        {budget.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BudgetDetailsDialog budget={budget as unknown as BudgetDetailsDialogProps["budget"]} />
                        <BudgetActions budgetId={budget.$id} isApproved={budget.approved} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

