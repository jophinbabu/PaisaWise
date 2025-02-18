"use client"

import { useRouter } from "next/navigation"
import { Models } from "node-appwrite"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

import { sendEmail } from "./send-email"
import { verifyOTP } from "./verify-otp"

export default function Login() {
    const router = useRouter() 
    const [email, setEmail] = useState("")
    const [showOTP, setShowOTP] = useState(false)
    const [otp, setOTP] = useState("")
    const [emailTokenInfo, setEmailTokenInfo] = useState<Models.Token>()

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Here you would typically send the email to your backend
        // console.log("Sending email to:",
            // email)

        toast({
            title: "Auth",
            description: `Sending email to ${email}`,
        })

        await sendEmail(email).then((data) => {
            if (!data.success){
                throw new Error(data.message)
            }
            setEmailTokenInfo(data.data)
            // and trigger OTP generation
            setShowOTP(true)

        }).catch((error) => {
            if (error instanceof Error) {
                toast({
                    title: "Auth",
                    description: error.message,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Auth",
                    description: "An error occurred",
                    variant: "destructive"
                })
            }
        })


    }

    const handleOTPSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        
        // console.log("Verifying OTP:", otp)
        toast({
            title: "Auth",
            description: `Verifying OTP: ${otp}`,
        })

        // Here you would typically send the OTP to your backend
        // for verification
        await verifyOTP(emailTokenInfo!.userId, otp).then((data) => {
            if (!data.success){
                throw new Error(data.message)
            }
            // console.log(data)
            toast({
                title: "Auth",
                description: "Successfully logged in",
            })

            router.push("/dashboard")



        }).catch((error) => {
            if (error instanceof Error) {
                toast({
                    title: "Auth",
                    description: error.message,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Auth",
                    description: "An error occurred",
                    variant: "destructive"
                })
            }
        })
    }

    return (
        <div className="flex items-center justify-center w-full t-[50%]">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login or Signup</CardTitle>
                </CardHeader>
                <CardContent>
                    {!showOTP ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleOTPSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Enter OTP</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Verify OTP
                            </Button>
                            <Button type="button" variant="link" className="w-full" onClick={() => {
                                setEmailTokenInfo(undefined)
                                setShowOTP(false)
                            }}>
                                Back to Email
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

