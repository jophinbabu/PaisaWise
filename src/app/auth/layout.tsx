"use client";
import React from 'react'

import { Navbar } from '@/components/(landing-pages)/navbar'

function NavLayout({
  children
}: {
  children: React.ReactNode
}) {
  // const { divRef,remainingHeight } = useDimension();
  

  


  return (
    <>
      <Navbar/>
      <div className={`${12}px)] w-full overflow-y-auto`}>
        {children}
      </div>
    </>
  )
}

export default NavLayout