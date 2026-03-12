"use client"

import {
  PieChart,
  Pie,
  Cell,
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

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
]

interface ExpenseBreakdownData {
  category: string
  amount: number
}

interface ExpenseBreakdownChartProps {
  data: ExpenseBreakdownData[]
}

export function ExpenseBreakdownChart({ data }: ExpenseBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>Expenses by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => {
                const percent = entry.percent || 0
                return `${entry.category} (${(percent * 100).toFixed(0)}%)`
              }}
              outerRadius={100}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
              formatter={(value: any) => {
                const numValue = Number(value)
                return [
                  `₹${numValue.toFixed(2)} (${((numValue / total) * 100).toFixed(1)}%)`,
                  "Amount",
                ]
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
