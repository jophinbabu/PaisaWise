"use client"
import React, { useEffect } from 'react'

import { useAuthStore } from '@/stores/authStore'

function Providers({
  children
}: {
  children: React.ReactNode
}) {
  const { rehydrate } = useAuthStore();
  useEffect(() => {
    rehydrate()
  }, [rehydrate])
  return (
    <>
      {children}
    </>
  )
}

export default Providers