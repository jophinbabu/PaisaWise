"use client";

import Link from "next/link";

import { useAuthStore } from "@/stores/authStore";

import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const BigSignInButton =  () => {
    const {fetched,isLoggedIn} = useAuthStore();

    if (!fetched){
      return null;
    }
  
    if (fetched && isLoggedIn){
      return (<>
      <Link href="/dashboard">
        <Button variant="outline">Dashboard</Button>
      </Link>
      </>)
    }
  
  
    return (<>
    
    <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Sign In</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/signin/employee">As Employee</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signin/company">As Company</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
    </>)
  }
  