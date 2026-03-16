"use client"

import { useState, useEffect } from "react"
import { motion, Variants } from "framer-motion"
import {
  Wheat,
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
import { GridBackground } from "@/components/ui/grid-background"
import { GlowEffect } from "@/components/ui/glow-effect"
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
import FeedEntryForm from "@/components/forms/FeedEntryForm"
import { toast } from "sonner"

interface FeedEntry {
  id: string
  cowId?: string
  cow?: {
    id: string
    name: string
    tagNumber: string
  }
  date: string
  feedType: string
  customType?: string
  quantityKg: number
  costPerKg: number
  totalCost: number
  notes?: string
  createdAt: string
}

const FEED_TYPE_LABELS: Record<string, string> = {
  GREEN_FODDER: "Green Fodder",
  DRY_FODDER: "Dry Fodder",
  CONCENTRATE: "Concentrate",
  SILAGE: "Silage",
  MINERAL_MIX: "Mineral Mix",
  CUSTOM: "Custom",
}

const FEED_TYPE_COLORS: Record<string, string> = {
  GREEN_FODDER: "bg-green-500",
  DRY_FODDER: "bg-yellow-500",
  CONCENTRATE: "bg-blue-500",
  SILAGE: "bg-purple-500",
  MINERAL_MIX: "bg-orange-500",
  CUSTOM: "bg-gray-500",
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

export default function FeedPage() {
  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteFeedId, setDeleteFeedId] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchFeedEntries()
  }, [])

  async function fetchFeedEntries() {
    try {
      const res = await fetch("/api/feed")
      if (res.ok) {
        const data = await res.json()
        setFeedEntries(data)
      }
    } catch (error) {
      console.error("Failed to fetch feed entries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    fetchFeedEntries()
  }

  const handleDelete = async () => {
    if (!deleteFeedId) return

    setProcessingId(deleteFeedId)
    try {
      const response = await fetch(`/api/feed/${deleteFeedId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete feed entry")
      }

      toast.success("Feed entry deleted successfully")
      fetchFeedEntries()
    } catch (error) {
      toast.error("Failed to delete feed entry")
    } finally {
      setProcessingId(null)
      setDeleteFeedId(null)
    }
  }

  const handleAddNew = () => {
    setIsDialogOpen(true)
  }

  const filteredFeedEntries = feedEntries.filter((entry) => {
    const feedTypeLabel =
      entry.customType || FEED_TYPE_LABELS[entry.feedType] || entry.feedType
    const matchesSearch =
      feedTypeLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.cow?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.cow?.tagNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Calculate total feed cost
  const totalCost = feedEntries.reduce(
    (sum, entry) => sum + Number(entry.totalCost),
    0
  )

  // Calculate total quantity
  const totalQuantity = feedEntries.reduce(
    (sum, entry) => sum + Number(entry.quantityKg),
    0
  )

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">
            Loading feed entries...
          </p>
        </div>
      </div>
    )
  }

  return (
    <GridBackground className="min-h-screen">
      <GlowEffect
        color="green"
        size="lg"
        className="-top-20 right-10 opacity-30"
      />
      <GlowEffect
        color="green"
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
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm">
              <Wheat className="h-7 w-7 text-green-500" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                Feed Management
              </h1>
              <p className="mt-1 text-muted-foreground">
                Track daily feed consumption and costs
              </p>
            </div>
          </div>
          <Button onClick={handleAddNew} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Feed Entry
          </Button>
        </motion.div>

        {/* Stats Cards */}
        {feedEntries.length > 0 && (
          <motion.div
            className="grid gap-5 md:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="stat-card border-green-500/20 hover:border-green-500/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Cost
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{totalCost.toFixed(2)}
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
                  <CardTitle className="text-sm font-medium">
                    Total Quantity
                  </CardTitle>
                  <Wheat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalQuantity.toFixed(1)} kg
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
                  <CardTitle className="text-sm font-medium">
                    Total Entries
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{feedEntries.length}</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Search */}
        {feedEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by feed type, cow name, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        )}

        {/* Feed Entry Cards */}
        {filteredFeedEntries.length === 0 ? (
          <EmptyState
            icon={Wheat}
            title={searchQuery ? "No feed entries found" : "No feed entries"}
            description={
              searchQuery
                ? "Try adjusting your search query"
                : "Record daily feed consumption to track costs and optimize feeding"
            }
            actionLabel={!searchQuery ? "Add Feed Entry" : undefined}
            onAction={!searchQuery ? handleAddNew : undefined}
          />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredFeedEntries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={item}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="card-gradient group border-green-500/20 transition-all hover:border-green-500/40 hover:shadow-xl hover:shadow-green-500/10">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm">
                            <Wheat className="h-6 w-6 text-green-500" />
                          </div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                className="transition-all"
                                style={{
                                  backgroundColor:
                                    FEED_TYPE_COLORS[entry.feedType] || "gray",
                                }}
                              >
                                {entry.customType ||
                                  FEED_TYPE_LABELS[entry.feedType] ||
                                  entry.feedType}
                              </Badge>
                            </div>
                            {entry.cow && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Tag className="h-3.5 w-3.5" />
                                <span className="font-medium">
                                  {entry.cow.name}
                                </span>
                                <span className="text-xs">
                                  ({entry.cow.tagNumber})
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Quantity
                                </p>
                                <p className="text-sm font-semibold">
                                  {Number(entry.quantityKg).toFixed(1)} kg
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Cost
                                </p>
                                <p className="text-sm font-semibold text-green-500">
                                  ₹{Number(entry.totalCost).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            {entry.notes && (
                              <p className="line-clamp-2 text-sm text-muted-foreground italic">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-green-500/10"
                            disabled={processingId === entry.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 backdrop-blur-sm"
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteFeedId(entry.id)
                            }}
                            className="cursor-pointer text-destructive hover:bg-destructive/10 focus:text-destructive"
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
              <DialogTitle>Add Feed Entry</DialogTitle>
              <DialogDescription>
                Record feed consumption for a cow
              </DialogDescription>
            </DialogHeader>
            <FeedEntryForm
              onSuccess={handleSuccess}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!deleteFeedId}
          onOpenChange={(open) => !open && setDeleteFeedId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                feed entry record.
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
