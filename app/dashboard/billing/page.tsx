"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Calendar,
  User,
  MoreVertical,
  Eye,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import BillForm from "@/components/forms/BillForm"
import { toast } from "sonner"

interface Bill {
  id: string
  customerId: string
  customer: {
    id: string
    name: string
    phone?: string
  }
  month: number
  year: number
  totalAmount: number
  paidAmount: number
  status: "PENDING" | "PARTIAL" | "PAID"
  dueDate: string
  createdAt: string
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

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

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchBills()
  }, [])

  async function fetchBills() {
    try {
      const res = await fetch("/api/bills")
      if (res.ok) {
        const data = await res.json()
        setBills(data)
      }
    } catch (error) {
      console.error("Failed to fetch bills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    fetchBills()
  }

  const handleAddNew = () => {
    setIsDialogOpen(true)
  }

  const filteredBills = bills.filter((bill) => {
    const monthName = MONTH_NAMES[bill.month - 1]
    const matchesSearch =
      bill.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      monthName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.year.toString().includes(searchQuery)
    return matchesSearch
  })

  // Calculate stats
  const totalBills = bills.length
  const totalOutstanding = bills
    .filter((b) => b.status !== "PAID")
    .reduce((sum, b) => sum + (Number(b.totalAmount) - Number(b.paidAmount)), 0)
  const totalCollected = bills.reduce((sum, b) => sum + Number(b.paidAmount), 0)
  const paidBills = bills.filter((b) => b.status === "PAID").length

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
            Billing & Payments
          </h1>
          <p className="text-muted-foreground">
            Manage customer bills and track payments
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Bill
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 md:grid-cols-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBills}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalOutstanding.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalCollected.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidBills}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      {bills.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, month, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>
      )}

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={searchQuery ? "No bills found" : "No bills yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Bills will appear here once you generate them for your customers"
          }
          actionLabel={!searchQuery ? "Generate Bill" : undefined}
          onAction={!searchQuery ? handleAddNew : undefined}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredBills.map((bill) => {
            const outstanding =
              Number(bill.totalAmount) - Number(bill.paidAmount)
            return (
              <motion.div key={bill.id} variants={item}>
                <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {MONTH_NAMES[bill.month - 1]} {bill.year}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <User className="h-3 w-3" />
                          {bill.customer.name}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="font-medium">
                              ₹{Number(bill.totalAmount).toFixed(2)}
                            </span>
                          </div>
                          {bill.paidAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Paid:
                              </span>
                              <span className="font-medium text-green-600">
                                ₹{Number(bill.paidAmount).toFixed(2)}
                              </span>
                            </div>
                          )}
                          {outstanding > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Due:
                              </span>
                              <span className="font-medium text-red-600">
                                ₹{outstanding.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={
                            bill.status === "PAID"
                              ? "default"
                              : bill.status === "PARTIAL"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {bill.status}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-primary/10"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Bill</DialogTitle>
            <DialogDescription>
              Generate a monthly bill for a customer based on their deliveries
            </DialogDescription>
          </DialogHeader>
          <BillForm
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
