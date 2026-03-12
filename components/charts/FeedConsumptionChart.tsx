"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

interface FeedConsumptionData {
  date: string
  quantityKg: number
  totalCost: number
}

interface FeedConsumptionChartProps {
  data: FeedConsumptionData[]
}

export function FeedConsumptionChart({ data }: FeedConsumptionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feed Consumption</CardTitle>
        <CardDescription>Daily feed consumption and cost</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="left"
              label={{ value: "kg", angle: -90, position: "insideLeft" }}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "₹", angle: 90, position: "insideRight" }}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="quantityKg"
              stroke="#22c55e"
              name="Feed (kg)"
              strokeWidth={2}
              dot={{ fill: "#22c55e", r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalCost"
              stroke="#f59e0b"
              name="Cost (₹)"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
