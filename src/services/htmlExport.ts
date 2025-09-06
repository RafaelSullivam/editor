import type { Layout, Element, TextElement, ImageElement, RectangleElement, TableElement, QRCodeElement, BarcodeElement, FieldElement, DataContext } from '../types'
import { convertUnits } from '../utils/helpers'

export interface HTMLExportOptions {
  data?: DataContext
  includeBackground?: boolean
  responsive?: boolean
  standalone?: boolean
}

export class HTMLExportService {
  private options: HTMLExportOptions

  constructor(options: HTMLExportOptions = {}) {
    this.options = options
  }

  exportLayout(layout: Layout): string {
    const pages = layout.pages.map((page, index) => this.renderPage(page, index)).join('\n')
    
    if (this.options.standalone) {
      return this.createStandaloneHTML(layout, pages)
    } else {
      return pages
    }
  }

  private createStandaloneHTML(layout: Layout, pagesHTML: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${layout.name}</title>
  <style>
    ${this.generateCSS()}
  </style>
</head>
<body>
  <div class="layout-container">
    ${pagesHTML}
  </div>
</body>
</html>`
  }

  private generateCSS(): string {
    return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .layout-container {
      max-width: 100%;
      margin: 0 auto;
    }
    
    .page {
      position: relative;
      background: white;
      margin: 0 auto 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .element {
      position: absolute;
      overflow: hidden;
    }
    
    .element-text {
      display: flex;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    
    .element-image img {
      width: 100%;
      height: 100%;
    }
    
    .element-rectangle {
      border: 1px solid transparent;
    }
    
    .element-table {
      overflow: auto;
    }
    
    .element-table table {
      width: 100%;
      height: 100%;
      border-collapse: collapse;
    }
    
    .element-table th,
    .element-table td {
      border: 1px solid #ddd;
      padding: 4px;
      text-align: left;
    }
    
    .element-qrcode,
    .element-barcode {
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 12px;
    }
    
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; margin: 0; page-break-after: always; }
      .page:last-child { page-break-after: auto; }
    }
    
    ${this.options.responsive ? `
    @media (max-width: 768px) {
      .page {
        transform: scale(0.8);
        transform-origin: top center;
        margin-bottom: 40px;
      }
    }
    
    @media (max-width: 480px) {
      .page {
        transform: scale(0.6);
        margin-bottom: 60px;
      }
    }
    ` : ''}
    `
  }

  private renderPage(page: any, pageIndex: number): string {
    const widthPx = convertUnits(page.config.width, 'mm', 'px', 96)
    const heightPx = convertUnits(page.config.height, 'mm', 'px', 96)
    
    const elements = page.elements
      .filter((el: Element) => el.visible !== false)
      .sort((a: Element, b: Element) => (a.zIndex || 0) - (b.zIndex || 0))
      .map((element: Element) => this.renderElement(element))
      .join('\n')

    return `
    <div class="page" id="page-${pageIndex}" style="width: ${widthPx}px; height: ${heightPx}px;">
      ${elements}
    </div>`
  }

  private renderElement(element: Element): string {
    const bounds = {
      x: convertUnits(element.bounds.x, 'mm', 'px', 96),
      y: convertUnits(element.bounds.y, 'mm', 'px', 96),
      width: convertUnits(element.bounds.width, 'mm', 'px', 96),
      height: convertUnits(element.bounds.height, 'mm', 'px', 96),
    }

    const transform = element.transform || { opacity: 1, rotation: 0, scaleX: 1, scaleY: 1 }

    const baseStyle = `
      left: ${bounds.x}px;
      top: ${bounds.y}px;
      width: ${bounds.width}px;
      height: ${bounds.height}px;
      opacity: ${transform.opacity};
      transform: rotate(${transform.rotation}deg) scale(${transform.scaleX}, ${transform.scaleY});
      transform-origin: center;
    `

    switch (element.type) {
      case 'text':
        return this.renderTextElement(element as TextElement, baseStyle)
      case 'image':
        return this.renderImageElement(element as ImageElement, baseStyle)
      case 'rectangle':
        return this.renderRectangleElement(element as RectangleElement, baseStyle)
      case 'table':
        return this.renderTableElement(element as TableElement, baseStyle)
      case 'qrcode':
        return this.renderQRCodeElement(element as QRCodeElement, baseStyle)
      case 'barcode':
        return this.renderBarcodeElement(element as BarcodeElement, baseStyle)
      case 'field':
        return this.renderFieldElement(element as FieldElement, baseStyle)
      default:
        return `<div class="element" style="${baseStyle}"></div>`
    }
  }

  private renderTextElement(element: TextElement, baseStyle: string): string {
    let content = element.content
    if (this.options.data) {
      content = this.replaceDataFields(content, this.options.data)
    }

    const textStyle = `
      ${baseStyle}
      font-family: ${element.fontFamily || 'Arial'};
      font-size: ${element.fontSize || 12}px;
      font-weight: ${element.fontWeight || 'normal'};
      font-style: ${element.fontStyle || 'normal'};
      color: ${element.color || '#000000'};
      text-align: ${element.textAlign || 'left'};
      align-items: ${element.verticalAlign === 'middle' ? 'center' : 
                   element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start'};
      line-height: ${element.lineHeight || 1.2};
      letter-spacing: ${element.letterSpacing || 0}px;
      text-decoration: ${element.textDecoration || 'none'};
      word-wrap: ${element.wordWrap ? 'break-word' : 'normal'};
    `

    return `<div class="element element-text" style="${textStyle}">${this.escapeHtml(content)}</div>`
  }

