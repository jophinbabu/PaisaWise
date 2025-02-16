"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/hooks/use-toast"

import { creaeNewOrg } from "./createNewCompany"
import { setOnboardingTrue } from "./setOnBoardingTrue"
import { updateUserName } from "./updateName"
import { verifyOrgCode } from "./verifyOrgCode"

type AccountType = "company" | "join"

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [accountType, setAccountType] = useState<AccountType>("company")
  const [companyCode, setCompanyCode] = useState("")
  const router = useRouter()

  const handleNext = () => {
    if (step < 2) setStep(()=>step + 1)
  }

  const handlePrevious = () => {
    if (step > 1) setStep(()=>step - 1)
  }

  const handleSubmit =async () => {

   
    // console.log(step)
    // console.log({ name, accountType, companyCode })
    // return;
    if (step !== 2) return
    // Handle form submission
    // verify if organization exists

    // update UsersName

    toast({
        title: "Adding Name",
        description: "Your account is being created...",
    })

    try{
        await updateUserName(name).then(res=>{
          if (!res.success){
            throw new Error(res.message)
          }
        })
    }catch(e){
        if (e instanceof Error){
            toast({
                title: "Name Error",
                description: e.message,
                variant:"destructive"
            })
        }else{
            toast({
                title: "Name Error",
                description: "An error occurred",
                variant:"destructive"
            })
        }
        return;
    }

    setTimeout(() => {},1000);


    if (accountType == "join"){
        toast({
            title: "Checking Company Code",
            description: "Your company code is being verified...",     
        })
    
        try{
            await verifyOrgCode(companyCode).then(res=>{
              if (!res.success){
                throw new Error(res.message)
              }
            })
        }catch(e){
            if (e instanceof Error){
                toast({
                    title: "Code Error",
                    description: e.message,
                    variant:"destructive"
                })
            }else{
                toast({
                    title: "Code Error",
                    description: "An error occurred",
                    variant:"destructive"
                })
            }
            return;
        }

        await setOnboardingTrue().then((res)=>{
          if (!res.success){
            throw new Error(res.message)
          }

          router.push("/dashboard")
        }).catch((e)=>{
            toast({
                title: "Onboarding Error",
                description: e.message,
                variant:"destructive"
            })
        });
        return;
    
    }else{
        // creating new company

        try {
            await creaeNewOrg(name)
        } catch (e) {
            if (e instanceof Error) {
                toast({
                    title: "Company Error",
                    description: e.message,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Company Error",
                    description: "An error occurred",
                    variant: "destructive"
                })

            }


        }


    }





    // console.log({ name, accountType, companyCode })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <div className="mb-6 flex justify-between">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div> */}

          <form className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup
                    value={accountType}
                    onValueChange={(value) => setAccountType(value as AccountType)}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company">Create a Company</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="join" id="join" />
                      <Label htmlFor="join">Join a Company</Label>
                    </div>
                  </RadioGroup>
                </div>

                {accountType === "join" && (
                  <div className="space-y-2">
                    <Label htmlFor="company-code">Company Code</Label>
                    <Input
                      id="company-code"
                      placeholder="Enter company code"
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value)}
                      required={accountType === "join"}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between space-x-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              {step < 2 ? (
                <Button type="button" variant={"outline"} onClick={handleNext} >
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={()=>{
                  handleSubmit()
                }}>Complete</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

