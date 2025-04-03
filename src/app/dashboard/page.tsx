import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Page() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col p-4 pt-6 relative">
        {/* Watermark Container */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Subtle Gradient Watermark */}
          <div className="relative">
            <h1 className="text-[120px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 select-none">
              PaisaWise
            </h1>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white opacity-70"></div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="relative flex-1 min-h-[calc(100vh-5rem)]">
          {/* Your actual content would go here */}
          
          {/* Tagline at bottom - made more subtle */}
          <div className="absolute bottom-6 right-6 text-xs text-gray-400 font-light tracking-wide">
            Manage finances wisely • Track expenses easily • Grow steadily
          </div>
        </div>
      </div>
    </>
  );
}