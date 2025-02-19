"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, IndianRupee } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import { setBudget } from "./(actions)/Budget";

const formSchema = z.object({
  budgetLimit: z
    .string()
    .min(1, "Budget limit is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please enter a valid positive number",
    }),
});

type FormValues = z.infer<typeof formSchema>;

type BudgetLimitPageProps = {
  budgetLimits: { department: string; limit: number }[];
};

export default function BudgetLimitPage({ budgetLimits: initialBudgets }: BudgetLimitPageProps) {
  const { toast } = useToast();
  const [budgetLimits, setBudgetLimits] = useState(initialBudgets);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budgetLimit: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!selectedDepartment) return;

    const numericValue = Number(values.budgetLimit);

    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid budget limit",
      });
      return;
    }

    try {
      toast({
        title: "Budget limit updating...",
        description: `New budget limit for ${selectedDepartment} will be set to ₹${numericValue.toLocaleString()}`,
      });
      await setBudget(selectedDepartment, String(numericValue)).then((res) => {
        if (!res.success) {
          throw new Error(res.message);
        }
      });
      setBudgetLimits((prev) =>
        prev.map((limit) =>
          limit.department === selectedDepartment
            ? { ...limit, limit: numericValue }
            : limit
        )
      );

      toast({
        title: "Budget limit updated",
        description: `New budget limit for ${selectedDepartment} set to ₹${numericValue.toLocaleString()}`,
      });

      form.reset({ budgetLimit: "" });
      setSelectedDepartment(null);
    } catch {
      toast({
        variant: "destructive",
        title: "Limit Setting Failed",
        description: "We are working on this...",
      });
    }
  };
  console.log(budgetLimits);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Budget Limit Settings</CardTitle>
          <CardDescription>
            Set and manage your organization&apos;s budget limits by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetLimits.map((dept,index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <IndianRupee className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{dept.department}</p>
                      <p className="text-2xl font-bold">
                        ₹{Number(dept.limit || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedDepartment(dept.department)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Budget for {dept.department}</DialogTitle>
                        <DialogDescription>
                          Set a new budget limit for this department.
                        </DialogDescription>
                      </DialogHeader>
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
                                    placeholder={`Current: ₹${Number(dept.limit || 0).toLocaleString()}`}
                                    min="0"
                                    step="1000"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value)}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter the new budget limit for {dept.department}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Update Budget Limit
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
