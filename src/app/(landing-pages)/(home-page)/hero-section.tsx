import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="py-24 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">Simplify Your Expense Management</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Track, manage, and analyze your business expenses with ease. Perfect for both companies and employees.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/auth" prefetch={true}>
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
