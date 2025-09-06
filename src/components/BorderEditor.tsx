import React, { useState } from 'react'
import type { AdvancedBorder } from '../types/layout'

interface BorderEditorProps {
  border?: AdvancedBorder
  onChange: (border: AdvancedBorder | undefined) => void
  onClose: () => void
}

export const BorderEditor: React.FC<BorderEditorProps> = ({
  border,
  onChange,
  onClose
}) => {
  const [currentBorder, setCurrentBorder] = useState<AdvancedBorder>(
    border || {
      width: 1,
      color: '#000000',
      style: 'solid',
      radius: {
        topLeft: 0,
        topRight: 0,
        bottomLeft: 0,
        bottomRight: 0,
      },
      gradient: undefined
    }
  )

  const [linkedRadius, setLinkedRadius] = useState(true)

  const borderStyles = [
    { value: 'solid', label: 'Sólida', preview: '────────' },
    { value: 'dashed', label: 'Tracejada', preview: '─ ─ ─ ─ ─' },
    { value: 'dotted', label: 'Pontilhada', preview: '· · · · · · ·' },
    { value: 'double', label: 'Dupla', preview: '═══════' },
    { value: 'groove', label: 'Sulco', preview: '▒▒▒▒▒▒▒' },
    { value: 'ridge', label: 'Crista', preview: '░░░░░░░' },
    { value: 'inset', label: 'Interna', preview: '▼▼▼▼▼▼▼' },
    { value: 'outset', label: 'Externa', preview: '▲▲▲▲▲▲▲' }
  ] as const

  const handleBorderChange = (field: keyof AdvancedBorder, value: any) => {
    setCurrentBorder(prev => ({ ...prev, [field]: value }))
  }

  const handleRadiusChange = (corner: keyof AdvancedBorder['radius'], value: number) => {
    if (linkedRadius) {
      // Aplicar o mesmo valor para todos os cantos
      setCurrentBorder(prev => ({
        ...prev,
        radius: {
          topLeft: value,
          topRight: value,
          bottomLeft: value,
          bottomRight: value,
        }
      }))
    } else {
      // Aplicar apenas ao canto específico
      setCurrentBorder(prev => ({
        ...prev,
        radius: {
          ...prev.radius,
          [corner]: value
        }
      }))
    }
  }

  const generateBorderCSS = () => {
    const parts = []
    
    // Border width, style, color
    if (currentBorder.width > 0) {
      parts.push(`border: ${currentBorder.width}px ${currentBorder.style} ${currentBorder.color};`)
    }
    
    // Border radius
    const { topLeft, topRight, bottomLeft, bottomRight } = currentBorder.radius
    if (topLeft > 0 || topRight > 0 || bottomLeft > 0 || bottomRight > 0) {
      parts.push(`border-radius: ${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px;`)
    }
    
    // Border gradient (if any)
    if (currentBorder.gradient) {
      if (currentBorder.gradient.type === 'linear') {
        const stops = currentBorder.gradient.stops
          .map((stop: any) => `${stop.color} ${stop.position}%`)
          .join(', ')
        parts.push(`border-image: linear-gradient(${currentBorder.gradient.angle}deg, ${stops}) 1;`)
      } else {
        const stops = currentBorder.gradient.stops
          .map((stop: any) => `${stop.color} ${stop.position}%`)
          .join(', ')
        parts.push(`border-image: radial-gradient(circle at ${currentBorder.gradient.centerX}% ${currentBorder.gradient.centerY}%, ${stops}) 1;`)
      }
    }
    
    return parts.join('\n')
  }

  const handleApply = () => {
    onChange(currentBorder)
    onClose()
  }

  const handleRemove = () => {
    onChange(undefined)
    onClose()
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-border-style me-2"></i>
              Editor de Bordas
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Preview */}
            <div className="mb-4">
              <label className="form-label fw-bold">Preview</label>
              <div className="d-flex justify-content-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <div
                  className="bg-white"
                  style={{
                    width: '200px',
                    height: '120px',
                    border: currentBorder.width > 0 ? `${currentBorder.width}px ${currentBorder.style} ${currentBorder.color}` : 'none',
                    borderRadius: `${currentBorder.radius.topLeft}px ${currentBorder.radius.topRight}px ${currentBorder.radius.bottomRight}px ${currentBorder.radius.bottomLeft}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666'
                  }}
                >
                  Preview
                </div>
              </div>
            </div>

            <div className="row">
              {/* Configurações Básicas */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">Configurações Básicas</h6>
                  </div>
                  <div className="card-body">
                    {/* Largura */}
                    <div className="mb-3">
                      <label className="form-label">Largura</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="50"
                          value={currentBorder.width}
                          onChange={(e) => handleBorderChange('width', parseInt(e.target.value) || 0)}
                        />
                        <span className="input-group-text">px</span>
                      </div>
                    </div>

                    {/* Cor */}
                    <div className="mb-3">
                      <label className="form-label">Cor</label>
                      <div className="row">
                        <div className="col-4">
                          <input
                            type="color"
                            className="form-control form-control-color"
                            value={currentBorder.color}
                            onChange={(e) => handleBorderChange('color', e.target.value)}
                          />
                        </div>
                        <div className="col-8">
                          <input
                            type="text"
                            className="form-control"
                            value={currentBorder.color}
                            onChange={(e) => handleBorderChange('color', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Estilo */}
                    <div className="mb-3">
                      <label className="form-label">Estilo</label>
                      <div className="row">
                        {borderStyles.map((style) => (
                          <div key={style.value} className="col-6 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="borderStyle"
                                id={`style-${style.value}`}
                                checked={currentBorder.style === style.value}
                                onChange={() => handleBorderChange('style', style.value)}
                              />
                              <label className="form-check-label" htmlFor={`style-${style.value}`}>
                                <div className="d-flex align-items-center">
                                  <code className="me-2 small">{style.preview}</code>
                                  <span className="small">{style.label}</span>
                                </div>
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cantos Arredondados */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0 d-flex justify-content-between align-items-center">
                      Cantos Arredondados
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="linkedRadius"
                          checked={linkedRadius}
                          onChange={(e) => setLinkedRadius(e.target.checked)}
                        />
                        <label className="form-check-label small" htmlFor="linkedRadius">
                          Vincular
                        </label>
                      </div>
                    </h6>
                  </div>
                  <div className="card-body">
                    {linkedRadius ? (
                      // Controle único para todos os cantos
                      <div className="mb-3">
                        <label className="form-label">Raio dos Cantos</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max="100"
                            value={currentBorder.radius.topLeft}
                            onChange={(e) => handleRadiusChange('topLeft', parseInt(e.target.value) || 0)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                    ) : (
                      // Controles individuais para cada canto
                      <div className="row">
                        <div className="col-6 mb-3">
                          <label className="form-label small">Superior Esquerdo</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max="100"
                              value={currentBorder.radius.topLeft}
                              onChange={(e) => handleRadiusChange('topLeft', parseInt(e.target.value) || 0)}
                            />
                            <span className="input-group-text">px</span>
                          </div>
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label small">Superior Direito</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max="100"
                              value={currentBorder.radius.topRight}
                              onChange={(e) => handleRadiusChange('topRight', parseInt(e.target.value) || 0)}
                            />
                            <span className="input-group-text">px</span>
                          </div>
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label small">Inferior Esquerdo</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max="100"
                              value={currentBorder.radius.bottomLeft}
                              onChange={(e) => handleRadiusChange('bottomLeft', parseInt(e.target.value) || 0)}
                            />
                            <span className="input-group-text">px</span>
                          </div>
                        </div>
                        <div className="col-6 mb-3">
                          <label className="form-label small">Inferior Direito</label>
                          <div className="input-group">
                            <input
                              type="number"
                              className="form-control"
                              min="0"
                              max="100"
                              value={currentBorder.radius.bottomRight}
                              onChange={(e) => handleRadiusChange('bottomRight', parseInt(e.target.value) || 0)}
                            />
                            <span className="input-group-text">px</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Visual dos cantos */}
                    <div className="text-center">
                      <div
                        className="border-2 border-primary bg-light mx-auto"
                        style={{
                          width: '80px',
                          height: '60px',
                          borderRadius: `${currentBorder.radius.topLeft}px ${currentBorder.radius.topRight}px ${currentBorder.radius.bottomRight}px ${currentBorder.radius.bottomLeft}px`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CSS Output */}
            <div className="mt-3">
              <label className="form-label fw-bold">CSS Gerado</label>
              <textarea
                className="form-control font-monospace"
                rows={4}
                readOnly
                value={generateBorderCSS()}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-danger" onClick={handleRemove}>
              <i className="bi bi-trash me-1"></i>
              Remover Borda
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleApply}>
              <i className="bi bi-check me-1"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
