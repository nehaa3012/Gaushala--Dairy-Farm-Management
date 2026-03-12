"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Beef, Plus, Search, Hash, Tag, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react"
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
import CowForm from "@/components/forms/CowForm"
import { toast } from "sonner"
import { formatAgeFromDOB } from "@/lib/utils"

interface Cow {
  id: string
  name: string
  tagNumber: string
  breed: string
  dateOfBirth?: string
  age?: number
  status: string
  notes?: string
  createdAt: string
}

const COW_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-500",
  MILKING: "bg-green-500",
  DRY: "bg-yellow-500",
  PREGNANT: "bg-blue-500",
  SICK: "bg-red-500",
  SOLD: "bg-orange-500",
  DECEASED: "bg-gray-500",
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

export default function CowsPage() {
  const [cows, setCows] = useState<Cow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCow, setEditingCow] = useState<Cow | null>(null)
  const [deleteCowId, setDeleteCowId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCows()
  }, [])

  async function fetchCows() {
    try {
      const res = await fetch("/api/cows")
      if (res.ok) {
        const data = await res.json()
        setCows(data)
      }
    } catch (error) {
      console.error("Failed to fetch cows:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setEditingCow(null)
    fetchCows()
  }

  const handleEdit = (cow: Cow, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingCow(cow)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteCowId) return
    
    setProcessingId(deleteCowId)
    try {
      const response = await fetch(`/api/cows/${deleteCowId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete cow")
      }

      toast.success("Cow deleted successfully")
      fetchCows()
    } catch (error) {
      toast.error("Failed to delete cow")
    } finally {
      setProcessingId(null)
      setDeleteCowId(null)
    }
  }

  const handleAddNew = () => {
    setEditingCow(null)
    setIsDialogOpen(true)
  }

  const filteredCows = cows.filter((cow) => {
    const matchesSearch =
      cow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cow.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cow.breed.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

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
            Cow Management
          </h1>
          <p className="text-muted-foreground">
            Track your cows and their production
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Cow
        </Button>
      </motion.div>

      {/* Search */}
      {cows.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag number, or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>
      )}

      {/* Cow Cards */}
      {filteredCows.length === 0 ? (
        <EmptyState
          icon={Beef}
          title={searchQuery ? "No cows found" : "No cows added yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Start by adding your first cow to track milk production and feed consumption"
          }
          actionLabel={!searchQuery ? "Add Your First Cow" : undefined}
          onAction={!searchQuery ? handleAddNew : undefined}
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredCows.map((cow) => (
            <motion.div key={cow.id} variants={item}>
              <Card className="group transition-all hover:border-primary/50 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold transition-colors group-hover:text-primary">
                            {cow.name}
                          </h3>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Hash className="h-3 w-3" />
                              {cow.tagNumber}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Tag className="h-3 w-3" />
                              {cow.breed}
                            </div>
                            {cow.dateOfBirth && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatAgeFromDOB(cow.dateOfBirth)} old
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className="transition-all"
                        style={{
                          backgroundColor: COW_STATUS_COLORS[cow.status] || "gray",
                        }}
                      >
                        {cow.status}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                            disabled={processingId === cow.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => handleEdit(cow, e)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Cow
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteCowId(cow.id)
                            }}
                            className="cursor-pointer text-destructive focus:text-destructive"
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
              {editingCow ? "Edit Cow" : "Add New Cow"}
            </DialogTitle>
            <DialogDescription>
              {editingCow
                ? "Update the cow details"
                : "Fill in the details to add a new cow to your farm"}
            </DialogDescription>
          </DialogHeader>
          <CowForm
            cowId={editingCow?.id}
            defaultValues={
              editingCow
                ? {
                    name: editingCow.name,
                    tagNumber: editingCow.tagNumber,
                    breed: editingCow.breed,
                    dateOfBirth: editingCow.dateOfBirth || "",
                    status: editingCow.status as any,
                    notes: editingCow.notes || "",
                  }
                : undefined
            }
            onSuccess={handleSuccess}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingCow(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteCowId}
        onOpenChange={(open) => !open && setDeleteCowId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              cow and all associated data including feed entries.
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
