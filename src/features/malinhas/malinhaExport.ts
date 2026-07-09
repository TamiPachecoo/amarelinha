import { jsPDF } from "jspdf"
import type { Malinha, MalinhaItem } from "@/features/malinhas/types"
import type { Product, ProductVariant } from "@/features/products/types"
import { formatBRL } from "@/features/products/utils"

interface ExportContext {
  clienteNome: string
  findProduct: (productId: string) => Product | undefined
  findVariant: (productId: string, variantId: string) => ProductVariant | undefined
}

function sanitizeFilename(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
}

export function exportMalinhaToPdf(malinha: Malinha, items: MalinhaItem[], context: ExportContext) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  let y = margin

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.text(`Malinha Amarelinha — ${malinha.numero}`, margin, y)
  y += 7

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Cliente: ${context.clienteNome}`, margin, y)
  y += 5
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, margin, y)
  y += 5
  const totalPecas = items.reduce((sum, item) => sum + item.quantidade, 0)
  doc.text(`${items.length} ${items.length === 1 ? "item" : "itens"} · ${totalPecas} peças`, margin, y)
  y += 6

  doc.setDrawColor(220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  const rowHeight = 12
  let total = 0

  for (const item of items) {
    if (y + rowHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }

    const product = context.findProduct(item.productId)
    const variant = context.findVariant(item.productId, item.variantId)
    const precoVenda = product?.precoVenda ?? 0
    const subtotal = precoVenda * item.quantidade
    total += subtotal

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.text(product?.nome ?? "—", margin, y)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(
      `Cor: ${variant?.cor ?? "—"}   ·   Tamanho: ${variant?.tamanho ?? "—"}   ·   Quantidade: ${item.quantidade}`,
      margin,
      y + 5
    )
    doc.text(`${formatBRL(precoVenda)} un.  ·  Subtotal: ${formatBRL(subtotal)}`, pageWidth - margin, y, {
      align: "right",
    })

    y += rowHeight
    doc.setDrawColor(235)
    doc.line(margin, y - 3, pageWidth - margin, y - 3)
  }

  y += 4
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text(`Total: ${formatBRL(total)}`, pageWidth - margin, y, { align: "right" })

  doc.save(`malinha-${malinha.numero}-${sanitizeFilename(context.clienteNome)}.pdf`)
}
