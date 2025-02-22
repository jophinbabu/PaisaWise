"use client"

import { MoreVertical } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

import { updateBudgetApproval } from "./(action)/viewrequest"

interface BudgetActionsProps {
  budgetId: string
  isApproved: boolean
}

export function BudgetActions({ budgetId, isApproved }: BudgetActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleApprovalUpdate = async (approved: boolean) => {
    setIsLoading(true)
    try {
      const result = await updateBudgetApproval(budgetId, approved)
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update budget approval status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isApproved && (
          <DropdownMenuItem onClick={() => handleApprovalUpdate(true)} disabled={isLoading}>
            Approve Budget
          </DropdownMenuItem>
        )}
        {isApproved && (
          <DropdownMenuItem
            onClick={() => handleApprovalUpdate(false)}
            disabled={isLoading}
            className="text-destructive"
          >
            Revoke Approval
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

