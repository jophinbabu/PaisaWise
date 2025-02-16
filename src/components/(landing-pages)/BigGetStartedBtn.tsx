import Link from "next/link";

import { useAuthStore } from "@/stores/authStore";

import { Button } from "../ui/button";

export const BigGetStartedButton =  () => {
   const {fetched,isLoggedIn} = useAuthStore();
  
    if (!fetched || isLoggedIn){
      return null;
    }

    
  
    else{
      return (<>
      <Link href={"/auth"} >
      <Button>Get Started</Button>
      </Link>
                 
              
                
      </>)
    }
  }
  