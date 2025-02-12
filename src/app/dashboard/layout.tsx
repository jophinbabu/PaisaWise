import { redirect } from 'next/navigation'
import React from 'react'

import { isOnBoardingCompleted } from '@/actions/isOnboardingCompleted'

import MainDashLayout from './mainDashLayout'

async function DashLayout({
    children
}: {
    children: React.ReactNode
}) {

    const isOnboardingCompleted = await isOnBoardingCompleted()

    console.log("isOnboardingCompleted", isOnboardingCompleted)

    if (!isOnboardingCompleted) {
        return redirect("/onboarding")
    }

    return await MainDashLayout({ children })
}

export default DashLayout