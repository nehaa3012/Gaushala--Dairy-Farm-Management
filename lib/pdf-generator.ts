import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface MonthlyReportData {
  month: number
  year: number
  period: string
  summary: {
    activeCows: number
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    totalMilkDelivered: number
    deliveryCount: number
  }
  deliveries: Array<{
    date: string
    customerName: string
    liters: number
    priceAtTime: number
    amount: number
    session: string
  }>
  expenses: Array<{
    date: string
    category: string
    amount: number
    notes?: string
  }>
  feedEntries: Array<{
    date: string
    cowName: string
    feedType: string
    quantityKg: number
    totalCost: number
  }>
}

interface CustomerStatementData {
  customer: {
    id: string
    name: string
    phone?: string
    address?: string
    pricePerLiter: number
  }
  period: {
    startDate: string
    endDate: string
  }
  summary: {
    totalLiters: number
    totalAmount: number
    totalPaid: number
    balance: number
    deliveryCount: number
  }
  deliveries: Array<{
    date: string
    liters: number
    priceAtTime: number
    amount: number
    session: string
  }>
  bills: Array<{
    month: number
    year: number
    totalAmount: number
    paidAmount: number
    status: string
    payments: Array<{
      amount: number
      paidAt: string
      notes?: string
    }>
  }>
}

export function generateMonthlyReportPDF(
  title: string,
  data: MonthlyReportData
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(title, pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // Summary Section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Summary", 14, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const summaryData = [
    ["Active Cows", data.summary.activeCows.toString()],
    ["Total Revenue", `₹${data.summary.totalRevenue.toFixed(2)}`],
    ["Total Expenses", `₹${data.summary.totalExpenses.toFixed(2)}`],
    [
      "Net Profit",
      `₹${data.summary.netProfit.toFixed(2)}`,
      data.summary.netProfit >= 0 ? "profit" : "loss",
    ],
    [
      "Total Milk Delivered",
      `${data.summary.totalMilkDelivered.toFixed(2)} L`,
    ],
    ["Number of Deliveries", data.summary.deliveryCount.toString()],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [["Metric", "Value"]],
    body: summaryData.map((row) => [row[0], row[1]]),
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // Deliveries Section
  if (data.deliveries.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Deliveries", 14, yPos)
    yPos += 7

    const deliveryRows = data.deliveries.map((d) => [
      new Date(d.date).toLocaleDateString(),
      d.customerName,
      d.liters.toFixed(2),
      `₹${d.priceAtTime.toFixed(2)}`,
      `₹${d.amount.toFixed(2)}`,
      d.session,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Customer", "Liters", "Rate", "Amount", "Session"]],
      body: deliveryRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Expenses Section
  if (data.expenses.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Expenses", 14, yPos)
    yPos += 7

    const expenseRows = data.expenses.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.category,
      `₹${e.amount.toFixed(2)}`,
      e.notes || "-",
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Category", "Amount", "Notes"]],
      body: expenseRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Feed Entries Section
  if (data.feedEntries.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Feed Entries", 14, yPos)
    yPos += 7

    const feedRows = data.feedEntries.map((f) => [
      new Date(f.date).toLocaleDateString(),
      f.cowName,
      f.feedType.replace(/_/g, " "),
      `${f.quantityKg.toFixed(2)} kg`,
      `₹${f.totalCost.toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Cow", "Feed Type", "Quantity", "Cost"]],
      body: feedRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  return doc
}

export function generateCustomerStatementPDF(
  title: string,
  data: CustomerStatementData
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text(title, pageWidth / 2, yPos, { align: "center" })
  yPos += 15

  // Customer Information
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Customer Information", 14, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const customerInfo = [
    ["Name", data.customer.name],
    ["Phone", data.customer.phone || "N/A"],
    ["Address", data.customer.address || "N/A"],
    ["Price per Liter", `₹${data.customer.pricePerLiter.toFixed(2)}`],
    [
      "Period",
      `${new Date(data.period.startDate).toLocaleDateString()} - ${new Date(data.period.endDate).toLocaleDateString()}`,
    ],
  ]

  autoTable(doc, {
    startY: yPos,
    body: customerInfo,
    theme: "plain",
    styles: { fontSize: 10 },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
    },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // Summary Section
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Statement Summary", 14, yPos)
  yPos += 10

  const summaryData = [
    ["Total Liters", `${data.summary.totalLiters.toFixed(2)} L`],
    ["Total Amount", `₹${data.summary.totalAmount.toFixed(2)}`],
    ["Total Paid", `₹${data.summary.totalPaid.toFixed(2)}`],
    [
      "Balance Due",
      `₹${data.summary.balance.toFixed(2)}`,
      data.summary.balance > 0 ? "due" : "clear",
    ],
    ["Number of Deliveries", data.summary.deliveryCount.toString()],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [["Description", "Value"]],
    body: summaryData.map((row) => [row[0], row[1]]),
    theme: "striped",
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 15

  // Deliveries Section
  if (data.deliveries.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Delivery History", 14, yPos)
    yPos += 7

    const deliveryRows = data.deliveries.map((d) => [
      new Date(d.date).toLocaleDateString(),
      d.session,
      d.liters.toFixed(2),
      `₹${d.priceAtTime.toFixed(2)}`,
      `₹${d.amount.toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Date", "Session", "Liters", "Rate", "Amount"]],
      body: deliveryRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15
  }

  // Bills Section
  if (data.bills.length > 0) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Billing History", 14, yPos)
    yPos += 7

    const billRows = data.bills.map((b) => [
      `${getMonthName(b.month)} ${b.year}`,
      `₹${b.totalAmount.toFixed(2)}`,
      `₹${b.paidAmount.toFixed(2)}`,
      b.status,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Period", "Total", "Paid", "Status"]],
      body: billRows,
      theme: "striped",
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    )
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  return doc
}

function getMonthName(month: number) {
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

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(`${filename}.pdf`)
}
