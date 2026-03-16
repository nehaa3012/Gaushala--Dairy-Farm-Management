"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
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
  Wallet,
  Receipt,
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
import PaymentForm from "@/components/forms/PaymentForm"
import { toast } from "sonner"
import { GridBackground } from "@/components/ui/grid-background"
import { GlowEffect } from "@/components/ui/glow-effect"

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
  status: "UNPAID" | "PARTIAL" | "PAID"
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

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

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

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false)
    setSelectedBill(null)
    fetchBills()
  }

  const handleAddNew = () => {
    setIsDialogOpen(true)
  }

  const handleRecordPayment = (bill: Bill) => {
    setSelectedBill(bill)
    setIsPaymentDialogOpen(true)
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
    <GridBackground className="min-h-screen">
      {/* Ambient Glow Effects */}
      <GlowEffect
        color="purple"
        size="lg"
        className="-top-20 right-10 opacity-30"
      />
      <GlowEffect
        color="pink"
        size="md"
        className="bottom-20 left-10 opacity-20"
      />

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-sm">
              <Receipt className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Billing & Payments
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage customer bills and track payments
              </p>
            </div>
          </div>
          <Button onClick={handleAddNew} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Generate Bill
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="stat-card border-violet-500/20 hover:border-violet-500/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bills
                </CardTitle>
                <FileText className="h-5 w-5 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalBills}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="stat-card border-orange-500/20 hover:border-orange-500/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Outstanding
                </CardTitle>
                <Clock className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  ₹{totalOutstanding.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="stat-card border-green-500/20 hover:border-green-500/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Collected
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">
                  ₹{totalCollected.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="stat-card border-emerald-500/20 hover:border-emerald-500/40">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paid Bills
                </CardTitle>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-500">
                  {paidBills}
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredBills.map((bill) => {
              const outstanding =
                Number(bill.totalAmount) - Number(bill.paidAmount)
              return (
                <motion.div
                  key={bill.id}
                  variants={item}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="card-gradient group h-full border-violet-500/20 transition-all hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                              <Calendar className="h-4 w-4 text-violet-400" />
                            </div>
                            <span className="text-lg font-bold">
                              {MONTH_NAMES[bill.month - 1]} {bill.year}
                            </span>
                          </div>
                          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              {bill.customer.name}
                            </span>
                          </div>
                          <div className="space-y-2 rounded-lg bg-background/30 p-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Total Amount
                              </span>
                              <span className="font-semibold">
                                ₹{Number(bill.totalAmount).toFixed(2)}
                              </span>
                            </div>
                            {bill.paidAmount > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Paid
                                </span>
                                <span className="font-semibold text-green-500">
                                  ₹{Number(bill.paidAmount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            {outstanding > 0 && (
                              <div className="flex justify-between border-t border-border/50 pt-2 text-sm">
                                <span className="font-medium text-muted-foreground">
                                  Outstanding
                                </span>
                                <span className="font-bold text-orange-500">
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
                            className={
                              bill.status === "PAID"
                                ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                : bill.status === "PARTIAL"
                                  ? "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30"
                                  : "border-red-500/50 text-red-500"
                            }
                          >
                            {bill.status}
                          </Badge>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-violet-500/20 hover:text-violet-400"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 border-border/50 bg-background/95 backdrop-blur-lg"
                            >
                              <DropdownMenuItem className="cursor-pointer hover:bg-violet-500/10 focus:bg-violet-500/10">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {bill.status !== "PAID" && (
                                <DropdownMenuItem
                                  className="cursor-pointer hover:bg-violet-500/10 focus:bg-violet-500/10"
                                  onClick={() => handleRecordPayment(bill)}
                                >
                                  <Wallet className="mr-2 h-4 w-4" />
                                  Record Payment
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer hover:bg-violet-500/10 focus:bg-violet-500/10">
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

        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for this bill. You can make partial or full
                payments.
              </DialogDescription>
            </DialogHeader>
            {selectedBill && (
              <PaymentForm
                billId={selectedBill.id}
                billDetails={{
                  customerName: selectedBill.customer.name,
                  month: MONTH_NAMES[selectedBill.month - 1],
                  year: selectedBill.year,
                  totalAmount: Number(selectedBill.totalAmount),
                  paidAmount: Number(selectedBill.paidAmount),
                  outstandingAmount:
                    Number(selectedBill.totalAmount) -
                    Number(selectedBill.paidAmount),
                }}
                onSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setIsPaymentDialogOpen(false)
                  setSelectedBill(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </GridBackground>
  )
}
