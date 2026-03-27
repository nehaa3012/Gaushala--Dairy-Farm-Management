"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface MilkSalesData {
  date: string
  liters: number
  revenue: number
}

interface MilkSalesTrendChartProps {
  data: MilkSalesData[]
}

export function MilkSalesTrendChart({ data }: MilkSalesTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milk Sales Trend</CardTitle>
        <CardDescription>Daily milk sales in liters</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLiters" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value, name) => {
                if (name === "liters") return [`${value} L`, "Liters"]
                return [`₹${value}`, "Revenue"]
              }}
            />
            <Area
              type="monotone"
              dataKey="liters"
              stroke="#22c55e"
              fillOpacity={1}
              fill="url(#colorLiters)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
