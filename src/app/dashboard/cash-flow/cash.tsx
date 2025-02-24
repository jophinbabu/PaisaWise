"use client"

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { notFound,  useSearchParams } from "next/navigation"
import { Models } from "node-appwrite"
import {  useState } from "react"
import { Bar, Line } from "react-chartjs-2"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

import { createTransactions } from "./(actions)/cash-flow"

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

export interface Entry extends Models.Document {
  id: string
  name: string
  description: string
  type: "asset" | "liability"
  flow: "inflow" | "outflow"
  amount: number,
  department: string
}

const ExpenseTracker = ({
  mode,
transactions
}:{
  mode:"entry" | "list" | "chart",
  transactions: Models.DocumentList<Entry>
}) => {

 


  const [entries, setEntries] = useState<Entry[]>(transactions.documents.map((trsx)=>{
    return {
      ...trsx,
      id: trsx.$id,

      
    } as unknown as Entry
  }))
  const [newEntry, setNewEntry] = useState<Omit<Entry, "id">>({
    name: "",
    description: "",
    type: "asset",
    flow: "inflow",
    amount: 0,
    department: ""
  })
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [showOnlyInflow, setShowOnlyInflow] = useState(false)
  const [showOnlyOutflow, setShowOnlyOutflow] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewEntry((prev) => ({ ...prev, [name]: name === "amount" ? parseFloat(value) || 0 : value }))
  }

  const handleSelectChange = (name: keyof Omit<Entry, "id">, value: string) => {
    setNewEntry((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast({
      title: "Creating Entry",
      description: "Please wait..."
    })
    if (editingEntry) {
      setEntries(entries.map((entry) => (entry.id === editingEntry.id ? { ...entry, ...newEntry, id: editingEntry.id } : entry)))
      setEditingEntry(null)
    } else {
      await createTransactions({
        name: newEntry.name,
        description: newEntry.description,
        type: newEntry.type,
        flow: newEntry.flow,
        amount: newEntry.amount,
        department: newEntry.department
      }).then((res)=>{
        if (!res.success){
          throw new Error(res.message)
        }
        setEntries(()=>[...entries, {
          ...res.transaction!
        }])
        setNewEntry({ name: "", description: "", type: "asset", flow: "inflow", amount: 0, department: "" })
        toast({
          title: "Success",
          description: "Entry created successfully",
        })
      }).catch(()=>{
        toast({
          title: "Error",
          description: "An error occurred",
          variant: "destructive"
        })
      })
    }
    
  }

  // const handleEdit = (entry: Entry) => {
  //   setEditingEntry(entry)
  //   setNewEntry(entry)
  // }

  // const handleDelete = async (id: string) => {
  //   await deleteTransactions(id.toString()).then((res)=>{
  //     if (!res.success){
  //       throw new Error(res.message)
  //     }
  //     setEntries(entries.filter((entry) => entry.id !== id))
  //   }).catch(()=>{
  //     toast({
  //       title: "Error",
  //       description: "An error occurred",
  //       variant: "destructive"
  //     })
  //   })
  // }

  const filteredEntries = entries.filter((entry) => {
    if (showOnlyInflow) return entry.flow === "inflow"
    if (showOnlyOutflow) return entry.flow === "outflow"
    return true
  })

  const chartData = {
    labels: entries.map((entry) => entry.name),
    datasets: [
      {
        label: "Amount",
        data: entries.map((entry) => (entry.flow === "inflow" ? entry.amount : -entry.amount)),
        backgroundColor: entries.map((entry) =>
          entry.flow === "inflow" ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
        ),
      },
    ],
  }
  const profitorloss = entries.reduce((acc, entry) => {
    if (entry.flow === "inflow") {
        return acc + entry.amount
        } else {
        return acc - entry.amount
        }
    }, 0)

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Expense Tracker Chart",
      },
    },
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Balance Sheet</h1>
      <Tabs defaultValue={mode}>
        <TabsList>
          <TabsTrigger value="entry">New Entry</TabsTrigger>
          <TabsTrigger value="list">All Entries</TabsTrigger>
          <TabsTrigger value="chart">Charts</TabsTrigger>
        </TabsList>
        <TabsContent value="entry">
          <Card>
            <CardHeader>
              <CardTitle>{editingEntry ? "Edit Entry" : "New Entry"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="name"
                  placeholder="Name"
                  value={newEntry.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="description"
                  placeholder="Description"
                  value={newEntry.description}
                  onChange={handleInputChange}
                />
                <Select
                  name="type"
                  onValueChange={(value) => handleSelectChange("type", value)}
                  value={newEntry.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  name="flow"
                  onValueChange={(value) => handleSelectChange("flow", value)}
                  value={newEntry.flow}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inflow">Inflow</SelectItem>
                    <SelectItem value="outflow">Outflow</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  name="department"
                  onValueChange={(value) => handleSelectChange("department", value)}
                  value={newEntry.department}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="department1">department1</SelectItem>
                    <SelectItem value="department2">department2</SelectItem>
                    <SelectItem value="department3">department3</SelectItem>
                    <SelectItem value="department4">department4</SelectItem>
                    <SelectItem value="department5">department5</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  name="amount"
                  type="number"
                  placeholder="Amount"
                  value={newEntry.amount.toString()}
                  onChange={handleInputChange}
                  required
                />
                <Button type="submit">{editingEntry ? "Update" : "Add"} Entry</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Entries</CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  id="inflow-filter"
                  checked={showOnlyInflow}
                  onCheckedChange={() => {
                    setShowOnlyInflow(!showOnlyInflow)
                    setShowOnlyOutflow(false)
                  }}
                />
                <Label htmlFor="inflow-filter">Show only Inflow</Label>
                <Switch
                  id="outflow-filter"
                  checked={showOnlyOutflow}
                  onCheckedChange={() => {
                    setShowOnlyOutflow(!showOnlyOutflow)
                    setShowOnlyInflow(false)
                  }}
                />
                <Label htmlFor="outflow-filter">Show only Outflow</Label>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Flow</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.$id}>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.type}</TableCell>
                      <TableCell>{entry.flow}</TableCell>
                      <TableCell>{entry.amount}</TableCell>
                      <TableCell>{entry.departmentName}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="mr-2 hidden">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Entry</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault()
                                handleSubmit(e)
                              }}
                              className="space-y-4"
                            >
                              <Input
                                name="name"
                                placeholder="Name"
                                value={newEntry.name}
                                onChange={handleInputChange}
                                required
                              />
                              <Input
                                name="description"
                                placeholder="Description"
                                value={newEntry.description}
                                onChange={handleInputChange}
                              />
                              <Select
                                name="type"
                                onValueChange={(value) => handleSelectChange("type", value)}
                                value={newEntry.type}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="asset">Asset</SelectItem>
                                  <SelectItem value="liability">Liability</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                name="department"
                                onValueChange={(value) => handleSelectChange("department", value)}
                                value={newEntry.type}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="department1">department1</SelectItem>
                                  <SelectItem value="department2">department2</SelectItem>
                                  <SelectItem value="department3">department3</SelectItem>
                                  <SelectItem value="department4">department4</SelectItem>
                                  <SelectItem value="department5">department5</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select
                                name="flow"
                                onValueChange={(value) => handleSelectChange("flow", value)}
                                value={newEntry.flow}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select flow" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inflow">Inflow</SelectItem>
                                  <SelectItem value="outflow">Outflow</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                name="amount"
                                type="number"
                                placeholder="Amount"
                                value={newEntry.amount.toString()}
                                onChange={handleInputChange}
                                required
                              />
                              <DialogFooter>
                                <Button type="submit">Update Entry</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              {/* <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                Delete
                              </AlertDialogAction> */}
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Expense Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Bar data={chartData} options={chartOptions} />
              </div>
              <div className="h-[400px] mt-8">
                <Line data={chartData} options={chartOptions} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mt-8">Profit or Loss</h2>
                <div className="flex items-center space-x-4">
                  <p className="text-xl font-bold">Total:</p>
                  <p className={`text-xl ${profitorloss >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ₹{Math.abs(profitorloss).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


export default function CashPage({
  transactions
}:{
  transactions: Models.DocumentList<Entry>
}){
  const search = useSearchParams();

  const mode = search.get("mode");

    


  if (!mode){
    return notFound();
  }


  if (!["entry", "list", "chart"].includes(mode)) {
    return notFound();
  }
  return (<>
  <ExpenseTracker mode={mode as "entry" | "list" | "chart"} transactions={transactions}/>
  
  </>)
}