import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type KpiAccent = "blue" | "pink" | "yellow" | "green" | "aqua"

const accentClasses: Record<KpiAccent, string> = {
  blue: "bg-brand-blue/15 text-[color:var(--brand-blue)]",
  pink: "bg-brand-pink/15 text-[color:var(--brand-pink)]",
  yellow: "bg-brand-yellow/20 text-[color:var(--accent-foreground)]",
  green: "bg-brand-green/20 text-[color:var(--brand-green)]",
  aqua: "bg-brand-aqua/15 text-[color:var(--brand-aqua)]",
}

export interface KpiCard {
  title: string
  value: string | number
  icon: LucideIcon
  emoji?: string
  accent?: KpiAccent
}

export function KpiCardGrid({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              {card.emoji && <span>{card.emoji}</span>}
              {card.title}
            </CardTitle>
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                card.accent ? accentClasses[card.accent] : "text-muted-foreground"
              }`}
            >
              <card.icon className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
