"use client"

import { Check, ChevronsUpDown, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { setCompanyData } from "./(actions)/CompanyData"

const categories = [
  { label: "Technology", value: "technology" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
  { label: "Consumer Goods", value: "consumer-goods" },
  { label: "Energy", value: "energy" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Real Estate", value: "real-estate" },
  { label: "Telecommunications", value: "telecommunications" },
  { label: "Materials", value: "materials" },
  { label: "Utilities", value: "utilities" },
]

interface CompanyProfilePageProps {
  company: {
    name: string
    category: string
    description: string
  }
  ownerStatus: boolean
  employeeStatus: boolean
}

export default function CompanyProfilePage({ company, ownerStatus, employeeStatus }: CompanyProfilePageProps) {
  const router = useRouter()

  // Initialize react-hook-form outside the conditional block
  const form = useForm({
    defaultValues: company,
  })

  // If user is neither owner nor employee, redirect to companies page
  if (!ownerStatus && !employeeStatus) {
    router.push("/companies")
    return null
  }

  const { handleSubmit, control } = form

  const onSubmit = async (data: {
    name: string
    category: string
    description: string
  }) => {
    if (!ownerStatus) return // Extra safety check

    toast({
      title: "Updating Company",
      description: "Your company details are being updated...",
    })
    await setCompanyData(data)
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message)
        }
        toast({
          title: "Success",
          description: "Company details updated successfully",
        })
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Company details could not be updated",
          variant: "destructive",
        })
      })
  }

  return (
    <div className="container mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>View company information and details</CardDescription>
          {employeeStatus && !ownerStatus && (
            <Alert className="mt-4">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Employee View</AlertTitle>
              <AlertDescription>
                You have view-only access to this company profile. Only owners can make changes.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Company Name Field */}
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly={!ownerStatus}
                        className={cn(!ownerStatus && "bg-muted cursor-default focus-visible:ring-0")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Selector */}
              <FormField
                control={control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      {ownerStatus ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={false}
                              className="justify-between w-full"
                            >
                              {categories.find((cat) => cat.value === field.value)?.label || "Select category..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search category..." />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {categories.map((category) => (
                                    <CommandItem
                                      key={category.value}
                                      value={category.value}
                                      onSelect={() => field.onChange(category.value)}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === category.value ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {category.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          value={categories.find((cat) => cat.value === field.value)?.label || ""}
                          readOnly
                          className="bg-muted cursor-default focus-visible:ring-0"
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        readOnly={!ownerStatus}
                        className={cn("min-h-[150px]", !ownerStatus && "bg-muted cursor-default focus-visible:ring-0")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => router.push("/companies")}>
                  Back
                </Button>
                {ownerStatus && <Button type="submit">Save Changes</Button>}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

