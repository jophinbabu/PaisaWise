"use client"
import { Book, Menu } from "lucide-react"
import Link from "next/link"

import { webInfo } from "@/app/constants"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { BigGetStartedButton } from "./BigGetStartedBtn"
import { BigSignInButton } from "./BigSigninBtn"
import { MobileAccordion } from "./MobileAccordion"







export function Navbar({
    ref
}:{
    ref?: React.RefObject<HTMLDivElement>
}) {

    return (
        <nav className="border-b bg-background sticky top-0" ref={ref}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center space-x-2">
                        <webInfo.WebIcon className="h-6 w-6 text-primary" />
                        <span className="font-bold text-xl">{webInfo.websiteName}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {/* <Link href="/features" className="text-foreground/60 hover:text-foreground">
                            Features
                        </Link>
                        <Link href="/pricing" className="text-foreground/60 hover:text-foreground">
                            Pricing
                        </Link> */}


                        <BigSignInButton />

                        <BigGetStartedButton />




                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle>
                                        <div className="flex items-center space-x-2">
                                            <Book className="h-6 w-6 text-primary" />
                                            <span className="font-bold text-xl">ExpenseBook</span>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col space-y-4 mt-6">
                                    {/* <Link href="/features" className="text-foreground/60 hover:text-foreground py-2">
                                        Features
                                    </Link>
                                    <Link href="/pricing" className="text-foreground/60 hover:text-foreground py-2">
                                        Pricing
                                    </Link> */}


                                    <MobileAccordion />


                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    )
}
