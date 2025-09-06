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
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <i className="bi bi-mouse2 fs-1 mb-3 d-block"></i>
            <p className="mb-0">Selecione um elemento para editar suas propriedades</p>
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

          {/* CSS Avançado */}
          <div className="mb-4">
            <h6 className="text-muted mb-3 fw-bold">
              <i className="bi bi-code-slash me-2"></i>
              CSS Avançado
            </h6>
            <div className="d-flex gap-1 flex-wrap">
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
                title="Baixar CSS"
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