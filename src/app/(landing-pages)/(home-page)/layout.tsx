"use client";
import React from 'react'

import { Navbar } from '@/components/(landing-pages)/navbar'
import { useDimension } from '@/hooks/useDimension'

function NavLayout({
    children
}:{
    children:React.ReactNode
}) {
  const {divRef,dimensions} = useDimension();
  return (
    <>
    {<Navbar ref={divRef as React.RefObject<HTMLDivElement>}/> }
   <div className={`h-[calc(100vh - ${dimensions.height}px)] w-full overflow-y-auto`}>
   {children}
   </div>
    </>
  )
}

export default NavLayout