"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { createRequestBudget } from "./(actions)/create-request-budget"

const departments = [
  { label: "Engineering", value: "engineering" },
  { label: "Marketing", value: "marketing" },
  { label: "Sales", value: "sales" },
  { label: "Finance", value: "finance" },
  { label: "Human Resources", value: "hr" },
  { label: "Operations", value: "operations" },
  { label: "Research & Development", value: "rd" },
  { label: "Customer Support", value: "support" },
]

const purposes = [
  { label: "Equipment Purchase", value: "equipment" },
  { label: "Software License", value: "software" },
  { label: "Training & Development", value: "training" },
  { label: "Marketing Campaign", value: "marketing" },
  { label: "Travel & Events", value: "travel" },
  { label: "Office Supplies", value: "supplies" },
  { label: "Infrastructure", value: "infrastructure" },
  { label: "Consulting Services", value: "consulting" },
]

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  purpose: z.string().min(1, "Purpose is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .transform((value) => Number.parseFloat(value)),
  description: z.string().min(1, "Description is required"),
  impact: z.string().min(1, "Business impact is required"),
})

export default function BudgetRequestPage() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      purpose: "",
      amount: 0,
      description: "",
      impact: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedDepartments.length === 0) {
      toast({
        variant: "destructive",
        title: "No departments selected",
        description: "Please select at least one department",
      })
      return
    }

    try {
      toast({
        title: "Submitting request...",
        description: "Your budget request is being submitted",
      })

      // Send the form data to your backend
      await createRequestBudget({
        title: values.title,
        purpose: values.purpose,
        amount: values.amount,
        description: values.description,
        impact: values.impact
      }).then(res=>{
        if (!res.success){
          throw new Error(res.message)
        }
      })

      toast({
        title: "Request submitted",
        description: "Your budget request has been submitted successfully",
      })

      form.reset()
      setSelectedDepartments([])
    } catch(e){
      if (e instanceof Error) {
        toast({
          variant: "destructive",
          title: "Request submission failed",
          description: e.message || "An error occurred while submitting your request",
        })
        return;
      }
      toast({
        variant: "destructive",
        title: "Request submission failed",
        description: "An error occurred while submitting your request",
      })


    

    }
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Budget Request</CardTitle>
          <CardDescription>Submit a new budget request for your project or initiative</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Request Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your budget request" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the purpose of this request" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {purposes.map((purpose) => (
                            <SelectItem key={purpose.value} value={purpose.value}>
                              {purpose.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-2">
                  <FormLabel>Involved Departments</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between w-full">
                        {selectedDepartments.length > 0
                          ? `${selectedDepartments.length} department${
                              selectedDepartments.length === 1 ? "" : "s"
                            } selected`
                          : "Select departments..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search departments..." />
                        <CommandList>
                          <CommandEmpty>No departments found.</CommandEmpty>
                          <CommandGroup>
                            {departments.map((department) => (
                              <CommandItem
                                key={department.value}
                                onSelect={() => {
                                  setSelectedDepartments((prev) =>
                                    prev.includes(department.value)
                                      ? prev.filter((d) => d !== department.value)
                                      : [...prev, department.value],
                                  )
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedDepartments.includes(department.value) ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {department.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Required ₹</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" min="0" step="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detailed Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of what this budget will be used for"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Impact</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Explain how this budget will benefit the company"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      form.reset()
                      setSelectedDepartments([])
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

