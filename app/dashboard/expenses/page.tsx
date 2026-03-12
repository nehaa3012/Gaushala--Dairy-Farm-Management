"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Tag,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ExpenseForm from "@/components/forms/ExpenseForm"
import { toast } from "sonner"

interface Expense {
  id: string
  category: string
  amount: number
  date: string
  notes?: string
  isRecurring: boolean
  createdAt: string
}

const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  FEED: "Feed & Fodder",
  MEDICINE: "Medicine",
  LABOR: "Labor & Wages",
  ELECTRICITY: "Electricity",
  MAINTENANCE: "Maintenance",
  TRANSPORT: "Transport",
  OTHER: "Other",
}

const EXPENSE_CATEGORY_COLORS: Record<string, string> = {
  FEED: "bg-green-500",
  MEDICINE: "bg-red-500",
  LABOR: "bg-blue-500",
  ELECTRICITY: "bg-yellow-500",
  MAINTENANCE: "bg-purple-500",
  TRANSPORT: "bg-orange-500",
  OTHER: "bg-gray-500",
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    try {
      const res = await fetch("/api/expenses")
      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    fetchExpenses()
  }

  const handleEdit = (expense: Expense, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteExpenseId) return

    setProcessingId(deleteExpenseId)
    try {
      const response = await fetch(`/api/expenses/${deleteExpenseId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete expense")
      }

      toast.success("Expense deleted successfully")
      fetchExpenses()
    } catch (error) {
      toast.error("Failed to delete expense")
    } finally {
      setProcessingId(null)
      setDeleteExpenseId(null)
    }
  }

  const handleAddNew = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const filteredExpenses = expenses.filter((expense) => {
    const categoryLabel = EXPENSE_CATEGORY_LABELS[expense.category] || expense.category
    const matchesSearch =
      categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.amount.toString().includes(searchQuery)
    return matchesSearch
  })

  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  )

  // Calculate expenses by category
  const expensesByCategory: Record<string, number> = {}
  expenses.forEach((exp) => {
    expensesByCategory[exp.category] =
      (expensesByCategory[exp.category] || 0) + Number(exp.amount)
  })

  // Get top category
  const topCategory = Object.entries(expensesByCategory).sort(
    ([, a], [, b]) => b - a
  )[0]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground">
            Track all farm-related expenses
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </motion.div>

      {/* Stats Cards */}
      {expenses.length > 0 && (
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Entries
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Top Category
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {topCategory
                  ? EXPENSE_CATEGORY_LABELS[topCategory[0]]
                  : "N/A"}
              </div>
              {topCategory && (
                <div className="text-sm text-muted-foreground">
                  ₹{topCategory[1].toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      {expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by category, notes, or amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>
      )}

      {/* Expense Cards */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={searchQuery ? "No expenses found" : "No expenses recorded"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Start tracking your farm expenses to monitor profitability"
          }
          actionLabel={!searchQuery ? "Add Expense" : undefined}
          onAction={!searchQuery ? handleAddNew : undefined}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredExpenses.map((expense) => (
            <motion.div key={expense.id} variants={item}>
              <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className="transition-all"
                              style={{
                                backgroundColor:
                                  EXPENSE_CATEGORY_COLORS[expense.category] ||
                                  "gray",
                              }}
                            >
                              {EXPENSE_CATEGORY_LABELS[expense.category] ||
                                expense.category}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-lg font-bold text-primary">
                                ₹{Number(expense.amount).toFixed(2)}
                              </span>
                            </div>
                            {expense.notes && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {expense.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          disabled={processingId === expense.id}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => handleEdit(expense, e)}
                          className="cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Expense
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteExpenseId(expense.id)
                          }}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense
                ? "Update the expense details"
                : "Record a farm expense to track your spending"}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            expenseId={editingExpense?.id}
            defaultValues={
              editingExpense
                ? {
                    category: editingExpense.category,
                    amount: Number(editingExpense.amount),
                    date: new Date(editingExpense.date)
                      .toISOString()
                      .split("T")[0],
                    notes: editingExpense.notes || "",
                  }
                : undefined
            }
            onSuccess={handleSuccess}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingExpense(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteExpenseId}
        onOpenChange={(open) => !open && setDeleteExpenseId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
