import React, { useState, useRef, useEffect } from 'react'
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

  // Debug: Monitorar mudanças na currentPage
  useEffect(() => {
    console.log('🔍 PDFPreview - currentPage mudou:', {
      hasCurrentPage: !!currentPage,
      pageId: currentPage?.id,
      elementsCount: currentPage?.elements?.length || 0,
      elements: currentPage?.elements || []
    })
  }, [currentPage])

  const generatePDF = async () => {
    if (!currentPage || !currentPage.elements.length) {
      setNotification({ type: 'error', message: 'Nenhum elemento encontrado para gerar PDF' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setIsGenerating(true)
    
    try {
      // **CORREÇÃO CRÍTICA**: Verificar se config já está em mm ou px
      const pageWidth = currentPage.config?.width || 210 // mm (A4)
      const pageHeight = currentPage.config?.height || 297 // mm (A4)
      
      console.log('📏 Config da página original:', currentPage.config)
      console.log('📏 Dimensões detectadas:', { pageWidth, pageHeight })
      
      // **PROBLEMA IDENTIFICADO**: Não converter se já estiver em mm
      // As dimensões do config são muito pequenas, indicando que já estão em mm
      let pageWidthMm = pageWidth
      let pageHeightMm = pageHeight
      
      // Se as dimensões forem muito grandes (>500), provavelmente estão em pixels
      if (pageWidth > 500 || pageHeight > 500) {
        console.log('📏 Dimensões grandes detectadas, aplicando conversão px->mm')
        const pxToMm = (px: number) => px * 0.2646
        pageWidthMm = pxToMm(pageWidth)
        pageHeightMm = pxToMm(pageHeight)
      } else {
        console.log('📏 Dimensões pequenas detectadas, usando como mm direto')
      }
      
      console.log('📏 Dimensões finais da página (mm):', { pageWidthMm, pageHeightMm })
      
      // Configurar formato da página (usar format personalizado)
      const format: [number, number] = [pageWidthMm, pageHeightMm]
      const doc = new jsPDF({
        unit: 'mm',
        format: format,
        orientation: pageWidthMm > pageHeightMm ? 'landscape' : 'portrait'
      })
      
      console.log('=== DEBUG PDF GENERATION ===')
      console.log('Elementos a processar:', currentPage.elements.length)
      console.log('Página config:', currentPage.config)
      
      if (currentPage.elements.length === 0) {
        console.error('❌ PROBLEMA: Nenhum elemento encontrado na página!')
        console.log('CurrentPage completa:', currentPage)
        setNotification({ type: 'error', message: 'Nenhum elemento encontrado para gerar PDF' })
        setTimeout(() => setNotification(null), 3000)
        return
      }
      
      // **DEBUG VISUAL**: Adicionar marca d'água de debug - REMOVIDO
      // doc.setFontSize(8)
      // doc.setTextColor(200, 200, 200)  
      // doc.text(`DEBUG: ${currentPage.elements.length} elementos`, 10, 10)
      
      for (let i = 0; i < currentPage.elements.length; i++) {
        const element = currentPage.elements[i] as any
        const bounds = element.bounds || {}
        const transform = element.transform || {}
        
        console.log(`\n--- Elemento ${i + 1} ---`)
        console.log('Tipo:', element.type)
        console.log('Bounds originais:', bounds)
        
        // **DEBUG CSS**: Verificar propriedades principais
        if (element.type === 'text') {
          console.log('Text - fontSize:', element.fontSize, 'color:', element.color, 'content:', element.content)
        }
        if (element.type === 'rectangle') {
          console.log('Rectangle - fill:', element.fill, 'stroke:', element.stroke, 'strokeWidth:', element.strokeWidth)
        }
        
        // Verificar se bounds tem as propriedades corretas
        if (!bounds.x && bounds.x !== 0) {
          console.error('ERRO: bounds.x não definido!', bounds)
        }
        if (!bounds.y && bounds.y !== 0) {
          console.error('ERRO: bounds.y não definido!', bounds)
        }
        if (!bounds.width) {
          console.error('ERRO: bounds.width não definido!', bounds)
        }
        if (!bounds.height) {
          console.error('ERRO: bounds.height não definido!', bounds)
        }
        
        // **CORREÇÃO CRÍTICA**: As coordenadas já estão em mm no store!
        // Não devemos aplicar pxToMm pois causaria conversão dupla
        let x = bounds.x || 0
        let y = bounds.y || 0  
        let width = bounds.width || 100
        let height = bounds.height || 20
        
        // **CORREÇÃO: Garantir dimensões mínimas visíveis**
        const minWidth = 5  // 5mm mínimo
        const minHeight = 5 // 5mm mínimo
        
        if (width < minWidth) {
          console.warn(`⚠️ Width muito pequeno (${width}mm), ajustando para ${minWidth}mm`)
          width = minWidth
        }
        if (height < minHeight) {
          console.warn(`⚠️ Height muito pequeno (${height}mm), ajustando para ${minHeight}mm`)
          height = minHeight
        }
        
        console.log('Coordenadas finais (já em mm):', { x, y, width, height })
        console.log('Verificando se coordenadas fazem sentido...')
        
        if (x < 0 || y < 0) {
          console.warn('Coordenadas negativas detectadas:', { x, y })
        }
        if (x > pageWidthMm || y > pageHeightMm) {
          console.warn('Elemento fora da página:', { x, y, pageWidthMm, pageHeightMm })
        }
        
        // Aplicar opacidade se necessário (simplificado)
        if (transform.opacity && transform.opacity !== 1) {
          // jsPDF não suporta opacity de forma simples, pular por enquanto
        }
        
        switch (element.type) {
          case 'text':
            console.log('📝 Processando elemento TEXT')
            
            // **PROBLEMA IDENTIFICADO**: Verificar se as propriedades CSS estão presentes
            console.log('🔍 Verificando propriedades de texto:')
            console.log('fontSize:', element.fontSize, '(padrão: 12)')
            console.log('fontFamily:', element.fontFamily, '(padrão: Arial)')
            console.log('fontWeight:', element.fontWeight, '(padrão: normal)')
            console.log('color:', element.color, '(padrão: #000000)')
            console.log('content:', element.content, '(padrão: Texto)')
            
            // Configurar texto com valores garantidos
            const fontSize = element.fontSize || 12
            const fontFamily = element.fontFamily || 'helvetica'
            const fontWeight = element.fontWeight || 'normal'
            
            doc.setFont(fontFamily, fontWeight)
            doc.setFontSize(fontSize)
            console.log('✅ Fonte configurada:', fontFamily, fontWeight, fontSize)
            
            if (element.color) {
              const color = element.color.replace('#', '')
              const r = parseInt(color.substr(0, 2), 16)
              const g = parseInt(color.substr(2, 2), 16)
              const b = parseInt(color.substr(4, 2), 16)
              doc.setTextColor(r, g, b)
              console.log('✅ Cor do texto aplicada:', element.color, '->', { r, g, b })
            } else {
              doc.setTextColor(0, 0, 0)
              console.log('✅ Cor padrão aplicada: preto')
            }
            
            // Adicionar texto
            const textContent = element.content || 'Texto'
            console.log('📝 Adicionando texto:', textContent, 'na posição:', { x, y })
            
            // Calcular posição Y centralizada verticalmente
            const textY = y + height / 2
            
            doc.text(textContent, x, textY)
            console.log('✅ Texto adicionado com sucesso!')
            break
            
          case 'rectangle':
            console.log('🔲 Processando elemento RECTANGLE')
            
            // **PROBLEMA IDENTIFICADO**: Verificar propriedades de retângulo
            console.log('🔍 Verificando propriedades de retângulo:')
            console.log('fill:', element.fill, '(cor de fundo)')
            console.log('stroke:', element.stroke, '(cor da borda)')
            console.log('strokeWidth:', element.strokeWidth, '(espessura da borda)')
            console.log('backgroundColor:', element.backgroundColor, '(alternativo)')
            console.log('dimensões finais:', { x, y, width, height })
            
            // **DEBUG VISUAL**: Adicionar informações no PDF para debug
            if (width < 10 || height < 10) {
              console.warn('🚨 ELEMENTO MUITO PEQUENO! Pode ser invisível no PDF')
            }
            
            // Configurar retângulo
            if (element.fill) {
              const fillColor = element.fill.replace('#', '')
              const fillR = parseInt(fillColor.substr(0, 2), 16)
              const fillG = parseInt(fillColor.substr(2, 2), 16)
              const fillB = parseInt(fillColor.substr(4, 2), 16)
              doc.setFillColor(fillR, fillG, fillB)
              console.log('✅ Cor de preenchimento aplicada:', element.fill, '->', { fillR, fillG, fillB })
            }
            
            if (element.stroke) {
              const strokeColor = element.stroke.replace('#', '')
              const strokeR = parseInt(strokeColor.substr(0, 2), 16)
              const strokeG = parseInt(strokeColor.substr(2, 2), 16)
              const strokeB = parseInt(strokeColor.substr(4, 2), 16)
              doc.setDrawColor(strokeR, strokeG, strokeB)
            }
            
            if (element.strokeWidth) {
              // Converter strokeWidth para escala apropriada (reduzir espessura)
              const strokeWidthMm = Math.max(0.1, (element.strokeWidth || 1) * 0.3)
              doc.setLineWidth(strokeWidthMm)
              console.log('✅ StrokeWidth aplicado:', element.strokeWidth, '->', strokeWidthMm, 'mm')
            }
            
            // Determinar estilo de preenchimento
            const fillStyle = element.fill ? (element.strokeWidth ? 'FD' : 'F') : (element.strokeWidth ? 'S' : 'S')
            console.log('🔲 Desenhando retângulo:', { x, y, width, height, fillStyle })
            doc.rect(x, y, width, height, fillStyle)
            
            // **DEBUG VISUAL**: Texto de debug removido para produção
            // doc.setFontSize(6)
            // doc.setTextColor(255, 0, 0)
            // doc.text(`R${i+1}`, x + 1, y + 3)
            
            console.log('✅ Retângulo adicionado com sucesso!')
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
            
            // strokeWidth para linhas - reduzir espessura  
            const lineWidthMm = Math.max(0.1, (element.strokeWidth || 1) * 0.3)
            doc.setLineWidth(lineWidthMm)
            console.log('Line strokeWidth aplicado:', element.strokeWidth, '->', lineWidthMm, 'mm')
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
            doc.setLineWidth(1) // 1mm
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
      
      console.log('=== FINALIZANDO PDF ===')
      console.log('Total de elementos processados:', currentPage.elements.length)
      console.log('Dimensões da página PDF (mm):', { pageWidthMm, pageHeightMm })
      
      // Gerar URL do PDF
      const pdfBlob = doc.output('blob')
      console.log('PDF blob gerado:', pdfBlob.size, 'bytes')
      
      const url = URL.createObjectURL(pdfBlob)
      console.log('PDF URL criada:', url)
      
      // Limpar URL anterior se existir
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      
      setPdfUrl(url)
      setNotification({ type: 'success', message: 'PDF gerado com sucesso!' })
      setTimeout(() => setNotification(null), 3000)
      console.log('=== PDF GERADO COM SUCESSO ===')
      
    } catch (error) {
      console.error('=== ERRO AO GERAR PDF ===', error)
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
            
            {/* Botão de Teste para Debug */}
            <button
              className="btn btn-warning btn-sm"
              onClick={() => {
                console.log('🧪 TESTE MANUAL - Estado da Store:')
                console.log('currentPage:', currentPage)
                console.log('elementos:', currentPage?.elements)
                console.log('total elementos:', currentPage?.elements?.length || 0)
              }}
            >
              <i className="bi bi-bug me-2"></i>
              Debug
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
