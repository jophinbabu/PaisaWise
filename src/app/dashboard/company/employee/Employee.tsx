"use client"

import { Copy, UserMinus, UserX } from "lucide-react"
import { Models } from "node-appwrite"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

import { acceptEmployee } from "./(actions)/acceptEmployee"
import { rejectEmployee } from "./(actions)/rejectEmployee"

export function EmployeesPage({
  orgCode,
  employees,
  requestsEmp
}:{
  orgCode:string,
  employees: Models.Membership[],
  requestsEmp: Models.Membership[]
}) {
  const [inviteCode] = useState(orgCode)

  // This would typically come from your backend


  const requests =requestsEmp

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    toast({
      title: "Invite code copied",
      description: "The invite code has been copied to your clipboard."
    })
  }

  const handleRemoveEmployee = async (id: string) => {
      toast({
        title: "Removing Employee",
        description: `id : ${id}`
      })

      await rejectEmployee(id).then(()=>{
        toast({
          title: "Success",
          description: "Employee removed successfully"
        })
      }).catch(()=>{
        toast({
          title: "Error",
          description: "Employee could not be removed",
          variant:"destructive"
        })
      })


    
    // Implement employee removal logic
  }


  const handleAcceptRequest = async (id: string) => {
    toast({
      title: "Accepting Employee",
      description: `id : ${id}`
    })

    await acceptEmployee(id).then(()=>{
      toast({
        title: "Success",
        description: "Employee accepted successfully"
      })
    }).catch(()=>{
      toast({
        title: "Error",
        description: "Employee could not be accepted",
        variant:"destructive"
      })
    })

  }

  const handleRejectRequest = async (id: string) => {
    toast({
      title: "Rejecting Employee",
      description: `id : ${id}`
    })

    await rejectEmployee(id).then(()=>{
      toast({
        title: "Success",
        description: "Employee rejected successfully"
      })
    }).catch(()=>{
      toast({
        title: "Error",
        description: "Employee could not be rejected",
        variant:"destructive"
      })
    })

  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invite Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input value={inviteCode} readOnly className="font-mono" />
            <Button onClick={copyInviteCode}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Current Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.$id}>
                      <TableCell>{employee.userName}</TableCell>
                      <TableCell>{employee.userEmail}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveEmployee(employee.$id)}>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Join Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.$id}>
                      <TableCell>{request.userName}</TableCell>
                      <TableCell>{request.userEmail}</TableCell>
                      <TableCell className="gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleAcceptRequest(request.$id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Accept
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleRejectRequest(request.$id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

