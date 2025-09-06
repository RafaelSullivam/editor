import React, { useState, useRef, useEffect } from 'react'
import type { TableCell } from '../types/layout'

interface CellEditorProps {
  cell: TableCell
  isActive: boolean
  onSave: (cell: TableCell) => void
  onCancel: () => void
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void
}

export const CellEditor: React.FC<CellEditorProps> = ({ 
  cell, 
  isActive, 
  onSave, 
  onCancel, 
  onNavigate 
}) => {
  const [localCell, setLocalCell] = useState<TableCell>(cell)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setLocalCell(cell)
  }, [cell])

  useEffect(() => {
    if (isActive && isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isActive, isEditing])

  const handleDoubleClick = () => {
    if (localCell.editable) {
      setIsEditing(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Enter: quebra de linha
          return
        }
        e.preventDefault()
        handleSave()
        onNavigate?.('down')
        break
      
      case 'Tab':
        e.preventDefault()
        handleSave()
        onNavigate?.(e.shiftKey ? 'left' : 'right')
        break
      
      case 'Escape':
        e.preventDefault()
        handleCancel()
        break
      
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (!isEditing) {
          e.preventDefault()
          const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right'
          onNavigate?.(direction)
        }
        break
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    onSave(localCell)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setLocalCell(cell)
    onCancel()
  }

  const handleContentChange = (value: string) => {
    setLocalCell(prev => ({ ...prev, content: value }))
  }

  const formatDisplayValue = (value: string, type: TableCell['type']): string => {
    if (!value) return ''
    
    switch (type) {
      case 'number':
        const num = parseFloat(value)
        return isNaN(num) ? value : num.toLocaleString('pt-BR')
      
      case 'currency':
        const currency = parseFloat(value)
        return isNaN(currency) ? value : currency.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      
      case 'percentage':
        const percent = parseFloat(value)
        return isNaN(percent) ? value : `${percent}%`
      
      case 'date':
        const date = new Date(value)
        return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR')
      
      default:
        return value
    }
  }

  const getCellStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {
      padding: `${localCell.style?.padding || 4}px`,
      backgroundColor: localCell.style?.backgroundColor || 'transparent',
      color: localCell.style?.color || 'inherit',
      fontSize: localCell.style?.fontSize ? `${localCell.style.fontSize}px` : 'inherit',
      fontWeight: localCell.style?.fontWeight || 'normal',
      fontStyle: localCell.style?.fontStyle || 'normal',
      textAlign: localCell.style?.textAlign || 'left',
      verticalAlign: localCell.style?.verticalAlign || 'top',
      border: localCell.style?.borderWidth 
        ? `${localCell.style.borderWidth}px solid ${localCell.style.borderColor || '#ddd'}`
        : undefined,
      cursor: localCell.editable ? 'text' : 'default',
      position: 'relative',
      minHeight: '20px',
      width: '100%',
      height: '100%'
    }

    if (isActive && !isEditing) {
      style.outline = '2px solid #007bff'
      style.outlineOffset = '-2px'
    }

    return style
  }

  const getValidationError = (): string | null => {
    if (!localCell.validation || !localCell.content) return null
    
    const { validation, content } = localCell
    
    if (validation.required && !content.trim()) {
      return validation.customMessage || 'Campo obrigatório'
    }
    
    if (validation.pattern && !new RegExp(validation.pattern).test(content)) {
      return validation.customMessage || 'Formato inválido'
    }
    
    if (localCell.type === 'number') {
      const num = parseFloat(content)
      if (isNaN(num)) {
        return 'Deve ser um número válido'
      }
      
      if (validation.minValue !== undefined && num < validation.minValue) {
        return `Valor mínimo: ${validation.minValue}`
      }
      
      if (validation.maxValue !== undefined && num > validation.maxValue) {
        return `Valor máximo: ${validation.maxValue}`
      }
    }
    
    return null
  }

  const validationError = getValidationError()
  const displayValue = isEditing ? localCell.content : formatDisplayValue(localCell.content, localCell.type)

  return (
    <div
      style={getCellStyle()}
      onClick={() => !isEditing && localCell.editable && setIsEditing(true)}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isActive ? 0 : -1}
      className={`cell-editor ${isActive ? 'active' : ''} ${validationError ? 'is-invalid' : ''}`}
    >
      {isEditing && localCell.editable ? (
        localCell.content.length > 50 ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localCell.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'inherit'
            }}
            placeholder="Digite o conteúdo..."
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={localCell.type === 'number' ? 'number' : 'text'}
            value={localCell.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              color: 'inherit'
            }}
            placeholder="Digite o conteúdo..."
          />
        )
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: localCell.content.includes('\n') ? 'pre-wrap' : 'nowrap'
          }}
          title={localCell.content}
        >
          {displayValue || (
            <span style={{ color: '#999', fontStyle: 'italic' }}>
              {localCell.editable ? 'Clique para editar' : 'Vazio'}
            </span>
          )}
        </div>
      )}
      
      {/* Indicador de erro de validação */}
      {validationError && (
        <div
          className="position-absolute top-0 end-0"
          style={{
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderTop: '8px solid #dc3545'
          }}
          title={validationError}
        />
      )}
      
      {/* Indicador de fórmula */}
      {localCell.formula && (
        <div
          className="position-absolute bottom-0 start-0"
          style={{
            fontSize: '10px',
            color: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            padding: '1px 3px',
            borderRadius: '2px'
          }}
          title={`Fórmula: ${localCell.formula}`}
        >
          fx
        </div>
      )}
      
      {/* Indicador de dados vinculados */}
      {localCell.dataBinding && (
        <div
          className="position-absolute top-0 start-0"
          style={{
            fontSize: '10px',
            color: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            padding: '1px 3px',
            borderRadius: '2px'
          }}
          title="Célula vinculada a dados"
        >
          🔗
        </div>
      )}
    </div>
  )
}

// Estilos CSS adicionais (seriam incluídos em um arquivo CSS)
export const cellEditorStyles = `
.cell-editor {
  transition: all 0.2s ease;
}

.cell-editor:hover:not(.active) {
  background-color: rgba(0, 123, 255, 0.05) !important;
}

.cell-editor.active {
  z-index: 10;
}

.cell-editor.is-invalid {
  background-color: rgba(220, 53, 69, 0.1) !important;
}
`
