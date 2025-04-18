"use client";

import {
  BadgeIndianRupee,
  Building2,
  BarChart,
  Frame,
  Home,
  IndianRupee,
  PieChart,
  Sheet,
  Wallet2, // Added Wallet Icon
} from "lucide-react";
import * as React from "react";

import { isOwner } from "@/app/dashboard/(actions)/isActivemember";
import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  teams: [
    {
      name: "",
      plan: "Primary",
    },
  ],
  navMain: [
    {
      title: "Entry Logs",
      url: "#",
      icon: IndianRupee,
      isActive: true,
      items: [
        {
          title: "Add",
          url: "/dashboard/cash-flow?mode=entry",
        },
        {
          title: "History",
          url: "/dashboard/cash-flow?mode=list",
        },
        {
          title: "Visualize",
          url: "/dashboard/cash-flow?mode=chart",
        },
      ],
    },
    {
      title: "Balance Sheet",
      url: "/dashboard/balancesheet",
      icon: Sheet,
      items: [
        {
          title: "View Balance Sheet",
          url: "/dashboard/balancesheet",
        },
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
        },
      ],
    },
  ],
  projects: [
    {
      name: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      name: "Limit Expenses",
      url: "/dashboard/limit-expenses",
      icon: Frame,
    },
    {
      name: "Request Budget",
      url: "/dashboard/request-budget",
      icon: BadgeIndianRupee,
    },
    // Add this to your navigation items array
    {
    name: 'Forecast',
    url: '/dashboard/forecast',
    icon: BarChart, // Import from your icon library
    },
    {
      name: "Request History",
      url: "/dashboard/requesthistory",
      icon: PieChart,
      adminOnly: true,
    },
  ],
};

export function AppSidebar({ companyname, ...props }: {
  companyname: string;
  companyid: string;
  children?: React.ReactNode;
} & React.ComponentProps<typeof Sidebar>) {
  const [isOwnerUser, setIsOwnerUser] = React.useState(false);

  React.useEffect(() => {
    async function checkOwner() {
      const ownerStatus = await isOwner();
      setIsOwnerUser(ownerStatus);
    }
    checkOwner();
  }, []);

  const filteredNavMain = data.navMain.map((section) => {
    if (section.title === "Company" && !isOwnerUser) {
      return {
        ...section,
        items: section.items.filter((item) => item.title !== "Employees"),
      };
    }
    return section;
  });

  const filteredProjects = isOwnerUser
    ? data.projects
    : data.projects.filter(
      (project) =>
        project.name !== "Limit Expenses" && project.name !== "Request History"
    );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* PaisaWise Logo & Name */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Wallet2 className="w-6 h-6 text-primary" /> {/* Wallet Icon */}
          <span className="text-lg font-semibold">PaisaWise</span> {/* Name */}
        </div>

        {/* Company Name Below */}
        <TeamSwitcher teams={[{ name: companyname }]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavProjects projects={filteredProjects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}      