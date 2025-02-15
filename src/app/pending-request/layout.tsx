import { redirect } from 'next/navigation';
import React from 'react'

import { isOnBoardingCompleted } from '@/actions/isOnboardingCompleted';

import { isActiveMember } from '../dashboard/(actions)/isActivemember';

async function Layout({
    children
    }:{
    children: React.ReactNode
}) {

  const isOnboardingCompleted = await isOnBoardingCompleted()

    // console.log("isOnboardingCompleted", isOnboardingCompleted)

    if (!isOnboardingCompleted) {
        return redirect("/onboarding")
    }

    const isActive = await isActiveMember();

    if (!!isActive) {
        return redirect("/dashboard")
    }
  return <>
  {children}
  </>
}

export default Layout