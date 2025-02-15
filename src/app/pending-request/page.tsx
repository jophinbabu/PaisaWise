"use client";
import { CheckCircle2, Clock, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent,  CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { logout } from "../auth/logout";

// This would come from your database
const requestStatus = {
  status: "pending", // or "approved" or "rejected"
//   submittedAt: "2024-02-15T10:30:00Z",
//   position: "Software Engineer",
//   department: "Engineering",
//   nextSteps: "Your application is currently being reviewed by our HR team.",
}

export default function JoinRequestStatusPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {requestStatus.status === "pending" && <Clock className="h-8 w-8 text-yellow-500" />}
            {requestStatus.status === "approved" && <CheckCircle2 className="h-8 w-8 text-green-500" />}
            {requestStatus.status === "rejected" && <XCircle className="h-8 w-8 text-red-500" />}
            <div>
              <CardTitle>Application Status</CardTitle>
              {/* <CardDescription>Position: {requestStatus.position}</CardDescription> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1">
            <p className="text-sm font-medium">Current Status</p>
            <p className="text-2xl font-bold capitalize">{requestStatus.status}</p>
          </div>

          {/* <div className="space-y-1">
            <p className="text-sm font-medium">Department</p>
            <p className="text-muted-foreground">{requestStatus.department}</p>
          </div> */}

          {/* <div className="space-y-1">
            <p className="text-sm font-medium">Submitted On</p>
            <p className="text-muted-foreground">
              {new Date(requestStatus.submittedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div> */}

          {/* <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Next Steps</p>
            <p className="text-sm text-muted-foreground">{requestStatus.nextSteps}</p>
          </div> */}

          {requestStatus.status === "pending" && (
            <div className="rounded-lg border p-4 bg-yellow-50 dark:bg-yellow-950">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Your application is under review. We appreciate your patience and will notify you of any updates.
              </p>
            </div>
          )}

          {requestStatus.status === "approved" && (
            <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950">
              <p className="text-sm text-green-800 dark:text-green-300">
                Congratulations! Your application has been approved. Our HR team will contact you shortly with the next
                steps.
              </p>
            </div>
          )}

          {requestStatus.status === "rejected" && (
            <div className="rounded-lg border p-4 bg-red-50 dark:bg-red-950">
              <p className="text-sm text-red-800 dark:text-red-300">
                We regret to inform you that your application was not successful at this time. Thank you for your
                interest in our company.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
          <Button variant="destructive"  onClick={()=>logout()}>Logout</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

