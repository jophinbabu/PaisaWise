import { Bell,Camera, Clock, CreditCard, PieChart, Receipt } from "lucide-react"

const features = [
  {
    name: "Quick Receipt Capture",
    description: "Snap and upload receipts instantly with our mobile-friendly interface",
    icon: Camera,
  },
  {
    name: "Real-time Tracking",
    description: "Monitor expenses as they happen with instant updates and notifications",
    icon: Clock,
  },
  {
    name: "Advanced Analytics",
    description: "Get detailed insights into spending patterns and expense categories",
    icon: PieChart,
  },
  {
    name: "Smart Categories",
    description: "Automatically categorize expenses for better organization",
    icon: Receipt,
  },
  {
    name: "Card Integration",
    description: "Connect your corporate cards for automatic expense tracking",
    icon: CreditCard,
  },
  {
    name: "Instant Notifications",
    description: "Stay updated with approval status and reimbursement notifications",
    icon: Bell,
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
