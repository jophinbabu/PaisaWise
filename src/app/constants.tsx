import { Wallet2 } from 'lucide-react'


export const webInfo = {
    websiteName: "PaisaWise",
    websiteDescription: "Track, manage, and analyze your business expenses with ease. Perfect for both companies and employees.",
    websiteKeywords: "expense, tracker, management, business, company, employees",
    websiteAuthor: "PaisaWise",
    webLogoPath: "/favicon.ico",
    WebIcon: Wallet2
}



function useInfo() {
  return webInfo
}

export default useInfo