import { redirect } from 'next/navigation';
import React from 'react'

import { isOnBoardingCompleted } from '@/actions/isOnboardingCompleted';
import { Navbar } from '@/components/(landing-pages)/navbar'
import { AuthSession } from '@/utils/AuthSession';

async function NavLayout({
  children
}: {
  children: React.ReactNode
}) {
  // const { divRef,remainingHeight } = useDimension();

  const isOnboardingCompleted = await isOnBoardingCompleted();

  try {
    await AuthSession.getUser();
  } catch {
    await AuthSession.removeSessionToken();
    return redirect("/auth")
  }


  // console.log("isOnboardingCompleted", isOnboardingCompleted)

  if (!!isOnboardingCompleted) {
    return redirect("/dashboard")
  }




  return (
    <>
      <Navbar />
      <div className={`${12}px)] w-full overflow-y-auto`}>
        {children}
      </div>
    </>
  )
}

export default NavLayout