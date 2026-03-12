"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  FileDown,
  Calendar,
  User,
  Loader2,
  Eye,
  Trash2,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { toast } from "sonner"
import { MoreVertical, Download } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import {
  generateMonthlyReportPDF,
  generateCustomerStatementPDF,
  downloadPDF,
} from "@/lib/pdf-generator"

interface Customer {
  id: string
  name: string
  phone?: string
}

interface Report {
  id: string
  type: "MONTHLY" | "CUSTOMER_STATEMENT"
  title: string
  description: string | null
  month: number | null
  year: number | null
  customerName: string | null
  startDate: string | null
  endDate: string | null
  data: any
  createdAt: string
}

export default function ReportsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingReports, setLoadingReports] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Monthly Report Dialog
  const [monthlyDialogOpen, setMonthlyDialogOpen] = useState(false)
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear())
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1)
  const [generatingMonthly, setGeneratingMonthly] = useState(false)

  // Customer Statement Dialog
  const [statementDialogOpen, setStatementDialogOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [statementStartDate, setStatementStartDate] = useState("")
  const [statementEndDate, setStatementEndDate] = useState("")
  const [generatingStatement, setGeneratingStatement] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (statementDialogOpen && customers.length === 0) {
      fetchCustomers()
    }
  }, [statementDialogOpen])

  async function fetchReports() {
    try {
      const res = await fetch("/api/reports")
      if (res.ok) {
        const data = await res.json()
        setReports(data)
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      toast.error("Failed to load reports")
    } finally {
      setLoadingReports(false)
    }
  }

  async function fetchCustomers() {
    setLoadingCustomers(true)
    try {
      const res = await fetch("/api/customers")
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      toast.error("Failed to load customers")
    } finally {
      setLoadingCustomers(false)
    }
  }

  const handleGenerateMonthlyReport = async () => {
    setGeneratingMonthly(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MONTHLY",
          month: monthlyMonth,
          year: monthlyYear,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to generate report")
      }

      const newReport = await res.json()
      toast.success(
        `Monthly report for ${getMonthName(monthlyMonth)} ${monthlyYear} generated!`
      )
      setMonthlyDialogOpen(false)
      fetchReports() // Refresh the list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate report"
      )
    } finally {
      setGeneratingMonthly(false)
    }
  }

  const handleGenerateStatement = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer")
      return
    }

    if (!statementStartDate || !statementEndDate) {
      toast.error("Please select date range")
      return
    }

    setGeneratingStatement(true)
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CUSTOMER_STATEMENT",
          customerId: selectedCustomerId,
          startDate: statementStartDate,
          endDate: statementEndDate,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to generate statement")
      }

      const newReport = await res.json()
      const customer = customers.find((c) => c.id === selectedCustomerId)
      toast.success(`Statement for ${customer?.name} generated!`)
      setStatementDialogOpen(false)
      fetchReports() // Refresh the list
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate statement"
      )
    } finally {
      setGeneratingStatement(false)
    }
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    setViewDialogOpen(true)
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/reports/${reportToDelete}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete report")
      }

      toast.success("Report deleted successfully")
      fetchReports()
      setDeleteDialogOpen(false)
      setReportToDelete(null)
    } catch (error) {
      toast.error("Failed to delete report")
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadPDF = (report: Report) => {
    try {
      if (report.type === "MONTHLY") {
        const doc = generateMonthlyReportPDF(report.title, report.data)
        downloadPDF(
          doc,
          `Monthly_Report_${report.data.month}_${report.data.year}`
        )
      } else if (report.type === "CUSTOMER_STATEMENT") {
        const doc = generateCustomerStatementPDF(report.title, report.data)
        downloadPDF(
          doc,
          `Customer_Statement_${report.customerName?.replace(/\s+/g, "_")}_${new Date(report.startDate!).toISOString().split("T")[0]}`
        )
      }
      toast.success("PDF downloaded successfully!")
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error("Failed to generate PDF")
    }
  }

  const getMonthName = (month: number) => {
    const months = [
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
    return months[month - 1]
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground">
          Generate comprehensive farm reports
        </p>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Report
            </CardTitle>
            <CardDescription>
              Complete monthly farm summary including cows, feed, expenses, and revenue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => setMonthlyDialogOpen(true)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Statement
            </CardTitle>
            <CardDescription>
              Individual customer billing statement with delivery history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setStatementDialogOpen(true)}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Generate Statement
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Generated Reports List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Reports
            </CardTitle>
            <CardDescription>View and manage your generated reports</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReports ? (
              <LoadingSpinner />
            ) : reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports generated yet"
                description="Generate your first monthly report or customer statement"
              />
            ) : (
              <div className="space-y-3">
                {reports.map((report, idx) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{report.title}</h3>
                        <Badge
                          variant={
                            report.type === "MONTHLY" ? "default" : "secondary"
                          }
                        >
                          {report.type === "MONTHLY" ? "Monthly" : "Statement"}
                        </Badge>
                      </div>
                      {report.description && (
                        <p className="text-sm text-muted-foreground">
                          {report.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        Generated on{" "}
                        {new Date(report.createdAt).toLocaleDateString()} at{" "}
                        {new Date(report.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewReport(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadPDF(report)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setReportToDelete(report.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Report Dialog */}
      <Dialog open={monthlyDialogOpen} onOpenChange={setMonthlyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Monthly Report</DialogTitle>
            <DialogDescription>
              Select the month and year for the report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={monthlyYear.toString()}
                  onValueChange={(value) => setMonthlyYear(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select
                  value={monthlyMonth.toString()}
                  onValueChange={(value) => setMonthlyMonth(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-4">
              <p className="text-sm text-muted-foreground">
                Report will include all data for{" "}
                <span className="font-semibold text-foreground">
                  {getMonthName(monthlyMonth)} {monthlyYear}
                </span>
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleGenerateMonthlyReport}
                disabled={generatingMonthly}
                className="flex-1"
              >
                {generatingMonthly ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate PDF
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setMonthlyDialogOpen(false)}
                disabled={generatingMonthly}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Statement Dialog */}
      <Dialog open={statementDialogOpen} onOpenChange={setStatementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Customer Statement</DialogTitle>
            <DialogDescription>
              Select customer and date range for the statement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              {loadingCustomers ? (
                <div className="flex h-10 items-center justify-center rounded-md border bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : customers.length === 0 ? (
                <div className="flex h-10 items-center justify-center rounded-md border border-yellow-500/50 bg-yellow-500/10 text-sm text-yellow-700">
                  No customers available
                </div>
              ) : (
                <Select
                  value={selectedCustomerId}
                  onValueChange={setSelectedCustomerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.phone && ` - ${customer.phone}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={statementStartDate}
                  onChange={(e) => setStatementStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={statementEndDate}
                  onChange={(e) => setStatementEndDate(e.target.value)}
                />
              </div>
            </div>
            {selectedCustomerId && statementStartDate && statementEndDate && (
              <div className="rounded-lg bg-blue-500/10 p-4">
                <p className="text-sm text-muted-foreground">
                  Statement will include deliveries and bills for{" "}
                  <span className="font-semibold text-foreground">
                    {customers.find((c) => c.id === selectedCustomerId)?.name}
                  </span>
                  {" "}from{" "}
                  <span className="font-semibold text-foreground">
                    {new Date(statementStartDate).toLocaleDateString()}
                  </span>
                  {" "}to{" "}
                  <span className="font-semibold text-foreground">
                    {new Date(statementEndDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleGenerateStatement}
                disabled={
                  generatingStatement ||
                  !selectedCustomerId ||
                  !statementStartDate ||
                  !statementEndDate ||
                  customers.length === 0
                }
                className="flex-1"
              >
                {generatingStatement ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Generate Statement
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setStatementDialogOpen(false)}
                disabled={generatingStatement}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>{selectedReport?.description}</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4 pt-4">
              {selectedReport.type === "MONTHLY" && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary/10 p-4">
                    <h3 className="mb-3 font-semibold">Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active Cows</p>
                        <p className="text-lg font-semibold">
                          {selectedReport.data.summary.activeCows}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Revenue</p>
                        <p className="text-lg font-semibold">
                          ₹{selectedReport.data.summary.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Expenses</p>
                        <p className="text-lg font-semibold">
                          ₹
                          {selectedReport.data.summary.totalExpenses.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Profit</p>
                        <p
                          className={`text-lg font-semibold ${
                            selectedReport.data.summary.netProfit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          ₹{selectedReport.data.summary.netProfit.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Milk Delivered</p>
                        <p className="text-lg font-semibold">
                          {selectedReport.data.summary.totalMilkDelivered.toFixed(
                            2
                          )}{" "}
                          L
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deliveries</p>
                        <p className="text-lg font-semibold">
                          {selectedReport.data.summary.deliveryCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.type === "CUSTOMER_STATEMENT" && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary/10 p-4">
                    <h3 className="mb-3 font-semibold">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        <span className="font-semibold">
                          {selectedReport.data.customer.name}
                        </span>
                      </p>
                      {selectedReport.data.customer.phone && (
                        <p>
                          <span className="text-muted-foreground">Phone:</span>{" "}
                          {selectedReport.data.customer.phone}
                        </p>
                      )}
                      {selectedReport.data.customer.address && (
                        <p>
                          <span className="text-muted-foreground">
                            Address:
                          </span>{" "}
                          {selectedReport.data.customer.address}
                        </p>
                      )}
                      <p>
                        <span className="text-muted-foreground">
                          Price per Liter:
                        </span>{" "}
                        ₹{selectedReport.data.customer.pricePerLiter.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 p-4">
                    <h3 className="mb-3 font-semibold">Statement Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Liters</p>
                        <p className="text-lg font-semibold">
                          {selectedReport.data.summary.totalLiters.toFixed(2)} L
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="text-lg font-semibold">
                          ₹{selectedReport.data.summary.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Paid</p>
                        <p className="text-lg font-semibold text-green-600">
                          ₹{selectedReport.data.summary.totalPaid.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Balance</p>
                        <p
                          className={`text-lg font-semibold ${
                            selectedReport.data.summary.balance > 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          ₹{selectedReport.data.summary.balance.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => selectedReport && handleDownloadPDF(selectedReport)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The report will be permanently
              deleted from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
