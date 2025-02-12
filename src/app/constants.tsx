import { BookCheck } from 'lucide-react'
import React from 'react'

export const webInfo = {
    websiteName: "Expense Tracker",
    websiteDescription: "Track, manage, and analyze your business expenses with ease. Perfect for both companies and employees.",
    websiteKeywords: "expense, tracker, management, business, company, employees",
    websiteAuthor: "Expense Tracker",
    webLogoPath: "/favicon.ico",
    WebIcon: <BookCheck/>
}



function useInfo() {
  return webInfo
}

export default useInfo