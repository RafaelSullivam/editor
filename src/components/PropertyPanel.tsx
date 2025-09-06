import React, { useState, useEffect } from 'react'
import { useEditorStore } from '../store/editor'

// Estilos para scroll customizado
const scrollbarStyles = `
  .custom-scroll::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`

interface PropertyPanelProps {
  className?: string
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ className = '' }) => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Injetar estilos personalizados para scroll
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = scrollbarStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const {
    currentPage,
    selectedElementIds,
    updateElement,
    deleteElement,
    duplicateElement,
  } = useEditorStore()

  const selectedElements = currentPage?.elements?.filter(el => 
    selectedElementIds.includes(el.id)
  ) || []

  const selectedElement = selectedElements[0]

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedElement) return

    // Para propriedades de transformação
    if (['rotation', 'opacity', 'scaleX', 'scaleY'].includes(property)) {
      updateElement(selectedElement.id, {
        ...selectedElement,
        transform: {
          rotation: selectedElement.transform?.rotation || 0,
          scaleX: selectedElement.transform?.scaleX || 1,
          scaleY: selectedElement.transform?.scaleY || 1,
          opacity: selectedElement.transform?.opacity || 1,
          [property]: value
        }
      })
    }
    // Para propriedades de bounds (x, y, width, height)
    else if (['x', 'y', 'width', 'height'].includes(property)) {
      updateElement(selectedElement.id, {
        ...selectedElement,
        bounds: {
          x: selectedElement.bounds?.x || 0,
          y: selectedElement.bounds?.y || 0,
          width: selectedElement.bounds?.width || 100,
          height: selectedElement.bounds?.height || 20,
          [property]: value
        }
      })
    }
    // Para outras propriedades do elemento
    else {
      updateElement(selectedElement.id, {
        ...selectedElement,
        [property]: value
      })
    }
  }

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return 'bi-type'
      case 'rectangle': return 'bi-square'
      case 'line': return 'bi-dash'
      case 'image': return 'bi-image'
      case 'table': return 'bi-table'
      default: return 'bi-square'
    }
  }

  const handleDeleteElement = () => {
    if (selectedElement) {
      deleteElement(selectedElement.id)
      setNotification({ type: 'success', message: 'Elemento excluído!' })
      setTimeout(() => setNotification(null), 2000)
    }
  }

  const handleDuplicateElement = () => {
    if (selectedElement) {
      duplicateElement(selectedElement.id)
      setNotification({ type: 'success', message: 'Elemento duplicado!' })
      setTimeout(() => setNotification(null), 2000)
    }
  }

  const generateCompleteProject = () => {
    if (!currentPage) return { html: '', css: '' }
    
    // Gerar HTML completo
    let html = `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentPage.name || 'Projeto Editor'}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-container">
`

    // Adicionar elementos
    currentPage.elements.forEach((element: any) => {
      switch (element.type) {
        case 'text':
          html += `    <div class="element element-${element.id}" data-type="text">
      ${element.content || 'Texto'}
    </div>
`
          break
          
        case 'rectangle':
          html += `    <div class="element element-${element.id}" data-type="rectangle"></div>
`
          break
          
        case 'line':
          html += `    <div class="element element-${element.id}" data-type="line"></div>
`
          break
          
        case 'image':
          html += `    <img class="element element-${element.id}" data-type="image" src="${element.src || ''}" alt="${element.alt || ''}" />
`
          break
          
        default:
          html += `    <div class="element element-${element.id}" data-type="${element.type}">
      <!-- Elemento customizado: ${element.type} -->
    </div>
`
      }
    })

    html += `  </div>
</body>
</html>`

    // Gerar CSS completo
    let css = `/* Projeto gerado pelo Editor de Layouts */
/* ${new Date().toLocaleDateString('pt-BR')} */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}

.page-container {
  position: relative;
  width: ${currentPage.config?.width || 794}px;
  height: ${currentPage.config?.height || 1123}px;
  background: white;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.element {
  position: absolute;
  box-sizing: border-box;
}

/* Estilos específicos por tipo */
.element[data-type="text"] {
  display: flex;
  align-items: center;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.element[data-type="rectangle"] {
  border: 1px solid #ddd;
}

.element[data-type="line"] {
  border-bottom: 1px solid #000;
  height: 1px !important;
}

.element[data-type="image"] {
  object-fit: contain;
}

/* Estilos individuais dos elementos */
`

    // Adicionar estilos específicos de cada elemento
    currentPage.elements.forEach((element: any) => {
      css += generateElementCSS(element) + '\n'
    })

    return { html, css }
  }

  const generateCompleteReactProject = () => {
    if (!currentPage) return ''
    
    let code = `import React from 'react'
import './styles.css'

interface ElementProps {
  className?: string
  style?: React.CSSProperties
}

const ${currentPage.name?.replace(/\s+/g, '') || 'Layout'}Component: React.FC = () => {
  return (
    <div className="page-container">
`

    // Adicionar elementos como componentes React
    currentPage.elements.forEach((element: any) => {
      const bounds = element.bounds || {}
      const transform = element.transform || {}
      
      switch (element.type) {
        case 'text':
          code += `      <div 
        className="element element-${element.id}" 
        data-type="text"
        style={{
          left: '${bounds.x || 0}px',
          top: '${bounds.y || 0}px',
          width: '${bounds.width || 100}px',
          height: '${bounds.height || 20}px',
          ${transform.rotation ? `transform: 'rotate(${transform.rotation}deg)',` : ''}
          ${transform.opacity !== undefined && transform.opacity !== 1 ? `opacity: ${transform.opacity},` : ''}
        }}
      >
        ${element.content || 'Texto'}
      </div>
`
          break
          
        case 'rectangle':
          code += `      <div 
        className="element element-${element.id}" 
        data-type="rectangle"
        style={{
          left: '${bounds.x || 0}px',
          top: '${bounds.y || 0}px',
          width: '${bounds.width || 100}px',
          height: '${bounds.height || 100}px',
          ${transform.rotation ? `transform: 'rotate(${transform.rotation}deg)',` : ''}
          ${transform.opacity !== undefined && transform.opacity !== 1 ? `opacity: ${transform.opacity},` : ''}
        }}
      />
`
          break
          
        case 'line':
          code += `      <div 
        className="element element-${element.id}" 
        data-type="line"
        style={{
          left: '${bounds.x || 0}px',
          top: '${bounds.y || 0}px',
          width: '${bounds.width || 100}px',
          height: '1px',
          ${transform.rotation ? `transform: 'rotate(${transform.rotation}deg)',` : ''}
          ${transform.opacity !== undefined && transform.opacity !== 1 ? `opacity: ${transform.opacity},` : ''}
        }}
      />
`
          break
          
        case 'image':
          code += `      <img 
        className="element element-${element.id}" 
        data-type="image"
        src="${element.src || ''}"
        alt="${element.alt || ''}"
        style={{
          left: '${bounds.x || 0}px',
          top: '${bounds.y || 0}px',
          width: '${bounds.width || 100}px',
          height: '${bounds.height || 100}px',
          ${transform.rotation ? `transform: 'rotate(${transform.rotation}deg)',` : ''}
          ${transform.opacity !== undefined && transform.opacity !== 1 ? `opacity: ${transform.opacity},` : ''}
        }}
      />
`
          break
          
        default:
          code += `      <div 
        className="element element-${element.id}" 
        data-type="${element.type}"
        style={{
          left: '${bounds.x || 0}px',
          top: '${bounds.y || 0}px',
          width: '${bounds.width || 100}px',
          height: '${bounds.height || 100}px',
          ${transform.rotation ? `transform: 'rotate(${transform.rotation}deg)',` : ''}
          ${transform.opacity !== undefined && transform.opacity !== 1 ? `opacity: ${transform.opacity},` : ''}
        }}
      >
        {/* Elemento customizado: ${element.type} */}
      </div>
`
      }
    })

    code += `    </div>
  )
}

export default ${currentPage.name?.replace(/\s+/g, '') || 'Layout'}Component`

    return code
  }

  const generateCompleteJsPDFProject = () => {
    if (!currentPage) return ''
    
    let code = `import jsPDF from 'jspdf'

// Função para gerar PDF do layout: ${currentPage.name || 'Layout'}
export const generate${currentPage.name?.replace(/\s+/g, '') || 'Layout'}PDF = () => {
  const doc = new jsPDF()
  
  // Configurar página
  const pageWidth = ${currentPage.config?.width || 794} // pixels
  const pageHeight = ${currentPage.config?.height || 1123} // pixels
  
  // Converter pixels para mm (assumindo 96 DPI)
  const pxToMm = (px: number) => px * 0.264583
  const pageWidthMm = pxToMm(pageWidth)
  const pageHeightMm = pxToMm(pageHeight)
  
  // Configurar formato da página
  doc.internal.pageSize.setWidth(pageWidthMm)
  doc.internal.pageSize.setHeight(pageHeightMm)
  
  // Adicionar elementos
`

    // Adicionar cada elemento
    currentPage.elements.forEach((element: any, index: number) => {
      const bounds = element.bounds || {}
      const transform = element.transform || {}
      
      code += `
  // Elemento ${index + 1}: ${element.type} - ${element.name || 'Sem nome'}
  {
    const x = pxToMm(${bounds.x || 0})
    const y = pxToMm(${bounds.y || 0})
    const width = pxToMm(${bounds.width || 100})
    const height = pxToMm(${bounds.height || 20})
    
`

      switch (element.type) {
        case 'text':
          code += `    // Configurar texto
    doc.setFont('${element.fontFamily || 'helvetica'}', '${element.fontWeight || 'normal'}')
    doc.setFontSize(${element.fontSize || 14})
    ${element.color ? `
    const color = '${element.color}'.replace('#', '')
    const r = parseInt(color.substr(0, 2), 16)
    const g = parseInt(color.substr(2, 2), 16)
    const b = parseInt(color.substr(4, 2), 16)
    doc.setTextColor(r, g, b)` : 'doc.setTextColor(0, 0, 0)'}
    
    // Adicionar texto
    doc.text('${(element.content || 'Texto').replace(/'/g, "\\'")}', x, y + height/2)
`
          break
          
        case 'rectangle':
          code += `    // Configurar retângulo
    ${element.fill ? `
    const fillColor = '${element.fill}'.replace('#', '')
    const fillR = parseInt(fillColor.substr(0, 2), 16)
    const fillG = parseInt(fillColor.substr(2, 2), 16)
    const fillB = parseInt(fillColor.substr(4, 2), 16)
    doc.setFillColor(fillR, fillG, fillB)` : ''}
    ${element.stroke ? `
    const strokeColor = '${element.stroke}'.replace('#', '')
    const strokeR = parseInt(strokeColor.substr(0, 2), 16)
    const strokeG = parseInt(strokeColor.substr(2, 2), 16)
    const strokeB = parseInt(strokeColor.substr(4, 2), 16)
    doc.setDrawColor(strokeR, strokeG, strokeB)` : ''}
    ${element.strokeWidth ? `doc.setLineWidth(${element.strokeWidth})` : ''}
    
    // Adicionar retângulo
    doc.rect(x, y, width, height, '${element.fill ? (element.strokeWidth ? 'FD' : 'F') : (element.strokeWidth ? 'S' : 'S')}')
`
          break
          
        case 'line':
          code += `    // Configurar linha
    ${element.stroke ? `
    const lineColor = '${element.stroke}'.replace('#', '')
    const lineR = parseInt(lineColor.substr(0, 2), 16)
    const lineG = parseInt(lineColor.substr(2, 2), 16)
    const lineB = parseInt(lineColor.substr(4, 2), 16)
    doc.setDrawColor(lineR, lineG, lineB)` : 'doc.setDrawColor(0, 0, 0)'}
    ${element.strokeWidth ? `doc.setLineWidth(${element.strokeWidth})` : 'doc.setLineWidth(1)'}
    
    // Adicionar linha
    doc.line(x, y, x + width, y)
`
          break
          
        case 'image':
          code += `    // Configurar imagem
    // Nota: A imagem deve estar em base64 ou ser carregada previamente
    const imageData = '${element.src || 'data:image/png;base64,...'}' // base64 da imagem
    
    try {
      // Adicionar imagem
      doc.addImage(imageData, 'PNG', x, y, width, height)
    } catch (error) {
      console.warn('Erro ao adicionar imagem:', error)
      // Desenhar placeholder
      doc.setDrawColor(200, 200, 200)
      doc.rect(x, y, width, height, 'S')
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text('Imagem', x + width/2, y + height/2, { align: 'center' })
    }
`
          break
          
        default:
          code += `    // Elemento customizado: ${element.type}
    // Implemente conforme necessário
    doc.setDrawColor(100, 100, 100)
    doc.rect(x, y, width, height, 'S')
`
      }
      
      if (transform.rotation) {
        code += `
    // Aplicar rotação
    // doc.saveGraphicsState()
    // doc.rotateRadians(${transform.rotation} * Math.PI / 180, x + width/2, y + height/2)
    // ... reaplicar elemento com rotação ...
    // doc.restoreGraphicsState()
`
      }
      
      code += `  }
`
    })

    code += `
  // Salvar PDF
  doc.save('${currentPage.name?.replace(/\s+/g, '-') || 'layout'}.pdf')
  
  return doc
}

// Exemplo de uso:
// generate${currentPage.name?.replace(/\s+/g, '') || 'Layout'}PDF()
`

    return code
  }

  const downloadCompleteProject = () => {
    const { html, css } = generateCompleteProject()
    
    // Criar um ZIP com os arquivos (simulado com múltiplos downloads)
    // Download HTML
    const htmlBlob = new Blob([html], { type: 'text/html' })
    const htmlUrl = URL.createObjectURL(htmlBlob)
    const htmlLink = document.createElement('a')
    htmlLink.href = htmlUrl
    htmlLink.download = 'index.html'
    htmlLink.click()
    URL.revokeObjectURL(htmlUrl)
    
    // Download CSS (com pequeno delay)
    setTimeout(() => {
      const cssBlob = new Blob([css], { type: 'text/css' })
      const cssUrl = URL.createObjectURL(cssBlob)
      const cssLink = document.createElement('a')
      cssLink.href = cssUrl
      cssLink.download = 'styles.css'
      cssLink.click()
      URL.revokeObjectURL(cssUrl)
    }, 100)
    
    setNotification({ type: 'success', message: 'Projeto completo baixado (HTML + CSS)!' })
    setTimeout(() => setNotification(null), 3000)
  }

  const generateElementCSS = (element: any) => {
    const bounds = element.bounds || {}
    const transform = element.transform || {}
    
    let css = `.element-${element.id} {\n`
    
    // Position and dimensions from bounds
    if (bounds.x !== undefined) css += `  left: ${bounds.x}px;\n`
    if (bounds.y !== undefined) css += `  top: ${bounds.y}px;\n`
    if (bounds.width !== undefined) css += `  width: ${bounds.width}px;\n`
    if (bounds.height !== undefined) css += `  height: ${bounds.height}px;\n`
    
    // Transform properties
    let transformValue = ''
    if (transform.rotation) transformValue += `rotate(${transform.rotation}deg) `
    if (transform.scaleX !== undefined && transform.scaleX !== 1) transformValue += `scaleX(${transform.scaleX}) `
    if (transform.scaleY !== undefined && transform.scaleY !== 1) transformValue += `scaleY(${transform.scaleY}) `
    if (transformValue) css += `  transform: ${transformValue.trim()};\n`
    
    // Opacity
    if (transform.opacity !== undefined && transform.opacity !== 1) {
      css += `  opacity: ${transform.opacity};\n`
    }
    
    // Element type specific styles
    if (element.type === 'text') {
      css += `  font-family: ${element.fontFamily || 'Arial'};\n`
      css += `  font-size: ${element.fontSize || '14'}px;\n`
      css += `  font-weight: ${element.fontWeight || 'normal'};\n`
      css += `  color: ${element.color || '#000000'};\n`
      if (element.textAlign) css += `  text-align: ${element.textAlign};\n`
      if (element.lineHeight) css += `  line-height: ${element.lineHeight};\n`
      if (element.letterSpacing) css += `  letter-spacing: ${element.letterSpacing}px;\n`
      if (element.textDecoration) css += `  text-decoration: ${element.textDecoration};\n`
    }
    
    // Rectangle styles
    if (element.type === 'rectangle') {
      if (element.fill) css += `  background-color: ${element.fill};\n`
      if (element.stroke) css += `  border-color: ${element.stroke};\n`
      if (element.strokeWidth) css += `  border-width: ${element.strokeWidth}px;\n`
      css += `  border-style: solid;\n`
    }
    
    // Position
    css += `  position: absolute;\n`
    
    css += `}\n`
    
    return css
  }

  const generateElementJS = (element: any, format: 'js' | 'tsx' = 'tsx') => {
    const isTypescript = format === 'tsx'
    
    let code = ''
    
    if (isTypescript) {
      code += `import React from 'react'\n\n`
      code += `interface ${element.name?.replace(/\s+/g, '') || 'Element'}Props {\n`
      code += `  className?: string\n`
      code += `  style?: React.CSSProperties\n`
      if (element.type === 'text') {
        code += `  children?: React.ReactNode\n`
      }
      code += `}\n\n`
    } else {
      code += `import React from 'react'\n\n`
    }
    
    const componentName = element.name?.replace(/\s+/g, '') || 'Element'
    const propsType = isTypescript ? `: React.FC<${componentName}Props>` : ''
    
    code += `export const ${componentName}${propsType} = ({ className = '', style = {}, ${element.type === 'text' ? 'children' : ''} }) => {\n`
    
    // Generate inline styles
    code += `  const elementStyles = {\n`
    
    const bounds = element.bounds || {}
    const transform = element.transform || {}
    
    // Position and dimensions from bounds
    if (bounds.x !== undefined) code += `    left: '${bounds.x}px',\n`
    if (bounds.y !== undefined) code += `    top: '${bounds.y}px',\n`
    if (bounds.width !== undefined) code += `    width: '${bounds.width}px',\n`
    if (bounds.height !== undefined) code += `    height: '${bounds.height}px',\n`
    
    // Transform
    let transformValue = ''
    if (transform.rotation) transformValue += `rotate(${transform.rotation}deg) `
    if (transform.scaleX !== undefined && transform.scaleX !== 1) transformValue += `scaleX(${transform.scaleX}) `
    if (transform.scaleY !== undefined && transform.scaleY !== 1) transformValue += `scaleY(${transform.scaleY}) `
    if (transformValue) code += `    transform: '${transformValue.trim()}',\n`
    
    if (transform.opacity !== undefined && transform.opacity !== 1) {
      code += `    opacity: ${transform.opacity},\n`
    }
    
    // Element specific styles
    if (element.type === 'text') {
      code += `    fontFamily: '${element.fontFamily || 'Arial'}',\n`
      code += `    fontSize: '${element.fontSize || '14'}px',\n`
      code += `    fontWeight: '${element.fontWeight || 'normal'}',\n`
      code += `    color: '${element.color || '#000000'}',\n`
      if (element.textAlign) code += `    textAlign: '${element.textAlign}',\n`
      if (element.lineHeight) code += `    lineHeight: '${element.lineHeight}',\n`
      if (element.letterSpacing) code += `    letterSpacing: '${element.letterSpacing}px',\n`
      if (element.textDecoration) code += `    textDecoration: '${element.textDecoration}',\n`
    }
    
    if (element.type === 'rectangle') {
      if (element.fill) code += `    backgroundColor: '${element.fill}',\n`
      if (element.stroke) code += `    borderColor: '${element.stroke}',\n`
      if (element.strokeWidth) code += `    borderWidth: '${element.strokeWidth}px',\n`
      code += `    borderStyle: 'solid',\n`
    }
    
    code += `    position: 'absolute',\n`
    code += `    ...style\n`
    code += `  }\n\n`
    
    // Generate JSX
    code += `  return (\n`
    
    switch (element.type) {
      case 'text':
        code += `    <div className={\`element-text \${className}\`} style={elementStyles}>\n`
        code += `      {children || '${element.content || 'Texto'}'}\n`
        code += `    </div>\n`
        break
      case 'rectangle':
        code += `    <div className={\`element-rectangle \${className}\`} style={elementStyles} />\n`
        break
      case 'line':
        code += `    <hr className={\`element-line \${className}\`} style={elementStyles} />\n`
        break
      case 'image':
        code += `    <img\n`
        code += `      className={\`element-image \${className}\`}\n`
        code += `      style={elementStyles}\n`
        code += `      src="${element.src || '/placeholder.jpg'}"\n`
        code += `      alt="${element.alt || 'Imagem'}"\n`
        code += `    />\n`
        break
      default:
        code += `    <div className={\`element-${element.type} \${className}\`} style={elementStyles} />\n`
    }
    
    code += `  )\n`
    code += `}\n\n`
    code += `export default ${componentName}\n`
    
    return code
  }

  const generateElementJsPDF = (element: any) => {
    let code = `// Código jsPDF para o elemento: ${element.name || 'Element'}\n`
    code += `// Adicione este código em sua função de geração de PDF\n\n`
    
    const bounds = element.bounds || {}
    const transform = element.transform || {}
    
    code += `// Configurar posição e dimensões\n`
    code += `const elementX = ${bounds.x || 0} // posição X em pixels\n`
    code += `const elementY = ${bounds.y || 0} // posição Y em pixels\n`
    code += `const elementWidth = ${bounds.width || 100} // largura em pixels\n`
    code += `const elementHeight = ${bounds.height || 20} // altura em pixels\n\n`
    
    code += `// Converter pixels para mm (assumindo 96 DPI)\n`
    code += `const pxToMm = (px) => px * 0.264583\n`
    code += `const x = pxToMm(elementX)\n`
    code += `const y = pxToMm(elementY)\n`
    code += `const width = pxToMm(elementWidth)\n`
    code += `const height = pxToMm(elementHeight)\n\n`
    
    switch (element.type) {
      case 'text':
        code += `// Configurar texto\n`
        code += `doc.setFont('${element.fontFamily || 'helvetica'}', '${element.fontWeight || 'normal'}')\n`
        code += `doc.setFontSize(${element.fontSize || 14})\n`
        if (element.color) {
          const color = element.color.replace('#', '')
          const r = parseInt(color.substr(0, 2), 16)
          const g = parseInt(color.substr(2, 2), 16)
          const b = parseInt(color.substr(4, 2), 16)
          code += `doc.setTextColor(${r}, ${g}, ${b})\n`
        } else {
          code += `doc.setTextColor(0, 0, 0)\n`
        }
        code += `\n// Adicionar texto\n`
        code += `doc.text('${element.content || 'Texto'}', x, y)\n`
        break
        
      case 'rectangle':
        code += `// Configurar retângulo\n`
        if (element.fill) {
          const color = element.fill.replace('#', '')
          const r = parseInt(color.substr(0, 2), 16)
          const g = parseInt(color.substr(2, 2), 16)
          const b = parseInt(color.substr(4, 2), 16)
          code += `doc.setFillColor(${r}, ${g}, ${b})\n`
        }
        if (element.stroke) {
          const color = element.stroke.replace('#', '')
          const r = parseInt(color.substr(0, 2), 16)
          const g = parseInt(color.substr(2, 2), 16)
          const b = parseInt(color.substr(4, 2), 16)
          code += `doc.setDrawColor(${r}, ${g}, ${b})\n`
        }
        if (element.strokeWidth) {
          code += `doc.setLineWidth(${element.strokeWidth})\n`
        }
        code += `\n// Adicionar retângulo\n`
        const fillStyle = element.fill ? (element.strokeWidth ? 'FD' : 'F') : (element.strokeWidth ? 'S' : 'S')
        code += `doc.rect(x, y, width, height, '${fillStyle}')\n`
        break
        
      case 'line':
        code += `// Configurar linha\n`
        if (element.stroke) {
          const color = element.stroke.replace('#', '')
          const r = parseInt(color.substr(0, 2), 16)
          const g = parseInt(color.substr(2, 2), 16)
          const b = parseInt(color.substr(4, 2), 16)
          code += `doc.setDrawColor(${r}, ${g}, ${b})\n`
        }
        if (element.strokeWidth) {
          code += `doc.setLineWidth(${element.strokeWidth})\n`
        }
        code += `\n// Adicionar linha\n`
        code += `doc.line(x, y, x + width, y)\n`
        break
        
      case 'image':
        code += `// Configurar imagem\n`
        code += `// Nota: A imagem deve estar em base64 ou ser carregada previamente\n`
        code += `const imageData = '${element.src || 'data:image/png;base64,...'}' // base64 da imagem\n`
        code += `\n// Adicionar imagem\n`
        code += `doc.addImage(imageData, 'PNG', x, y, width, height)\n`
        break
        
      default:
        code += `// Elemento customizado: ${element.type}\n`
        code += `// Implemente conforme necessário\n`
    }
    
    code += `\n// Aplicar transformações se necessário\n`
    if (transform.rotation) {
      code += `// Rotação: ${transform.rotation}°\n`
      code += `// doc.saveGraphicsState()\n`
      code += `// doc.rotateRadians(${transform.rotation} * Math.PI / 180, x, y)\n`
      code += `// ... adicionar elemento ...\n`
      code += `// doc.restoreGraphicsState()\n`
    }
    
    if (transform.opacity && transform.opacity !== 1) {
      code += `// Opacidade: ${transform.opacity}\n`
      code += `// doc.setGState(new doc.GState({opacity: ${transform.opacity}}))\n`
    }
    
    return code
  }

  const renderTextProperties = (element: any) => (
    <div className="row g-2">
      <div className="col-12">
        <label className="form-label small fw-bold">Conteúdo</label>
        <textarea
          className="form-control form-control-sm"
          value={element.content || ''}
          onChange={(e) => handlePropertyChange('content', e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Fonte</label>
        <select
          className="form-select form-select-sm"
          value={element.style?.fontFamily || 'Arial'}
          onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      
      <div className="col-6">
        <label className="form-label small">Tamanho</label>
        <input
          type="number"
          className="form-control form-control-sm"
          value={element.style?.fontSize || 14}
          onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
          min="8"
          max="72"
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Peso</label>
        <select
          className="form-select form-select-sm"
          value={element.style?.fontWeight || 'normal'}
          onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="bold">Negrito</option>
          <option value="lighter">Mais leve</option>
          <option value="bolder">Mais pesado</option>
        </select>
      </div>
      
      <div className="col-6">
        <label className="form-label small">Cor</label>
        <input
          type="color"
          className="form-control form-control-color form-control-sm"
          value={element.style?.color || '#000000'}
          onChange={(e) => handlePropertyChange('color', e.target.value)}
        />
      </div>
      
      <div className="col-12">
        <label className="form-label small">Alinhamento</label>
        <div className="btn-group btn-group-sm w-100" role="group">
          <input
            type="radio"
            className="btn-check"
            id="align-left"
            name="textAlign"
            checked={element.style?.textAlign === 'left' || !element.style?.textAlign}
            onChange={() => handlePropertyChange('textAlign', 'left')}
          />
          <label className="btn btn-outline-secondary" htmlFor="align-left">
            <i className="bi bi-text-left"></i>
          </label>
          
          <input
            type="radio"
            className="btn-check"
            id="align-center"
            name="textAlign"
            checked={element.style?.textAlign === 'center'}
            onChange={() => handlePropertyChange('textAlign', 'center')}
          />
          <label className="btn btn-outline-secondary" htmlFor="align-center">
            <i className="bi bi-text-center"></i>
          </label>
          
          <input
            type="radio"
            className="btn-check"
            id="align-right"
            name="textAlign"
            checked={element.style?.textAlign === 'right'}
            onChange={() => handlePropertyChange('textAlign', 'right')}
          />
          <label className="btn btn-outline-secondary" htmlFor="align-right">
            <i className="bi bi-text-right"></i>
          </label>
          
          <input
            type="radio"
            className="btn-check"
            id="align-justify"
            name="textAlign"
            checked={element.style?.textAlign === 'justify'}
            onChange={() => handlePropertyChange('textAlign', 'justify')}
          />
          <label className="btn btn-outline-secondary" htmlFor="align-justify">
            <i className="bi bi-justify"></i>
          </label>
        </div>
      </div>
      
      <div className="col-6">
        <label className="form-label small">Altura da linha</label>
        <input
          type="number"
          className="form-control form-control-sm"
          value={element.style?.lineHeight || 1.2}
          onChange={(e) => handlePropertyChange('lineHeight', parseFloat(e.target.value))}
          step="0.1"
          min="0.5"
          max="3"
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Espaçamento</label>
        <input
          type="number"
          className="form-control form-control-sm"
          value={element.style?.letterSpacing || 0}
          onChange={(e) => handlePropertyChange('letterSpacing', parseInt(e.target.value))}
          min="-5"
          max="10"
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Decoração</label>
        <select
          className="form-select form-select-sm"
          value={element.style?.textDecoration || 'none'}
          onChange={(e) => handlePropertyChange('textDecoration', e.target.value)}
        >
          <option value="none">Nenhuma</option>
          <option value="underline">Sublinhado</option>
          <option value="line-through">Riscado</option>
          <option value="overline">Sobrelinha</option>
        </select>
      </div>
      
      <div className="col-6">
        <label className="form-label small">Transformação</label>
        <select
          className="form-select form-select-sm"
          value={element.style?.textTransform || 'none'}
          onChange={(e) => handlePropertyChange('textTransform', e.target.value)}
        >
          <option value="none">Nenhuma</option>
          <option value="uppercase">MAIÚSCULA</option>
          <option value="lowercase">minúscula</option>
          <option value="capitalize">Primeira Maiúscula</option>
        </select>
      </div>
    </div>
  )

  const renderRectangleProperties = (element: any) => (
    <div className="row g-2">
      <div className="col-6">
        <label className="form-label small">Cor de fundo</label>
        <input
          type="color"
          className="form-control form-control-color form-control-sm"
          value={element.style?.backgroundColor || '#ffffff'}
          onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Cor da borda</label>
        <input
          type="color"
          className="form-control form-control-color form-control-sm"
          value={element.style?.borderColor || '#000000'}
          onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Espessura da borda</label>
        <input
          type="number"
          className="form-control form-control-sm"
          value={element.style?.borderWidth || 1}
          onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value))}
          min="0"
          max="10"
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Estilo da borda</label>
        <select
          className="form-select form-select-sm"
          value={element.style?.borderStyle || 'solid'}
          onChange={(e) => handlePropertyChange('borderStyle', e.target.value)}
        >
          <option value="solid">Sólida</option>
          <option value="dashed">Tracejada</option>
          <option value="dotted">Pontilhada</option>
          <option value="double">Dupla</option>
        </select>
      </div>
      
      <div className="col-12">
        <label className="form-label small">Raio da borda (px)</label>
        <input
          type="number"
          className="form-control form-control-sm"
          value={element.style?.borderRadius || 0}
          onChange={(e) => handlePropertyChange('borderRadius', parseInt(e.target.value))}
          min="0"
          max="50"
        />
      </div>
    </div>
  )

  const renderLineProperties = (element: any) => (
    <div className="row g-2">
      <div className="col-6">
        <label className="form-label small">Cor</label>
        <input
          type="color"
          className="form-control form-control-color form-control-sm"
          value={element.style?.borderColor || '#000000'}
          onChange={(e) => handlePropertyChange('borderColor', e.target.value)}
        />
      </div>
      
      <div className="col-6">
        <label className="form-label small">Espessura</label>
        <input
          type="number"
          className="form-control form-control-sm"
          value={element.style?.borderWidth || 1}
          onChange={(e) => handlePropertyChange('borderWidth', parseInt(e.target.value))}
          min="1"
          max="10"
        />
      </div>
      
      <div className="col-12">
        <label className="form-label small">Estilo</label>
        <select
          className="form-select form-select-sm"
          value={element.style?.borderStyle || 'solid'}
          onChange={(e) => handlePropertyChange('borderStyle', e.target.value)}
        >
          <option value="solid">Sólida</option>
          <option value="dashed">Tracejada</option>
          <option value="dotted">Pontilhada</option>
          <option value="double">Dupla</option>
        </select>
      </div>
    </div>
  )

  const renderImageProperties = (element: any) => (
    <div className="row g-2">
      <div className="col-12">
        <label className="form-label small fw-bold">URL da Imagem</label>
        <input
          type="url"
          className="form-control form-control-sm"
          value={element.src || ''}
          onChange={(e) => handlePropertyChange('src', e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
      
      <div className="col-12">
        <label className="form-label small">Texto alternativo</label>
        <input
          type="text"
          className="form-control form-control-sm"
          value={element.alt || ''}
          onChange={(e) => handlePropertyChange('alt', e.target.value)}
          placeholder="Descrição da imagem"
        />
      </div>
      
      <div className="col-12">
        <label className="form-label small">Ajuste</label>
        <select
          className="form-select form-select-sm"
          value={element.fit || 'contain'}
          onChange={(e) => handlePropertyChange('fit', e.target.value)}
        >
          <option value="contain">Conter</option>
          <option value="cover">Cobrir</option>
          <option value="fill">Preencher</option>
          <option value="none">Original</option>
        </select>
      </div>

      <div className="form-check">
        <input
          className="form-check-input"
          type="checkbox"
          id="keepAspectRatio"
          checked={element.keepAspectRatio !== false}
          onChange={(e) => handlePropertyChange('keepAspectRatio', e.target.checked)}
        />
        <label className="form-check-label small" htmlFor="keepAspectRatio">
          Manter proporção
        </label>
      </div>
    </div>
  )

  if (!selectedElement) {
    return (
      <div className={`d-flex flex-column h-100 bg-white border-start ${className}`}>
        <div className="bg-light border-bottom px-4 py-3">
          <h6 className="mb-0 fw-bold text-dark">
            <i className="bi bi-sliders me-2"></i>
            Propriedades
          </h6>
        </div>
        <div className="flex-grow-1 p-4">
          <div className="text-center text-muted mb-4">
            <i className="bi bi-mouse2 fs-1 mb-3 d-block"></i>
            <p className="mb-0">Selecione um elemento para editar suas propriedades</p>
          </div>
          
          {/* Downloads do Projeto - sempre disponível */}
          <div className="mt-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-download me-2"></i>
              Projeto Completo
            </h6>
            <div className="d-grid gap-2">
              <button 
                className="btn btn-success"
                onClick={downloadCompleteProject}
                title="Baixar projeto completo com HTML e CSS"
                disabled={!currentPage || !currentPage.elements || currentPage.elements.length === 0}
              >
                <i className="bi bi-file-earmark-zip me-2"></i> 
                HTML + CSS
              </button>
              <button 
                className="btn btn-info"
                onClick={() => {
                  const reactCode = generateCompleteReactProject()
                  const cssCode = generateCompleteProject().css
                  
                  // Download React component
                  const reactBlob = new Blob([reactCode], { type: 'text/typescript' })
                  const reactUrl = URL.createObjectURL(reactBlob)
                  const reactLink = document.createElement('a')
                  reactLink.href = reactUrl
                  reactLink.download = `${currentPage?.name?.replace(/\s+/g, '') || 'Layout'}Component.tsx`
                  reactLink.click()
                  URL.revokeObjectURL(reactUrl)
                  
                  // Download CSS (com delay)
                  setTimeout(() => {
                    const cssBlob = new Blob([cssCode], { type: 'text/css' })
                    const cssUrl = URL.createObjectURL(cssBlob)
                    const cssLink = document.createElement('a')
                    cssLink.href = cssUrl
                    cssLink.download = 'styles.css'
                    cssLink.click()
                    URL.revokeObjectURL(cssUrl)
                  }, 100)
                  
                  setNotification({ type: 'success', message: 'Projeto React baixado (TSX + CSS)!' })
                  setTimeout(() => setNotification(null), 3000)
                }}
                title="Baixar como componente React/TSX com CSS"
                disabled={!currentPage || !currentPage.elements || currentPage.elements.length === 0}
              >
                <i className="bi bi-file-earmark-code me-2"></i> 
                React/TSX + CSS
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  const jsPDFCode = generateCompleteJsPDFProject()
                  const blob = new Blob([jsPDFCode], { type: 'text/typescript' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `generate-${currentPage?.name?.replace(/\s+/g, '-') || 'layout'}-pdf.ts`
                  a.click()
                  URL.revokeObjectURL(url)
                  setNotification({ type: 'success', message: 'Gerador jsPDF baixado!' })
                  setTimeout(() => setNotification(null), 3000)
                }}
                title="Baixar gerador de PDF completo com jsPDF"
                disabled={!currentPage || !currentPage.elements || currentPage.elements.length === 0}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i> 
                jsPDF Generator
              </button>
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                {!currentPage || !currentPage.elements || currentPage.elements.length === 0 
                  ? 'Adicione elementos à página para baixar o projeto'
                  : `Baixar todos os ${currentPage.elements.length} elementos em diferentes formatos`
                }
              </small>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`d-flex flex-column h-100 bg-white border-start ${className}`}>
      {/* Notification */}
      {notification && (
        <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible m-3 mb-0`}>
          <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
          {notification.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setNotification(null)}
          ></button>
        </div>
      )}

      {/* Header */}
      <div className="bg-light border-bottom px-4 py-3 flex-shrink-0">
        <h6 className="mb-0 fw-bold text-dark">
          <i className={`${getElementIcon(selectedElement.type)} me-1`}></i>
          {selectedElement.name || selectedElement.type}
        </h6>
        <small className="text-muted">ID: {selectedElement.id}</small>
      </div>
      
      {/* Actions */}
      <div className="border-bottom px-4 py-3 flex-shrink-0">
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-danger btn-sm"
            onClick={handleDeleteElement}
            title="Excluir elemento"
          >
            <i className="bi bi-trash"></i>
          </button>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={handleDuplicateElement}
            title="Duplicar elemento"
          >
            <i className="bi bi-copy"></i>
          </button>
        </div>
      </div>

      {/* Content with scroll */}
      <div className="flex-grow-1 custom-scroll" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
        <div className="px-4 py-3">
          {/* Transform Properties */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-arrows-move me-2"></i>
              Posição e Tamanho
            </h6>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label small">X (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedElement.bounds?.x || 0}
                  onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                />
              </div>
              <div className="col-6">
                <label className="form-label small">Y (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedElement.bounds?.y || 0}
                  onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                />
              </div>
              <div className="col-6">
                <label className="form-label small">Largura (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedElement.bounds?.width || 100}
                  onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div className="col-6">
                <label className="form-label small">Altura (px)</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedElement.bounds?.height || 20}
                  onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Element Specific Properties */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-gear me-2"></i>
              Propriedades Específicas
            </h6>
            {selectedElement.type === 'text' && renderTextProperties(selectedElement)}
            {selectedElement.type === 'rectangle' && renderRectangleProperties(selectedElement)}
            {selectedElement.type === 'line' && renderLineProperties(selectedElement)}
            {selectedElement.type === 'image' && renderImageProperties(selectedElement)}
          </div>

          {/* Transform Properties */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-arrow-clockwise me-2"></i>
              Transformações
            </h6>
            <div className="row g-2">
              <div className="col-12">
                <label className="form-label small">Rotação (graus)</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="range"
                    className="form-range flex-grow-1"
                    value={selectedElement.transform?.rotation || 0}
                    onChange={(e) => handlePropertyChange('rotation', parseInt(e.target.value))}
                    min="-180"
                    max="180"
                  />
                  <small className="text-muted" style={{ minWidth: '40px' }}>
                    {selectedElement.transform?.rotation || 0}°
                  </small>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label small">Escala X</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedElement.transform?.scaleX || 1}
                  onChange={(e) => handlePropertyChange('scaleX', parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                  max="5"
                />
              </div>
              <div className="col-6">
                <label className="form-label small">Escala Y</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={selectedElement.transform?.scaleY || 1}
                  onChange={(e) => handlePropertyChange('scaleY', parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                  max="5"
                />
              </div>
            </div>
          </div>

          {/* Downloads do Projeto */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-download me-2"></i>
              Downloads do Projeto
            </h6>
            <div className="d-grid gap-2 mb-3">
              <button 
                className="btn btn-success btn-sm"
                onClick={downloadCompleteProject}
                title="Baixar projeto completo com HTML e CSS"
              >
                <i className="bi bi-file-earmark-zip me-1"></i> 
                HTML + CSS
              </button>
              <button 
                className="btn btn-info btn-sm"
                onClick={() => {
                  const reactCode = generateCompleteReactProject()
                  const cssCode = generateCompleteProject().css
                  
                  // Download React component
                  const reactBlob = new Blob([reactCode], { type: 'text/typescript' })
                  const reactUrl = URL.createObjectURL(reactBlob)
                  const reactLink = document.createElement('a')
                  reactLink.href = reactUrl
                  reactLink.download = `${currentPage?.name?.replace(/\s+/g, '') || 'Layout'}Component.tsx`
                  reactLink.click()
                  URL.revokeObjectURL(reactUrl)
                  
                  // Download CSS (com delay)
                  setTimeout(() => {
                    const cssBlob = new Blob([cssCode], { type: 'text/css' })
                    const cssUrl = URL.createObjectURL(cssBlob)
                    const cssLink = document.createElement('a')
                    cssLink.href = cssUrl
                    cssLink.download = 'styles.css'
                    cssLink.click()
                    URL.revokeObjectURL(cssUrl)
                  }, 100)
                  
                  setNotification({ type: 'success', message: 'Projeto React baixado (TSX + CSS)!' })
                  setTimeout(() => setNotification(null), 3000)
                }}
                title="Baixar como componente React/TSX com CSS"
              >
                <i className="bi bi-file-earmark-code me-1"></i> 
                React/TSX + CSS
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => {
                  const jsPDFCode = generateCompleteJsPDFProject()
                  const blob = new Blob([jsPDFCode], { type: 'text/typescript' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `generate-${currentPage?.name?.replace(/\s+/g, '-') || 'layout'}-pdf.ts`
                  a.click()
                  URL.revokeObjectURL(url)
                  setNotification({ type: 'success', message: 'Gerador jsPDF baixado!' })
                  setTimeout(() => setNotification(null), 3000)
                }}
                title="Baixar gerador de PDF completo com jsPDF"
              >
                <i className="bi bi-file-earmark-pdf me-1"></i> 
                jsPDF Generator
              </button>
            </div>
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              Baixa todos os elementos da página como um projeto completo
            </small>
          </div>

          {/* Código de Elementos */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-code-slash me-2"></i>
              Código do Elemento
            </h6>
            <div className="d-flex gap-1 flex-wrap">
              <button 
                className="btn btn-primary btn-sm"
                onClick={downloadCompleteProject}
                title="Baixar projeto completo (HTML + CSS)"
              >
                <i className="bi bi-download me-1"></i> Projeto HTML
              </button>
              <button 
                className="btn btn-outline-info btn-sm"
                onClick={() => {
                  const jsCode = generateElementJS(selectedElement, 'tsx')
                  const blob = new Blob([jsCode], { type: 'text/typescript' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${selectedElement.name?.replace(/\s+/g, '') || 'Element'}.tsx`
                  a.click()
                  URL.revokeObjectURL(url)
                  setNotification({ type: 'success', message: 'Componente TSX baixado!' })
                  setTimeout(() => setNotification(null), 2000)
                }}
                title="Baixar como componente React TSX"
              >
                <i className="bi bi-file-earmark-code"></i> TSX
              </button>
              <button 
                className="btn btn-outline-warning btn-sm"
                onClick={() => {
                  const jsCode = generateElementJS(selectedElement, 'js')
                  const blob = new Blob([jsCode], { type: 'text/javascript' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${selectedElement.name?.replace(/\s+/g, '') || 'Element'}.js`
                  a.click()
                  URL.revokeObjectURL(url)
                  setNotification({ type: 'success', message: 'Código JS baixado!' })
                  setTimeout(() => setNotification(null), 2000)
                }}
                title="Baixar como JavaScript"
              >
                <i className="bi bi-file-earmark-text"></i> JS
              </button>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  const pdfCode = generateElementJsPDF(selectedElement)
                  const blob = new Blob([pdfCode], { type: 'text/typescript' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${selectedElement.name?.replace(/\s+/g, '') || 'Element'}-jspdf.ts`
                  a.click()
                  URL.revokeObjectURL(url)
                  setNotification({ type: 'success', message: 'Código jsPDF baixado!' })
                  setTimeout(() => setNotification(null), 2000)
                }}
                title="Baixar código jsPDF"
              >
                <i className="bi bi-file-earmark-pdf"></i> jsPDF
              </button>
              <div className="border-end me-2"></div>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  const css = generateElementCSS(selectedElement)
                  const blob = new Blob([css], { type: 'text/css' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `element-${selectedElement.id}.css`
                  a.click()
                  URL.revokeObjectURL(url)
                  setNotification({ type: 'success', message: 'CSS baixado como arquivo!' })
                  setTimeout(() => setNotification(null), 2000)
                }}
                title="Baixar CSS do elemento"
              >
                <i className="bi bi-download"></i>
              </button>
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(generateElementCSS(selectedElement))
                  setNotification({ type: 'success', message: 'CSS copiado para a área de transferência!' })
                  setTimeout(() => setNotification(null), 2000)
                }}
                title="Copiar CSS"
              >
                <i className="bi bi-clipboard"></i>
              </button>
            </div>
          </div>

          {/* Opacity */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-transparency me-2"></i>
              Transparência
            </h6>
            <div className="d-flex align-items-center gap-2">
              <input
                type="range"
                className="form-range flex-grow-1"
                value={(selectedElement.transform?.opacity || 1) * 100}
                onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value) / 100)}
                min="0"
                max="100"
              />
              <small className="text-muted">
                {Math.round((selectedElement.transform?.opacity || 1) * 100)}%
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyPanel