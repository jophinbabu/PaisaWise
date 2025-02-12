import Link from "next/link";

import { useAuthStore } from "@/stores/authStore";

import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const BigGetStartedButton =  () => {
   const {fetched,isLoggedIn} = useAuthStore();
  
    if (!fetched || isLoggedIn){
      return null;
    }

    
  
    else{
      return (<>
       <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>Get Started</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/signup/company">As Company</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
      </>)
    }
  }
  