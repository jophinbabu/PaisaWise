import { redirect } from 'next/navigation'
import React from 'react'

import { isOnBoardingCompleted } from '@/actions/isOnboardingCompleted'

import { isActiveMember } from './(actions)/isActivemember'
import MainDashLayout from './mainDashLayout'

async function DashLayout({
    children
}: {
    children: React.ReactNode
}) {

    const isOnboardingCompleted = await isOnBoardingCompleted()

    // console.log("isOnboardingCompleted", isOnboardingCompleted)

    if (!isOnboardingCompleted) {
        return redirect("/onboarding")
    }

    const isActive = await isActiveMember();

    if (!isActive) {
        return redirect("/pending-request")
    }

    return await MainDashLayout({ children })
}

export default DashLayout