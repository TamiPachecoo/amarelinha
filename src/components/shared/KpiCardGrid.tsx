import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface KpiCard {
  title: string
  value: string | number
  icon: LucideIcon
}

export function KpiCardGrid({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
