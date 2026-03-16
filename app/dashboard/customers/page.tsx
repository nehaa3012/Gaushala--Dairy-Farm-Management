"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import {
  Plus,
  Search,
  Users,
  Phone,
  MapPin,
  DollarSign,
  MoreVertical,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
import CustomerForm from "@/components/forms/CustomerForm"
import { toast } from "sonner"
import { GridBackground } from "@/components/ui/grid-background"
import { GlowEffect } from "@/components/ui/glow-effect"

interface Customer {
  id: string
  name: string
  phone?: string
  address?: string
  pricePerLiter: number
  isActive: boolean
  createdAt: string
}

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers")
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingCustomer(null)
    fetchCustomers() // Refresh the customer list
  }

  const handleEdit = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCustomer(customer)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteCustomerId) return

    setProcessingId(deleteCustomerId)
    try {
      const response = await fetch(`/api/customers/${deleteCustomerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete customer")
      }

      toast.success("Customer deleted successfully")
      fetchCustomers()
    } catch (error) {
      toast.error("Failed to delete customer")
    } finally {
      setProcessingId(null)
      setDeleteCustomerId(null)
    }
  }

  const handleToggleActive = async (
    customer: Customer,
    e: React.MouseEvent
  ) => {
    e.stopPropagation()

    setProcessingId(customer.id)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !customer.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update customer status")
      }

      toast.success(
        `Customer ${!customer.isActive ? "activated" : "deactivated"} successfully`
      )
      fetchCustomers()
    } catch (error) {
      toast.error("Failed to update customer status")
    } finally {
      setProcessingId(null)
    }
  }

  const handleAddNew = () => {
    setEditingCustomer(null)
    setIsDialogOpen(true)
  }

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && customer.isActive) ||
      (filter === "inactive" && !customer.isActive)
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
          <p className="text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <GridBackground className="min-h-screen">
      {/* Ambient Glow Effects */}
      <GlowEffect
        color="blue"
        size="lg"
        className="-top-20 right-10 opacity-30"
      />
      <GlowEffect
        color="blue"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Customers
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage your milk delivery customers
              </p>
            </div>
          </div>
          <Button onClick={handleAddNew} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Add Customer
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={
                filter === "all" ? "bg-blue-500 hover:bg-blue-600" : ""
              }
            >
              All
            </Button>
            <Button
              variant={filter === "active" ? "default" : "outline"}
              onClick={() => setFilter("active")}
              className={
                filter === "active" ? "bg-blue-500 hover:bg-blue-600" : ""
              }
            >
              Active
            </Button>
            <Button
              variant={filter === "inactive" ? "default" : "outline"}
              onClick={() => setFilter("inactive")}
              className={
                filter === "inactive" ? "bg-blue-500 hover:bg-blue-600" : ""
              }
            >
              Inactive
            </Button>
          </div>
        </motion.div>

        {/* Customer Cards */}
        {filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              searchQuery
                ? "Try adjusting your search query"
                : "Add your first customer to start tracking deliveries"
            }
            actionLabel={!searchQuery ? "Add Customer" : undefined}
            onAction={!searchQuery ? handleAddNew : undefined}
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                variants={item}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="card-gradient group h-full border-blue-500/20 transition-all hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                            <Users className="h-5 w-5 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold transition-colors group-hover:text-blue-400">
                              {customer.name}
                            </h3>
                            <div className="mt-3 space-y-2">
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                                  <span className="font-medium">
                                    {customer.phone}
                                  </span>
                                </div>
                              )}
                              {customer.address && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                                  <span className="line-clamp-1 font-medium">
                                    {customer.address}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-2 py-1 text-sm font-bold text-blue-400">
                                <DollarSign className="h-3.5 w-3.5" />₹
                                {Number(customer.pricePerLiter).toFixed(2)}/L
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                          className={
                            customer.isActive
                              ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                              : "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                          }
                        >
                          {customer.isActive ? "Active" : "Inactive"}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-500/20 hover:text-blue-400"
                              disabled={processingId === customer.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 border-border/50 bg-background/95 backdrop-blur-lg"
                          >
                            <DropdownMenuItem
                              onClick={(e) => handleEdit(customer, e)}
                              className="cursor-pointer hover:bg-blue-500/10 focus:bg-blue-500/10"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleToggleActive(customer, e)}
                              className="cursor-pointer hover:bg-blue-500/10 focus:bg-blue-500/10"
                            >
                              {customer.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteCustomerId(customer.id)
                              }}
                              className="cursor-pointer text-destructive hover:bg-red-500/10 focus:bg-red-500/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {editingCustomer
                  ? "Update the customer details"
                  : "Fill in the customer details to start tracking deliveries"}
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              customerId={editingCustomer?.id}
              defaultValues={
                editingCustomer
                  ? {
                      name: editingCustomer.name,
                      phone: editingCustomer.phone || "",
                      address: editingCustomer.address || "",
                      pricePerLiter: Number(editingCustomer.pricePerLiter),
                    }
                  : undefined
              }
              onSuccess={handleSuccess}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingCustomer(null)
              }}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!deleteCustomerId}
          onOpenChange={(open) => !open && setDeleteCustomerId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                customer and all associated data including deliveries and bills.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </GridBackground>
  )
}
