import React, { useRef, useEffect, useState } from 'react'
import { useEditorStore } from '../store/editor'
import { convertUnits, snapToGrid, snapToValue } from '../utils/helpers'
import { v4 as uuidv4 } from 'uuid'
import type { Element, Point } from '../types'

interface CanvasOverlayProps {
  width: number
  height: number
  scale: number
  onElementClick?: (elementId: string, event: React.MouseEvent) => void
  onCanvasClick?: (event: React.MouseEvent) => void
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  width,
  height,
  scale,
  onElementClick,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    dragStart: Point
    elementId?: string
  }>({ isDragging: false, dragStart: { x: 0, y: 0 } })

  const {
    currentPage,
    selectedElementIds,
    isGridVisible,
    snapToGrid: isSnapToGrid,
    snapToElements,
    tool,
    updateElement,
    selectElement,
    deselectAll,
    addElement,
    deleteElement,
    duplicateElement,
  } = useEditorStore()

  const elements = currentPage?.elements || []

  // Grid configuration
  const gridSize = 5 // 5mm grid
  const gridSizePx = convertUnits(gridSize, 'mm', 'px', 96) * scale

  // Handle mouse down for dragging and creating elements
  const handleMouseDown = (event: React.MouseEvent, elementId?: string) => {
    event.preventDefault()
    console.log('Mouse down on canvas, tool:', tool, 'elementId:', elementId)
    
    if (elementId) {
      if (onElementClick) {
        onElementClick(elementId, event)
      }
      
      if (tool === 'select') {
        const rect = canvasRef.current!.getBoundingClientRect()
        setDragState({
          isDragging: true,
          dragStart: {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          },
          elementId,
        })
        console.log('Selecionando elemento:', elementId)
        selectElement(elementId, event.ctrlKey || event.metaKey)
      }
    } else {
      // Clicked on canvas - create new element based on selected tool
      console.log('Clicked on canvas, current tool:', tool)
      if (tool !== 'select') {
        console.log('Creating new element with tool:', tool)
        const rect = canvasRef.current!.getBoundingClientRect()
        const clickPos = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
        
        // Convert to mm coordinates
        const xMm = convertUnits(clickPos.x / scale, 'px', 'mm', 96)
        const yMm = convertUnits(clickPos.y / scale, 'px', 'mm', 96)
        
        // Apply snap to grid if enabled
        const finalX = isSnapToGrid ? snapToGrid(xMm, gridSize) : xMm
        const finalY = isSnapToGrid ? snapToGrid(yMm, gridSize) : yMm
        
        createElementAtPosition(finalX, finalY)
      } else {
        console.log('Select tool active, not creating element')
      }
      
      if (onCanvasClick) {
        onCanvasClick(event)
      }
      if (!event.ctrlKey && !event.metaKey) {
        deselectAll()
      }
    }
  }

  // Create element at specific position based on current tool
  const createElementAtPosition = (x: number, y: number) => {
    console.log('Creating element at position:', x, y, 'with tool:', tool)
    
    if (!currentPage) {
      console.error('No current page available to add elements')
      return
    }
    
    const defaultWidth = 50
    const defaultHeight = 30
    
    let newElement: Element
    
    switch (tool) {
      case 'text':
        newElement = {
          id: uuidv4(),
          type: 'text',
          name: 'Novo Texto',
          bounds: { x, y, width: defaultWidth, height: defaultHeight },
          locked: false,
          visible: true,
          zIndex: 0,
          content: 'Novo Texto',
          fontSize: 12,
          fontFamily: 'Arial',
          fontWeight: 'normal',
          fontStyle: 'normal',
          color: '#000000',
          textAlign: 'left',
          verticalAlign: 'top',
          lineHeight: 1.2,
          letterSpacing: 0,
          textDecoration: 'none',
          wordWrap: true,
        }
        break
        
      case 'rectangle':
        newElement = {
          id: uuidv4(),
          type: 'rectangle',
          name: 'Novo Retângulo',
          bounds: { x, y, width: defaultWidth, height: defaultHeight },
          locked: false,
          visible: true,
          zIndex: 0,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
        }
        break
        
      case 'line':
        newElement = {
          id: uuidv4(),
          type: 'line',
          name: 'Nova Linha',
          bounds: { x, y, width: defaultWidth, height: 2 },
          locked: false,
          visible: true,
          zIndex: 0,
          startPoint: { x: 0, y: 0 },
          endPoint: { x: defaultWidth, y: 0 },
          stroke: '#000000',
          strokeWidth: 2,
          strokeStyle: 'solid',
        }
        break
        
      case 'image':
        newElement = {
          id: uuidv4(),
          type: 'image',
          name: 'Nova Imagem',
          bounds: { x, y, width: defaultWidth, height: defaultHeight },
          locked: false,
          visible: true,
          zIndex: 0,
          src: '',
          alt: 'Nova Imagem',
          fit: 'contain',
          keepAspectRatio: true,
        }
        break
        
      case 'table':
        newElement = {
          id: uuidv4(),
          type: 'table',
          name: 'Nova Tabela',
          bounds: { x, y, width: 150, height: 100 },
          locked: false,
          visible: true,
          zIndex: 0,
          columns: [
            { id: '1', title: 'Col 1', field: 'col1', width: 'auto', textAlign: 'left', fontSize: 12, fontWeight: 'normal', color: '#000000' },
            { id: '2', title: 'Col 2', field: 'col2', width: 'auto', textAlign: 'left', fontSize: 12, fontWeight: 'normal', color: '#000000' },
            { id: '3', title: 'Col 3', field: 'col3', width: 'auto', textAlign: 'left', fontSize: 12, fontWeight: 'normal', color: '#000000' },
          ],
          headerStyle: {
            backgroundColor: '#f5f5f5',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#000000',
            height: 30,
          },
          showHeader: true,
          showBorders: true,
          borderColor: '#000000',
          borderWidth: 1,
          pageBreak: false,
          repeatHeader: true,
        }
        break
        
      default:
        return
    }
    
    addElement(newElement)
    selectElement(newElement.id, false)
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!dragState.isDragging || !dragState.elementId || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const currentPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      const deltaX = (currentPos.x - dragState.dragStart.x) / scale
      const deltaY = (currentPos.y - dragState.dragStart.y) / scale

      // Convert to mm
      let deltaXMm = convertUnits(deltaX, 'px', 'mm', 96)
      let deltaYMm = convertUnits(deltaY, 'px', 'mm', 96)

      // Apply snap to grid
      if (isSnapToGrid) {
        const element = elements.find(e => e.id === dragState.elementId)
        if (element) {
          const newX = element.bounds.x + deltaXMm
          const newY = element.bounds.y + deltaYMm
          
          const snappedX = snapToGrid(newX, gridSize)
          const snappedY = snapToGrid(newY, gridSize)
          
          deltaXMm = snappedX - element.bounds.x
          deltaYMm = snappedY - element.bounds.y
        }
      }

      // Apply snap to elements
      if (snapToElements) {
        const element = elements.find(e => e.id === dragState.elementId)
        if (element) {
          const otherElements = elements.filter(e => e.id !== dragState.elementId)
          const snapTargetsX = otherElements.flatMap(e => [e.bounds.x, e.bounds.x + e.bounds.width])
          const snapTargetsY = otherElements.flatMap(e => [e.bounds.y, e.bounds.y + e.bounds.height])
          
          const newX = element.bounds.x + deltaXMm
          const newY = element.bounds.y + deltaYMm
          
          const snappedX = snapToValue(newX, snapTargetsX, 2)
          const snappedY = snapToValue(newY, snapTargetsY, 2)
          
          deltaXMm = snappedX - element.bounds.x
          deltaYMm = snappedY - element.bounds.y
        }
      }

      // Update element position
      const element = elements.find(e => e.id === dragState.elementId)
      if (element) {
        updateElement(dragState.elementId, {
          bounds: {
            ...element.bounds,
            x: element.bounds.x + deltaXMm,
            y: element.bounds.y + deltaYMm,
          },
        })
      }

      // Update drag start position
      setDragState(prev => ({
        ...prev,
        dragStart: currentPos,
      }))
    }

    const handleMouseUp = () => {
      setDragState({ isDragging: false, dragStart: { x: 0, y: 0 } })
    }

    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, scale, isSnapToGrid, snapToElements, elements, updateElement, gridSize])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle if canvas area is focused and there are selected elements
      if (selectedElementIds.length === 0) return
      
      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          event.preventDefault()
          selectedElementIds.forEach(id => deleteElement(id))
          break
        case 'd':
        case 'D':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            selectedElementIds.forEach(id => duplicateElement(id))
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedElementIds, deleteElement, duplicateElement])

  // Render element based on type
  const renderElement = (element: Element) => {
    const isSelected = selectedElementIds.includes(element.id)
    const transform = element.transform || { opacity: 1, rotation: 0, scaleX: 1, scaleY: 1 }
    
    // Convert mm to px for display
    const bounds = {
      x: convertUnits(element.bounds.x, 'mm', 'px', 96) * scale,
      y: convertUnits(element.bounds.y, 'mm', 'px', 96) * scale,
      width: convertUnits(element.bounds.width, 'mm', 'px', 96) * scale,
      height: convertUnits(element.bounds.height, 'mm', 'px', 96) * scale,
    }

    const style: React.CSSProperties = {
      position: 'absolute',
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
      opacity: transform.opacity || 1,
      transform: `rotate(${transform.rotation || 0}deg) scale(${transform.scaleX || 1}, ${transform.scaleY || 1})`,
      transformOrigin: 'center',
      cursor: tool === 'select' ? 'move' : 'default',
      border: isSelected ? '2px solid #3b82f6' : 'none',
      backgroundColor: element.type === 'rectangle' ? (element as any).fill || 'transparent' : 'transparent',
      pointerEvents: element.locked ? 'none' : 'auto',
    }

    switch (element.type) {
      case 'text':
        const textElement = element as any
        return (
          <div
            key={element.id}
            style={{
              ...style,
              fontSize: `${convertUnits(textElement.fontSize || 12, 'pt', 'px', 96) * scale}px`,
              fontFamily: textElement.fontFamily || 'Arial',
              fontWeight: textElement.fontWeight || 'normal',
              fontStyle: textElement.fontStyle || 'normal',
              color: textElement.color || '#000000',
              textAlign: textElement.textAlign || 'left',
              display: 'flex',
              alignItems: textElement.verticalAlign === 'middle' ? 'center' : 
                         textElement.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
              padding: '2px',
              overflow: 'hidden',
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, element.id)
            }}
          >
            {textElement.content || 'Texto'}
          </div>
        )

      case 'image':
        const imageElement = element as any
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, element.id)
            }}
          >
            {imageElement.src ? (
              <img
                src={imageElement.src}
                alt={imageElement.alt || ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: imageElement.fit || 'contain',
                }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                Imagem
              </div>
            )}
          </div>
        )

      case 'rectangle':
        const rectElement = element as any
        return (
          <div
            key={element.id}
            style={{
              ...style,
              backgroundColor: rectElement.fill || '#ffffff',
              borderColor: rectElement.stroke || '#000000',
              borderWidth: `${(rectElement.strokeWidth || 1) * scale}px`,
              borderStyle: 'solid',
              borderRadius: `${(rectElement.border?.radius || 0) * scale}px`,
            }}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, element.id)
            }}
          />
        )

      case 'qrcode':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, element.id)
            }}
          >
            <div className="w-full h-full bg-white border flex items-center justify-center text-sm">
              QR Code
            </div>
          </div>
        )

      case 'table':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, element.id)
            }}
          >
            <div className="w-full h-full bg-white border border-gray-300 text-xs p-1">
              Tabela
            </div>
          </div>
        )

      default:
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, element.id)
            }}
          >
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">
              {element.type}
            </div>
          </div>
        )
    }
  }

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden"
      style={{ 
        width: convertUnits(width, 'mm', 'px', 96) * scale, 
        height: convertUnits(height, 'mm', 'px', 96) * scale 
      }}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      {/* Grid */}
      {isGridVisible && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSizePx}px ${gridSizePx}px`,
          }}
        />
      )}

      {/* Elements */}
      {elements
        .filter(el => el.visible !== false)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map(renderElement)}

      {/* Selection handles */}
      {selectedElementIds.map(elementId => {
        const element = elements.find(e => e.id === elementId)
        if (!element) return null

        const bounds = {
          x: convertUnits(element.bounds.x, 'mm', 'px', 96) * scale,
          y: convertUnits(element.bounds.y, 'mm', 'px', 96) * scale,
          width: convertUnits(element.bounds.width, 'mm', 'px', 96) * scale,
          height: convertUnits(element.bounds.height, 'mm', 'px', 96) * scale,
        }

        return (
          <div
            key={`selection-${elementId}`}
            className="absolute pointer-events-none"
            style={{
              left: bounds.x - 4,
              top: bounds.y - 4,
              width: bounds.width + 8,
              height: bounds.height + 8,
              border: '2px solid #3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }}
          >
            {/* Resize handles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-nw-resize" />
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-n-resize" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-ne-resize" />
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-e-resize" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-se-resize" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-s-resize" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-sw-resize" />
            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-white border border-blue-500 pointer-events-auto cursor-w-resize" />
          </div>
        )
      })}
    </div>
  )
}

export default CanvasOverlay
