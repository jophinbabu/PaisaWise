import React from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

import { getOrgs } from './(actions)/getOrgs'

async function MainDashLayout({
    children
    }: {
    children: React.ReactNode
}) {

    const org = await getOrgs();

    console.log(org);

    
    
  return (
    <>
    <SidebarProvider>
      <AppSidebar companyid={org?.$id ?? "..."} companyname={org?.name ?? "..."}/>
      <SidebarInset>
      {children}
      </SidebarInset>
    </SidebarProvider>
 
    </>
  )
}

export default MainDashLayout