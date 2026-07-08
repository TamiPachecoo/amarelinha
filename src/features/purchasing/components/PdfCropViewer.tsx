import { useEffect, useRef, useState } from "react"
import * as pdfjsLib from "pdfjs-dist"
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { ChevronLeft, ChevronRight, Crop } from "lucide-react"

import { Button } from "@/components/ui/button"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

interface PdfCropViewerProps {
  pdfUrl: string
  onCrop: (dataUrl: string) => void
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export function PdfCropViewer({ pdfUrl, onCrop }: PdfCropViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollWrapperRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selection, setSelection] = useState<Rect | null>(null)
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

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

    async function renderPage() {
      setIsLoading(true)
      const doc = await pdfjsLib.getDocument({ url: pdfUrl }).promise
      if (cancelled) return
      setNumPages(doc.numPages)

      const page = await doc.getPage(pageNumber)
      const naturalViewport = page.getViewport({ scale: 1 })
      // Ajusta a escala para caber na largura disponível do painel (menos um respiro),
      // em vez de um zoom fixo que estourava o card em telas normais.
      const scale = Math.min(2.5, Math.max(0.4, (wrapperWidth - 16) / naturalViewport.width))
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

    renderPage()
    setSelection(null)
    return () => {
      cancelled = true
    }
  }, [pdfUrl, pageNumber, wrapperWidth])

  function getRelativePos(e: React.MouseEvent) {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function handleMouseDown(e: React.MouseEvent) {
    const pos = getRelativePos(e)
    dragStart.current = pos
    setSelection({ x: pos.x, y: pos.y, width: 0, height: 0 })
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragStart.current) return
    const pos = getRelativePos(e)
    setSelection({
      x: Math.min(dragStart.current.x, pos.x),
      y: Math.min(dragStart.current.y, pos.y),
      width: Math.abs(pos.x - dragStart.current.x),
      height: Math.abs(pos.y - dragStart.current.y),
    })
  }

  function handleMouseUp() {
    dragStart.current = null
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

    ctx.drawImage(
      canvas,
      selection.x * scaleX,
      selection.y * scaleY,
      selection.width * scaleX,
      selection.height * scaleY,
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    )

    onCrop(cropCanvas.toDataURL("image/png"))
    setSelection(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[90px] text-center text-sm text-muted-foreground">
            Página {pageNumber} de {numPages || "…"}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Crop className="size-3.5" />
          Arraste sobre a foto do produto
        </p>
      </div>

      <div
        ref={scrollWrapperRef}
        className="relative min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-muted/30"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            Carregando página...
          </div>
        )}
        <div
          ref={containerRef}
          className="relative inline-block cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <canvas ref={canvasRef} className="block max-w-none" />
          {selection && (
            <div
              className="absolute border-2 border-primary bg-primary/10"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
              }}
            />
          )}
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={!selection || selection.width < 8 || selection.height < 8}
        onClick={handleUsePhoto}
      >
        Usar seleção como foto do item
      </Button>
    </div>
  )
}
