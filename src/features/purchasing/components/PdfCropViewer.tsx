import { useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { ChevronLeft, ChevronRight, Crop } from "lucide-react"

import { Button } from "@/components/ui/button"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

interface PdfCropViewerProps {
  pdfUrl: string
  isImage?: boolean
  onCrop: (dataUrl: string) => void
}

interface Rect { x: number; y: number; width: number; height: number }

export function PdfCropViewer({ pdfUrl, isImage = false, onCrop }: PdfCropViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selection, setSelection] = useState<Rect | null>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const pointerMoved = useRef(false)

  useEffect(() => {
    const el = scrollWrapperRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWrapperWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (wrapperWidth === 0) return
    let cancelled = false

    async function renderImage() {
      setIsLoading(true)
      const img = new Image()
      img.src = pdfUrl
      await img.decode()
      if (cancelled) return
      setNumPages(1)
      const scale = Math.min(2.5, Math.max(0.55, (wrapperWidth - 16) / img.naturalWidth))
      const canvas = canvasRef.current
      if (!canvas || cancelled) return
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      const context = canvas.getContext("2d")
      if (!context) return
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
      if (!cancelled) setIsLoading(false)
    }

    async function renderPdfPage() {
      setIsLoading(true)
      const doc = await pdfjsLib.getDocument({ url: pdfUrl }).promise
      if (cancelled) return
      setNumPages(doc.numPages)
      const page = await doc.getPage(pageNumber)
      const naturalViewport = page.getViewport({ scale: 1 })
      const scale = Math.min(2.5, Math.max(0.55, (wrapperWidth - 16) / naturalViewport.width))
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas || cancelled) return
      canvas.width = viewport.width
      canvas.height = viewport.height
      const context = canvas.getContext("2d")
      if (!context) return
      await page.render({ canvasContext: context, viewport, canvas }).promise
      if (!cancelled) setIsLoading(false)
    }

    if (isImage) renderImage()
    else renderPdfPage()
    setSelection(null)
    return () => { cancelled = true }
  }, [pdfUrl, pageNumber, wrapperWidth, isImage])

  function getRelativePos(clientX: number, clientY: number) {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (isLoading) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const pos = getRelativePos(e.clientX, e.clientY)
    dragStart.current = pos
    pointerMoved.current = false
    setSelection({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragStart.current) return
    const pos = getRelativePos(e.clientX, e.clientY)
    if (Math.abs(pos.x - dragStart.current.x) > 6 || Math.abs(pos.y - dragStart.current.y) > 6) pointerMoved.current = true
    setSelection({
      x: Math.min(dragStart.current.x, pos.x),
      y: Math.min(dragStart.current.y, pos.y),
      width: Math.abs(pos.x - dragStart.current.x),
      height: Math.abs(pos.y - dragStart.current.y),
    })
  }

  function handlePointerUp(e: React.PointerEvent) {
    const start = dragStart.current
    if (start && !pointerMoved.current && containerRef.current) {
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      const size = Math.min(180, Math.max(110, width * 0.32))
      setSelection({
        x: Math.max(0, Math.min(width - size, start.x - size / 2)),
        y: Math.max(0, Math.min(height - size, start.y - size / 2)),
        width: Math.min(size, width),
        height: Math.min(size, height),
      })
    }
    dragStart.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* already released */ }
  }

  function handleUsePhoto() {
    const canvas = canvasRef.current
    if (!canvas || !selection || selection.width < 8 || selection.height < 8) return
    const scaleX = canvas.width / canvas.clientWidth
    const scaleY = canvas.height / canvas.clientHeight
    const cropCanvas = document.createElement("canvas")
    cropCanvas.width = selection.width * scaleX
    cropCanvas.height = selection.height * scaleY
    const ctx = cropCanvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(canvas, selection.x * scaleX, selection.y * scaleY, selection.width * scaleX, selection.height * scaleY, 0, 0, cropCanvas.width, cropCanvas.height)
    onCrop(cropCanvas.toDataURL("image/png"))
    setSelection(null)
  }

  return (
    <div className="flex min-h-[430px] flex-col gap-2 lg:h-full lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {isImage ? <div /> : <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" disabled={pageNumber <= 1} onClick={() => setPageNumber((p) => p - 1)}><ChevronLeft className="size-4" /></Button>
          <span className="min-w-[90px] text-center text-sm text-muted-foreground">Página {pageNumber} de {numPages || "…"}</span>
          <Button variant="outline" size="icon" disabled={pageNumber >= numPages} onClick={() => setPageNumber((p) => p + 1)}><ChevronRight className="size-4" /></Button>
        </div>}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Crop className="size-3.5" /> Toque na foto ou arraste para ajustar</p>
      </div>

      <div ref={scrollWrapperRef} className="relative min-h-[320px] flex-1 overflow-auto rounded-lg border border-border bg-muted/30">
        {isLoading && <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Carregando página...</div>}
        <div
          ref={containerRef}
          className="relative inline-block cursor-crosshair select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { dragStart.current = null }}
        >
          <canvas ref={canvasRef} className="block max-w-none" />
          {selection && <div className="pointer-events-none absolute border-2 border-primary bg-primary/15" style={{ left: selection.x, top: selection.y, width: selection.width, height: selection.height }} />}
        </div>
      </div>

      <Button type="button" variant="secondary" disabled={!selection || selection.width < 8 || selection.height < 8} onClick={handleUsePhoto}>Usar seleção como foto do item</Button>
    </div>
  )
}
