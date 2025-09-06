import React, { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import { useEditorStore } from '../store/editor'

interface PDFPreviewProps {
  className?: string
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ className = '' }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { currentPage } = useEditorStore()

  const generatePDF = async () => {
    if (!currentPage || !currentPage.elements.length) {
      setNotification({ type: 'error', message: 'Nenhum elemento encontrado para gerar PDF' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsGenerating(true)
    
    try {
      // Configurar página
      const pageWidth = currentPage.config?.width || 794 // pixels
      const pageHeight = currentPage.config?.height || 1123 // pixels
      
      // Converter pixels para mm - usando conversão mais apropriada para editor
      // 1 pixel no editor = 0.35 mm no PDF (aproximadamente 72 DPI)
      const pxToMm = (px: number) => px * 0.2646
      const pageWidthMm = pxToMm(pageWidth)
      const pageHeightMm = pxToMm(pageHeight)
      
      // Configurar formato da página (usar format personalizado)
      const format: [number, number] = [pageWidthMm, pageHeightMm]
      const doc = new jsPDF({
        unit: 'mm',
        format: format,
        orientation: pageWidthMm > pageHeightMm ? 'landscape' : 'portrait'
      })
      
      // Adicionar elementos
      console.log('Elementos a processar:', currentPage.elements.length)
      
      for (let i = 0; i < currentPage.elements.length; i++) {
        const element = currentPage.elements[i] as any
        const bounds = element.bounds || {}
        const transform = element.transform || {}
        
        console.log(`Processando elemento ${i + 1}:`, {
          type: element.type,
          bounds,
          element: { ...element, bounds: undefined, transform: undefined }
        })
        
        const x = pxToMm(bounds.x || 0)
        const y = pxToMm(bounds.y || 0)
        const width = pxToMm(bounds.width || 100)
        const height = pxToMm(bounds.height || 20)
        
        console.log(`Posições convertidas:`, { x, y, width, height })
        
        // Aplicar opacidade se necessário (simplificado)
        if (transform.opacity && transform.opacity !== 1) {
          // jsPDF não suporta opacity de forma simples, pular por enquanto
        }
        
        switch (element.type) {
          case 'text':
            // Configurar texto
            doc.setFont(element.fontFamily || 'helvetica', element.fontWeight || 'normal')
            doc.setFontSize(element.fontSize || 14)
            
            if (element.color) {
              const color = element.color.replace('#', '')
              const r = parseInt(color.substr(0, 2), 16)
              const g = parseInt(color.substr(2, 2), 16)
              const b = parseInt(color.substr(4, 2), 16)
              doc.setTextColor(r, g, b)
            } else {
              doc.setTextColor(0, 0, 0)
            }
            
            // Adicionar texto
            const textContent = element.content || 'Texto'
            
            // Calcular posição Y centralizada verticalmente
            const textY = y + height / 2
            
            doc.text(textContent, x, textY)
            break
            
          case 'rectangle':
            // Configurar retângulo
            if (element.fill) {
              const fillColor = element.fill.replace('#', '')
              const fillR = parseInt(fillColor.substr(0, 2), 16)
              const fillG = parseInt(fillColor.substr(2, 2), 16)
              const fillB = parseInt(fillColor.substr(4, 2), 16)
              doc.setFillColor(fillR, fillG, fillB)
            }
            
            if (element.stroke) {
              const strokeColor = element.stroke.replace('#', '')
              const strokeR = parseInt(strokeColor.substr(0, 2), 16)
              const strokeG = parseInt(strokeColor.substr(2, 2), 16)
              const strokeB = parseInt(strokeColor.substr(4, 2), 16)
              doc.setDrawColor(strokeR, strokeG, strokeB)
            }
            
            if (element.strokeWidth) {
              doc.setLineWidth(pxToMm(element.strokeWidth))
            }
            
            // Determinar estilo de preenchimento
            const fillStyle = element.fill ? (element.strokeWidth ? 'FD' : 'F') : (element.strokeWidth ? 'S' : 'S')
            doc.rect(x, y, width, height, fillStyle)
            break
            
          case 'line':
            // Configurar linha
            if (element.stroke) {
              const lineColor = element.stroke.replace('#', '')
              const lineR = parseInt(lineColor.substr(0, 2), 16)
              const lineG = parseInt(lineColor.substr(2, 2), 16)
              const lineB = parseInt(lineColor.substr(4, 2), 16)
              doc.setDrawColor(lineR, lineG, lineB)
            } else {
              doc.setDrawColor(0, 0, 0)
            }
            
            doc.setLineWidth(pxToMm(element.strokeWidth || 1))
            doc.line(x, y, x + width, y)
            break
            
          case 'image':
            try {
              if (element.src) {
                await doc.addImage(element.src, 'PNG', x, y, width, height)
              } else {
                // Desenhar placeholder para imagem
                doc.setDrawColor(200, 200, 200)
                doc.rect(x, y, width, height, 'S')
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text('Imagem', x + width/2, y + height/2, { align: 'center' })
              }
            } catch (error) {
              console.warn('Erro ao adicionar imagem:', error)
              // Desenhar placeholder
              doc.setDrawColor(200, 200, 200)
              doc.rect(x, y, width, height, 'S')
              doc.setFontSize(8)
              doc.setTextColor(150, 150, 150)
              doc.text('Erro na imagem', x + width/2, y + height/2, { align: 'center' })
            }
            break
            
          default:
            // Elemento não suportado - desenhar placeholder
            doc.setDrawColor(100, 100, 100)
            doc.setLineWidth(pxToMm(1))
            doc.rect(x, y, width, height, 'S')
            doc.setFontSize(6)
            doc.setTextColor(100, 100, 100)
            doc.text(`${element.type}`, x + 2, y + 8)
        }
        
        // Resetar opacidade (simplificado)
        if (transform.opacity && transform.opacity !== 1) {
          // Reset seria feito aqui se suportado
        }
      }
      
      // Gerar URL do PDF
      const pdfBlob = doc.output('blob')
      const url = URL.createObjectURL(pdfBlob)
      
      // Limpar URL anterior se existir
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      
      setPdfUrl(url)
      setNotification({ type: 'success', message: 'PDF gerado com sucesso!' })
      setTimeout(() => setNotification(null), 3000)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      setNotification({ type: 'error', message: 'Erro ao gerar PDF. Verifique os elementos.' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = () => {
    if (!currentPage) return
    
    // Reutilizar o PDF já gerado
    if (pdfUrl) {
      const a = document.createElement('a')
      a.href = pdfUrl
      a.download = `${currentPage.name?.replace(/\s+/g, '-') || 'layout'}.pdf`
      a.click()
    } else {
      // Se não há PDF gerado, gerar primeiro
      generatePDF().then(() => {
        setTimeout(() => {
          if (pdfUrl) {
            const a = document.createElement('a')
            a.href = pdfUrl
            a.download = `${currentPage.name?.replace(/\s+/g, '-') || 'layout'}.pdf`
            a.click()
          }
        }, 500)
      })
    }
  }

  const clearPreview = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }

  return (
    <div className={`d-flex flex-column h-100 bg-white ${className}`}>
      {/* Header */}
      <div className="bg-light border-bottom px-4 py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold text-dark">
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Preview PDF
          </h6>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={generatePDF}
              disabled={isGenerating || !currentPage?.elements?.length}
            >
              {isGenerating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Gerando...
                </>
              ) : (
                <>
                  <i className="bi bi-play-fill me-2"></i>
                  Gerar PDF
                </>
              )}
            </button>
            
            {pdfUrl && (
              <>
                <button
                  className="btn btn-success btn-sm"
                  onClick={downloadPDF}
                >
                  <i className="bi bi-download me-2"></i>
                  Download
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={clearPreview}
                >
                  <i className="bi bi-x me-2"></i>
                  Limpar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show m-3 mb-0`} role="alert">
          <i className={`bi bi-${notification.type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2`}></i>
          {notification.message}
        </div>
      )}

      {/* Content */}
      <div className="flex-grow-1 p-3">
        {!currentPage?.elements?.length ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center text-muted">
              <i className="bi bi-file-earmark-plus fs-1 mb-3 d-block"></i>
              <h5>Nenhum elemento para gerar PDF</h5>
              <p className="mb-0">Adicione elementos à página para visualizar o PDF</p>
            </div>
          </div>
        ) : !pdfUrl ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <i className="bi bi-file-earmark-pdf fs-1 text-primary mb-3 d-block"></i>
              <h5>Preview do PDF</h5>
              <p className="text-muted mb-3">
                Clique em "Gerar PDF" para visualizar como ficará o documento final
              </p>
              <div className="bg-light p-3 rounded">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  <strong>Elementos encontrados:</strong> {currentPage?.elements?.length || 0}
                </small>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-100">
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              className="w-100 h-100 border-0 rounded"
              title="PDF Preview"
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      {currentPage && (
        <div className="bg-light border-top px-4 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Página: {currentPage.name} | Elementos: {currentPage.elements?.length || 0}
            </small>
            <small className="text-muted">
              Dimensões: {currentPage.config?.width || 794}×{currentPage.config?.height || 1123}px
            </small>
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFPreview
