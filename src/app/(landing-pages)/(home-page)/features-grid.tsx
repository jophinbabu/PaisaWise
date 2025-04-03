import { BarChart, CheckCircle, TrendingUp } from "lucide-react"

const features = [
  {
    name: "Smart Approval",
    description: "This is where approvals happen fast. Our process saves you time and keeps things moving. With automatic steps and instant updates, getting approvals is simple and smooth.",
    icon: CheckCircle,
  },
  {
    name: "Balance Sheets",
    description: "See a clear snapshot of your finances in one place. Track assets, liabilities, and equity with up-to-date insights that keep you informed and in control.",
    icon: BarChart,
  },
  {
    name: "Forecasting",
    description: "Our streamlined process delivers accurate predictions, fast. With automated data updates and real-time insights, staying ahead of trends is simple and efficient.",
    icon: TrendingUp,
  },
]

export function FeaturesGrid() {
  return (
    <div className="py-24 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Everything you need to manage expenses</h2>
          <p className="mt-4 text-lg text-muted-foreground">Comprehensive tools for both companies and employees</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative p-6 bg-background rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <feature.icon className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-medium">{feature.name}</h3>
              </div>
              <p className="mt-4 text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
