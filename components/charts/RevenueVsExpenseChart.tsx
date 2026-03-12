"use client"

import {
  BarChart,
  Bar,
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

interface RevenueVsExpenseData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface RevenueVsExpenseChartProps {
  data: RevenueVsExpenseData[]
}

export function RevenueVsExpenseChart({ data }: RevenueVsExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>
          Monthly comparison of revenue and expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
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
              formatter={(value) => `₹${value}`}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              fill="#22c55e"
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              fill="#ef4444"
              name="Expenses"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="profit"
              fill="#3b82f6"
              name="Profit"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
