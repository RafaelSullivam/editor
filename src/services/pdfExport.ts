import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import type { Layout, Element, TextElement, ImageElement, RectangleElement, TableElement, QRCodeElement, BarcodeElement, FieldElement, DataContext } from '../types'
import { convertUnits } from '../utils/helpers'

export interface PDFExportOptions {
  data?: DataContext
  includeBackground?: boolean
  quality?: 'low' | 'medium' | 'high'
}

export class PDFExportService {
  private pdf: jsPDF
  private options: PDFExportOptions

  constructor(options: PDFExportOptions = {}) {
    this.options = options
    this.pdf = new jsPDF()
  }

  async exportLayout(layout: Layout): Promise<Blob> {
    // Reset PDF
    this.pdf = new jsPDF()

    for (let i = 0; i < layout.pages.length; i++) {
      const page = layout.pages[i]
      
      if (i > 0) {
        this.pdf.addPage()
      }

      // Set page size
      const widthPt = convertUnits(page.config.width, 'mm', 'pt')
      const heightPt = convertUnits(page.config.height, 'mm', 'pt')
      this.pdf.internal.pageSize.width = widthPt
      this.pdf.internal.pageSize.height = heightPt

      // Render elements sorted by z-index
      const sortedElements = [...page.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      
      for (const element of sortedElements) {
        if (element.visible !== false) {
          await this.renderElement(element)
        }
      }
    }

    return this.pdf.output('blob')
  }

  private async renderElement(element: Element): Promise<void> {
    const bounds = {
      x: convertUnits(element.bounds.x, 'mm', 'pt'),
      y: convertUnits(element.bounds.y, 'mm', 'pt'),
      width: convertUnits(element.bounds.width, 'mm', 'pt'),
      height: convertUnits(element.bounds.height, 'mm', 'pt'),
    }

    const transform = element.transform || { opacity: 1, rotation: 0, scaleX: 1, scaleY: 1 }

    // Apply transformations
    if (transform.rotation || transform.scaleX !== 1 || transform.scaleY !== 1) {
      this.pdf.saveGraphicsState()
      // Simple transformation - jsPDF has limited transformation support
      // For production, you'd want more sophisticated transformation handling
    }

    // Set opacity
    if (transform.opacity && transform.opacity < 1) {
      // Note: opacity support varies by jsPDF version
      // this.pdf.setGState(this.pdf.GState({ opacity: transform.opacity }))
    }

    switch (element.type) {
      case 'text':
        await this.renderTextElement(element as TextElement, bounds)
        break
      case 'image':
        await this.renderImageElement(element as ImageElement, bounds)
        break
      case 'rectangle':
        await this.renderRectangleElement(element as RectangleElement, bounds)
        break
      case 'table':
        await this.renderTableElement(element as TableElement, bounds)
        break
      case 'qrcode':
        await this.renderQRCodeElement(element as QRCodeElement, bounds)
        break
      case 'barcode':
        await this.renderBarcodeElement(element as BarcodeElement, bounds)
        break
      case 'field':
        await this.renderFieldElement(element as FieldElement, bounds)
        break
    }

    // Restore graphics state if transformations were applied
    if (transform.rotation || transform.scaleX !== 1 || transform.scaleY !== 1 || (transform.opacity && transform.opacity < 1)) {
      this.pdf.restoreGraphicsState()
    }
  }

  private async renderTextElement(element: TextElement, bounds: any): Promise<void> {
    // Get content (with data replacement if needed)
    let content = element.content
    if (this.options.data) {
      content = this.replaceDataFields(content, this.options.data)
    }

    // Set font
    this.pdf.setFont(element.fontFamily || 'helvetica', element.fontStyle || 'normal', element.fontWeight || 'normal')
    this.pdf.setFontSize(element.fontSize || 12)
    this.pdf.setTextColor(element.color || '#000000')

    // Calculate line height
    const lineHeight = this.pdf.getLineHeight() * (element.lineHeight || 1.2)

    // Split text into lines if word wrap is enabled
    let lines: string[]
    if (element.wordWrap) {
      lines = this.pdf.splitTextToSize(content, bounds.width)
    } else {
      lines = content.split('\n')
    }

    // Calculate vertical alignment offset
    let yOffset = 0
    const totalTextHeight = lines.length * lineHeight
    
    switch (element.verticalAlign) {
      case 'middle':
        yOffset = (bounds.height - totalTextHeight) / 2
        break
      case 'bottom':
        yOffset = bounds.height - totalTextHeight
        break
    }

    // Render each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const y = bounds.y + yOffset + (i + 1) * lineHeight

      // Calculate horizontal alignment
      let x = bounds.x
      switch (element.textAlign) {
        case 'center':
          x = bounds.x + bounds.width / 2
          break
        case 'right':
          x = bounds.x + bounds.width
          break
      }

      this.pdf.text(line, x, y, { align: element.textAlign || 'left' })
    }
  }

  private async renderImageElement(element: ImageElement, bounds: any): Promise<void> {
    if (!element.src) return

    try {
      // For now, we'll just draw a placeholder
      // In a real implementation, you'd load the image and add it to the PDF
      this.pdf.setDrawColor(0, 0, 0)
      this.pdf.setLineWidth(0.5)
      this.pdf.rect(bounds.x, bounds.y, bounds.width, bounds.height)
      
      // Add text placeholder
      this.pdf.setFontSize(10)
      this.pdf.text('Imagem', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { align: 'center' })
    } catch (error) {
      console.error('Error rendering image:', error)
    }
  }

