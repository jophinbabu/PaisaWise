"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

import { setBudget } from "./(actions)/Budget"

const formSchema = z.object({
  budgetLimit: z
    .string()
    .min(1, "Budget limit is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please enter a valid positive number",
    }),
})

type FormValues = z.infer<typeof formSchema>

export default function BudgetLimitPage({
  budgetLimit: initialBudget,
}: {
  budgetLimit: string
}) {
  const { toast } = useToast()
  const [currentLimit, setCurrentLimit] = useState(initialBudget)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budgetLimit: initialBudget,
    },
  })

  const onSubmit = async (values: FormValues) => {
    const numericValue = Number(values.budgetLimit)

    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid budget limit",
      })
      return
    }

    try {
      toast({
        title: "Budget limit updating...",
        description: `New budget limit will be set to $${Number(values.budgetLimit).toLocaleString()}`,
      })
      await setBudget(values.budgetLimit)
      setCurrentLimit(values.budgetLimit)

      toast({
        title: "Budget limit updated",
        description: `New budget limit set to $${Number(values.budgetLimit).toLocaleString()}`,
      })

      form.reset({ budgetLimit: values.budgetLimit })
    } catch  {
      toast({
        variant: "destructive",
        title: "Limit Setting Failed",
        description: "We are working on this...",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Budget Limit Settings</CardTitle>
          <CardDescription>Set and manage your organization&apos;s budget limit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Current Budget Limit</p>
                <p className="text-2xl font-bold">${Number(currentLimit).toLocaleString()}</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="budgetLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Budget Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter new budget limit"
                          min="0"
                          step="1000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>Enter the new total budget limit for your organization</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Update Budget Limit
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

