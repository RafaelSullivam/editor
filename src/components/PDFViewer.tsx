import React, { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { convertUnits } from '../utils/helpers'

// Configure PDF.js worker para usar o worker local
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString()

interface PDFViewerProps {
  file: File | null
  pageNumber: number
  scale: number
  onPageRendered?: (width: number, height: number) => void
  className?: string
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  pageNumber,
  scale,
  onPageRendered,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load PDF file
  useEffect(() => {
    if (!file) {
      setPdf(null)
      return
    }

    setLoading(true)
    setError(null)

    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdfDoc = await loadingTask.promise
        setPdf(pdfDoc)
      } catch (err) {
        setError('Erro ao carregar PDF: ' + (err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadPdf()
  }, [file])

  // Render page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNumber)
        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!

        const viewport = page.getViewport({ scale })
        canvas.width = viewport.width
        canvas.height = viewport.height

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext as any).promise

        // Notify parent component of page dimensions
        if (onPageRendered) {
          // Convert from pixels to mm (assuming 96 DPI for display)
          const widthMm = convertUnits(viewport.width, 'px', 'mm', 96)
          const heightMm = convertUnits(viewport.height, 'px', 'mm', 96)
          onPageRendered(widthMm, heightMm)
        }
      } catch (err) {
        setError('Erro ao renderizar página: ' + (err as Error).message)
      }
    }

    renderPage()
  }, [pdf, pageNumber, scale, onPageRendered])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 ${className}`}>
        <div className="text-center text-red-600">
          <p className="font-medium">Erro</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!pdf) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center text-gray-500">
          <p className="font-medium">Nenhum PDF carregado</p>
          <p className="text-sm">Faça upload de um arquivo PDF para começar</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full shadow-lg"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}

export default PDFViewer