  private renderImageElement(element: ImageElement, baseStyle: string): string {
    const imageStyle = `
      ${baseStyle}
    `

    if (element.src) {
      const imgStyle = `
        object-fit: ${element.fit || 'contain'};
        width: 100%;
        height: 100%;
      `
      
      return `<div class="element element-image" style="${imageStyle}">
        <img src="${element.src}" alt="${element.alt || ''}" style="${imgStyle}" />
      </div>`
    } else {
      return `<div class="element element-image" style="${imageStyle}">
        <div style="width: 100%; height: 100%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666;">
          Imagem
        </div>
      </div>`
    }
  }

  private renderRectangleElement(element: RectangleElement, baseStyle: string): string {
    const rectStyle = `
      ${baseStyle}
      background-color: ${element.fill || 'transparent'};
      border: ${element.strokeWidth || 1}px solid ${element.stroke || '#000000'};
      border-radius: ${element.border?.radius || 0}px;
    `

    return `<div class="element element-rectangle" style="${rectStyle}"></div>`
  }

  private renderTableElement(element: TableElement, baseStyle: string): string {
    const tableStyle = `${baseStyle}`
    
    let tableHTML = '<table>'
    
    // Header
    if (element.display.showHeaders && element.columns.length > 0) {
      const headerStyle = element.globalStyle || { 
        fontFamily: 'Arial',
        fontSize: 12, 
        color: '#000000',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderStyle: 'solid'
      }
      tableHTML += `<thead><tr style="
        background-color: #f5f5f5;
        font-size: ${headerStyle.fontSize}px;
        font-weight: bold;
        color: ${headerStyle.color};
        height: 30px;
      ">`
      
      element.columns.forEach(col => {
        tableHTML += `<th style="text-align: left">${this.escapeHtml(col.headerText || col.name)}</th>`
      })
      
      tableHTML += '</tr></thead>'
    }
    
    // Body - sample data or from data context
    tableHTML += '<tbody>'
    const globalStyle = element.globalStyle || { 
      fontFamily: 'Arial',
      fontSize: 12, 
      color: '#000000',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderStyle: 'solid'
    }
    
    // Generate sample rows if no data
    const rows = this.getTableData(element, this.options.data || {})
    rows.forEach((row, index) => {
      const bgColor = element.display.alternateRowColors && index % 2 === 1 ? 
        (element.display.zebra?.oddColor || '#f9f9f9') : 
        (element.display.zebra?.evenColor || 'transparent')
      
      tableHTML += `<tr style="
        background-color: ${bgColor};
        font-size: ${globalStyle.fontSize}px;
        color: ${globalStyle.color};
        height: 25px;
      ">`
      
      row.forEach((cell) => {
        tableHTML += `<td style="text-align: left">${this.escapeHtml(cell)}</td>`
      })
      
      tableHTML += '</tr>'
    })
    
    tableHTML += '</tbody></table>'

    return `<div class="element element-table" style="${tableStyle}">${tableHTML}</div>`
  }

  private renderQRCodeElement(element: QRCodeElement, baseStyle: string): string {
    let content = element.content
    if (this.options.data) {
      content = this.replaceDataFields(content, this.options.data)
    }

    // For HTML export, we'll show a placeholder
    // In a real implementation, you might generate an actual QR code image
    return `<div class="element element-qrcode" style="${baseStyle}">
      QR: ${this.escapeHtml(content)}
    </div>`
  }

  private renderBarcodeElement(element: BarcodeElement, baseStyle: string): string {
    let content = element.content
    if (this.options.data) {
      content = this.replaceDataFields(content, this.options.data)
    }

    return `<div class="element element-barcode" style="${baseStyle}">
      ${element.format || 'CODE128'}: ${this.escapeHtml(content)}
    </div>`
  }

  private renderFieldElement(element: FieldElement, baseStyle: string): string {
    let content = element.defaultValue || `{{${element.fieldPath}}}`
    
    if (this.options.data) {
      content = this.getFieldValue(element.fieldPath, this.options.data) || element.defaultValue || ''
    }

    const fieldStyle = `
      ${baseStyle}
      font-family: ${element.fontFamily || 'Arial'};
      font-size: ${element.fontSize || 12}px;
      font-weight: ${element.fontWeight || 'normal'};
      font-style: ${element.fontStyle || 'normal'};
      color: ${element.color || '#000000'};
      text-align: ${element.textAlign || 'left'};
      display: flex;
      align-items: center;
    `

    return `<div class="element element-field" style="${fieldStyle}">${this.escapeHtml(content)}</div>`
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
    const rows: string[][] = []
    
    // For demonstration, create sample rows
    for (let i = 0; i < 3; i++) {
      const row = element.columns.map(col => {
        if (col.dataField && this.options.data) {
          return this.getFieldValue(col.dataField, data) || `Item ${i + 1}`
        }
        return `Valor ${i + 1}`
      })
      rows.push(row)
    }
    
    return rows
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Export function for easy use
export const renderToHTML = (layout: Layout, options: HTMLExportOptions = {}): string => {
  const service = new HTMLExportService(options)
  return service.exportLayout(layout)
}
