import { jsPDF } from "jspdf"
import type { PurchaseOrderItemFormValues } from "@/features/purchasing/schemas/purchaseOrderSchema"

interface ExportContext {
  supplierNome: string
  collectionNome?: string
}

function sanitizeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
}

export function exportOrderToPdf(items: PurchaseOrderItemFormValues[], context: ExportContext) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  let y = margin

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text("Pedido de Compra", margin, y)
  y += 7

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Fornecedor: ${context.supplierNome}`, margin, y)
  y += 5
  if (context.collectionNome) {
    doc.text(`Coleção: ${context.collectionNome}`, margin, y)
    y += 5
  }
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, margin, y)
  y += 5
  const totalPecas = items.reduce((sum, item) => sum + item.quantidadePedida, 0)
  doc.text(`${items.length} ${items.length === 1 ? "item" : "itens"} · ${totalPecas} peças`, margin, y)
  y += 6

  doc.setDrawColor(220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  const imageSize = 18
  const rowHeight = imageSize + 5

  for (const item of items) {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }

    if (item.foto) {
      try {
        doc.addImage(item.foto, "PNG", margin, y, imageSize, imageSize)
      } catch {
        doc.setDrawColor(210)
        doc.rect(margin, y, imageSize, imageSize)
      }
    } else {
      doc.setDrawColor(210)
      doc.rect(margin, y, imageSize, imageSize)
    }

    const textX = margin + imageSize + 6
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(item.nome, textX, y + 6)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Código: ${item.codigoFornecedor}`, textX, y + 11.5)
    doc.text(
      `Cor: ${item.cor}   ·   Tamanho: ${item.tamanho}   ·   Quantidade: ${item.quantidadePedida}`,
      textX,
      y + 16.5
    )

    y += rowHeight + 4
    doc.setDrawColor(235)
    doc.line(margin, y - 2, pageWidth - margin, y - 2)
  }

  doc.save(`pedido-${sanitizeFilename(context.supplierNome)}.pdf`)
}

export function exportOrderToCsv(items: PurchaseOrderItemFormValues[], context: ExportContext) {
  const headers = [
    "Código",
    "Produto",
    "Categoria",
    "Marca",
    "Cor",
    "Tamanho",
    "Quantidade",
    "Custo Unitário",
    "Preço de Venda",
  ]

  const rows = items.map((item) => [
    item.codigoFornecedor,
    item.nome,
    item.categoria,
    item.marca,
    item.cor,
    item.tamanho,
    String(item.quantidadePedida),
    item.custoUnitario.toFixed(2).replace(".", ","),
    item.precoVenda.toFixed(2).replace(".", ","),
  ])

  function escapeCsvField(value: string) {
    return /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
  }

  // Delimitador ";" e BOM UTF-8: é o que o Excel em português espera para
  // abrir o CSV direto com acentuação correta, sem passar por importação manual.
  const csvLines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(";"))
  const csvContent = "\uFEFF" + csvLines.join("\r\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `pedido-${sanitizeFilename(context.supplierNome)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