  private async renderRectangleElement(element: RectangleElement, bounds: any): Promise<void> {
    // Set fill color
    if (element.fill && element.fill !== 'transparent') {
      this.pdf.setFillColor(element.fill)
    }

    // Set stroke color and width
    if (element.stroke) {
      this.pdf.setDrawColor(element.stroke)
      this.pdf.setLineWidth(element.strokeWidth || 1)
    }

    // Determine draw style
    let style = 'S' // stroke only
    if (element.fill && element.fill !== 'transparent') {
      style = element.stroke ? 'FD' : 'F' // fill + stroke or fill only
    }

    this.pdf.rect(bounds.x, bounds.y, bounds.width, bounds.height, style)
  }

  private async renderTableElement(element: TableElement, bounds: any): Promise<void> {
    if (!element.columns.length) return

    // Prepare table data
    const headers = element.columns.map(col => col.headerText || col.name)
    const data: string[][] = []

    // If we have data context, try to populate table
    if (this.options.data && element.columns[0].dataField) {
      const tableData = this.getTableData(element, this.options.data)
      data.push(...tableData)
    } else {
      // Add sample data
      data.push(element.columns.map(() => 'Dados'))
    }

    // Configure autoTable
    autoTable(this.pdf, {
      head: element.display.showHeaders ? [headers] : undefined,
      body: data,
      startY: bounds.y,
      margin: { left: bounds.x },
      tableWidth: bounds.width,
      styles: {
        fontSize: element.globalStyle?.fontSize || 12,
        textColor: element.globalStyle?.color || '#000000',
        cellPadding: 2,
      },
      headStyles: {
        fontSize: element.globalStyle?.fontSize || 12,
        textColor: element.globalStyle?.color || '#000000',
        fillColor: '#f5f5f5',
        fontStyle: 'bold',
      },
      columnStyles: element.columns.reduce((acc, col, index) => {
        acc[index] = {
          cellWidth: col.width,
          halign: 'left',
        }
        return acc
      }, {} as any),
      showHead: element.display.showHeaders,
      theme: 'grid',
    })
  }

  private async renderQRCodeElement(element: QRCodeElement, bounds: any): Promise<void> {
    try {
      let content = element.content
      if (this.options.data) {
        content = this.replaceDataFields(content, this.options.data)
      }

      const qrDataURL = await QRCode.toDataURL(content, {
        errorCorrectionLevel: element.errorCorrectionLevel || 'M',
        margin: element.margin || 4,
        color: {
          dark: element.color || '#000000',
          light: element.backgroundColor || '#ffffff',
        },
      })

      this.pdf.addImage(qrDataURL, 'PNG', bounds.x, bounds.y, bounds.width, bounds.height)
    } catch (error) {
      console.error('Error generating QR code:', error)
      // Fallback: draw a rectangle with text
      this.pdf.rect(bounds.x, bounds.y, bounds.width, bounds.height)
      this.pdf.text('QR Code', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { align: 'center' })
    }
  }

  private async renderBarcodeElement(element: BarcodeElement, bounds: any): Promise<void> {
    // For now, just render a placeholder
    // In a real implementation, you'd use a barcode library
    this.pdf.setDrawColor(0, 0, 0)
    this.pdf.setLineWidth(0.5)
    this.pdf.rect(bounds.x, bounds.y, bounds.width, bounds.height)
    
    this.pdf.setFontSize(10)
    this.pdf.text('Código de Barras', bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, { align: 'center' })
    
    if (element.displayValue) {
      this.pdf.text(element.content, bounds.x + bounds.width / 2, bounds.y + bounds.height + 10, { align: 'center' })
    }
  }

  private async renderFieldElement(element: FieldElement, bounds: any): Promise<void> {
    let content = element.defaultValue || `{{${element.fieldPath}}}`
    
    if (this.options.data) {
      content = this.getFieldValue(element.fieldPath, this.options.data) || element.defaultValue || ''
    }

    // Render as text
    this.pdf.setFont(element.fontFamily || 'helvetica', element.fontStyle || 'normal', element.fontWeight || 'normal')
    this.pdf.setFontSize(element.fontSize || 12)
    this.pdf.setTextColor(element.color || '#000000')

    this.pdf.text(content, bounds.x, bounds.y + bounds.height / 2, { align: element.textAlign || 'left' })
  }

  private replaceDataFields(text: string, data: DataContext): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, fieldPath) => {
      return this.getFieldValue(fieldPath.trim(), data) || match
    })
  }

  private getFieldValue(fieldPath: string, data: DataContext): string {
    const parts = fieldPath.split('.')
    let value: any = data
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part]
      } else {
        return ''
      }
    }
    
    return String(value || '')
  }

  private getTableData(element: TableElement, data: DataContext): string[][] {
    // This is a simplified implementation
    // In a real app, you'd have more sophisticated data binding
    const rows: string[][] = []
    
    // For demonstration, create a few sample rows
    for (let i = 0; i < 5; i++) {
      const row = element.columns.map(col => {
        if (col.dataField) {
          return this.getFieldValue(col.dataField, data) || `Item ${i + 1}`
        }
        return `Valor ${i + 1}`
      })
      rows.push(row)
    }
    
    return rows
  }
}

// Export function for easy use
export const renderToJsPDF = async (layout: Layout, data?: DataContext): Promise<jsPDF> => {
  const service = new PDFExportService({ data })
  await service.exportLayout(layout)
  
  // Return the PDF instance
  return service['pdf'] // Access private property for this demo
}
