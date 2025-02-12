import Link from "next/link";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuthStore } from "@/stores/authStore";

import { Separator } from "../ui/separator";


export const MobileAccordion = () => {
  const {fetched,isLoggedIn} = useAuthStore();

  if (!fetched){
    return null;
  }
  
    if (fetched && !isLoggedIn){
      return <>
           <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="signin">
                        <AccordionTrigger className="text-left">Sign In</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col space-y-2 pl-4">
                            <Link href="/signin/employee" className="text-foreground/60 hover:text-foreground py-2">
                              As Employee
                            </Link>
                            <Link href="/signin/company" className="text-foreground/60 hover:text-foreground py-2">
                              As Company
                            </Link>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="signup">
                        <AccordionTrigger className="text-left">Get Started</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col space-y-2 pl-4">
                            <Link href="/signup/company" className="text-foreground/60 hover:text-foreground py-2">
                              As Company
                            </Link>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
      </>;
    }
  
  
    return (<>
   <Separator />
          <Link href="/dashboard" className="text-foreground/60 hover:text-foreground py-2">
                      Dashboard
                    </Link>
    </>)
  }
  