"use client"

import {
  Building2,
  DollarSign,
  Frame,
  Home,
  PieChart,
  Sheet,
} from "lucide-react"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"



// This is sample data.
const data = {

  teams: [
    {
      name: "",
      plan: "Primary",
    }
  ],
  navMain: [
    {
      title: "Finances",
      url: "#",
      icon: DollarSign,
      isActive: true,
      items: [
        {
          title: "Add",
          url: "/dashboard/cash-flow?mode=entry",
        },
        {
          title: "View",
          url: "/dashboard/cash-flow?mode=list",
        },
        {
          title: "Visualize",
          url: "/dashboard/cash-flow?mode=chart",
        }
      ],
    },
    
    {
      title: "Company",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Profile",
          url: "/dashboard/company/profile",
        },
        {
          title: "Employees",
          url: "/dashboard/company/employee",
        }
      ],
    },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      name: "Balance Sheet",
      url: "/dashboard/finances",
      icon: Sheet,
    },
    {
      name: "Limit Expenses",
      url: "/dashboard/limit-expenses",
      icon: Frame,
    },
    {
      name: "Request Budget",
      url: "/dashboard/request-budget",
      icon: PieChart,
    },
  ],
}

export function AppSidebar({ companyname,...props }: {
  companyname: string,
  companyid: string,
  children?: React.ReactNode
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
     
        
        <TeamSwitcher teams={[
          { name: companyname },
        ]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
