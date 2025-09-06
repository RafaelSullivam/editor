import React, { useState } from 'react'
import type { Shadow } from '../types/layout'

interface ShadowEditorProps {
  shadows: Shadow[]
  onChange: (shadows: Shadow[]) => void
  onClose: () => void
}

export const ShadowEditor: React.FC<ShadowEditorProps> = ({
  shadows,
  onChange,
  onClose
}) => {
  const [currentShadows, setCurrentShadows] = useState<Shadow[]>(
    shadows.length > 0 ? shadows : [{
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      spread: 0,
      color: 'rgba(0,0,0,0.3)',
      inset: false
    }]
  )

  const handleShadowChange = (index: number, field: keyof Shadow, value: string | number | boolean) => {
    const newShadows = [...currentShadows]
    newShadows[index] = { ...newShadows[index], [field]: value }
    setCurrentShadows(newShadows)
  }

  const addShadow = () => {
    const newShadow: Shadow = {
      offsetX: 0,
      offsetY: 0,
      blur: 4,
      spread: 0,
      color: 'rgba(0,0,0,0.3)',
      inset: false
    }
    setCurrentShadows([...currentShadows, newShadow])
  }

  const removeShadow = (index: number) => {
    setCurrentShadows(currentShadows.filter((_: Shadow, i: number) => i !== index))
  }

  const generateBoxShadow = (shadow: Shadow) => {
    const inset = shadow.inset ? 'inset ' : ''
    return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
  }

  const generateCombinedBoxShadow = () => {
    return currentShadows.map(generateBoxShadow).join(', ')
  }

  const handleApply = () => {
    onChange(currentShadows)
    onClose()
  }

  const handleClear = () => {
    onChange([])
    onClose()
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-brightness-high me-2"></i>
              Editor de Sombras
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Preview */}
            <div className="mb-4">
              <label className="form-label fw-bold">Preview</label>
              <div className="d-flex justify-content-center p-4" style={{ backgroundColor: '#f8f9fa' }}>
                <div
                  className="rounded bg-white border"
                  style={{
                    width: '120px',
                    height: '80px',
                    boxShadow: generateCombinedBoxShadow()
                  }}
                ></div>
              </div>
            </div>

            {/* Lista de sombras */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label fw-bold mb-0">Sombras</label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={addShadow}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Adicionar Sombra
                </button>
              </div>
              
              {currentShadows.map((shadow: Shadow, index: number) => (
                <div key={index} className="card mb-3">
                  <div className="card-header d-flex justify-content-between align-items-center py-2">
                    <span className="fw-bold">Sombra {index + 1}</span>
                    <div className="btn-group btn-group-sm">
                      <div className="form-check form-switch me-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`inset-${index}`}
                          checked={shadow.inset}
                          onChange={(e) => handleShadowChange(index, 'inset', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`inset-${index}`}>
                          Interna
                        </label>
                      </div>
                      {currentShadows.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeShadow(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="row g-3">
                      {/* Offset X */}
                      <div className="col-md-3">
                        <label className="form-label">Offset X</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={shadow.offsetX}
                            onChange={(e) => handleShadowChange(index, 'offsetX', parseFloat(e.target.value) || 0)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                      
                      {/* Offset Y */}
                      <div className="col-md-3">
                        <label className="form-label">Offset Y</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={shadow.offsetY}
                            onChange={(e) => handleShadowChange(index, 'offsetY', parseFloat(e.target.value) || 0)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                      
                      {/* Blur */}
                      <div className="col-md-3">
                        <label className="form-label">Desfoque</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            value={shadow.blur}
                            onChange={(e) => handleShadowChange(index, 'blur', parseFloat(e.target.value) || 0)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                      
                      {/* Spread */}
                      <div className="col-md-3">
                        <label className="form-label">Expansão</label>
                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            value={shadow.spread}
                            onChange={(e) => handleShadowChange(index, 'spread', parseFloat(e.target.value) || 0)}
                          />
                          <span className="input-group-text">px</span>
                        </div>
                      </div>
                      
                      {/* Color */}
                      <div className="col-12">
                        <label className="form-label">Cor</label>
                        <div className="row">
                          <div className="col-3">
                            <input
                              type="color"
                              className="form-control form-control-color"
                              value={shadow.color.startsWith('#') ? shadow.color : '#000000'}
                              onChange={(e) => handleShadowChange(index, 'color', e.target.value)}
                            />
                          </div>
                          <div className="col-9">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="rgba(0,0,0,0.3)"
                              value={shadow.color}
                              onChange={(e) => handleShadowChange(index, 'color', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview da sombra individual */}
                    <div className="mt-3">
                      <small className="text-muted">Preview individual:</small>
                      <div className="d-flex justify-content-center p-2" style={{ backgroundColor: '#f8f9fa' }}>
                        <div
                          className="rounded bg-white border"
                          style={{
                            width: '60px',
                            height: '40px',
                            boxShadow: generateBoxShadow(shadow)
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* CSS Output */}
            <div className="mb-3">
              <label className="form-label fw-bold">CSS Gerado</label>
              <textarea
                className="form-control font-monospace"
                rows={3}
                readOnly
                value={`box-shadow: ${generateCombinedBoxShadow()};`}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-danger" onClick={handleClear}>
              <i className="bi bi-trash me-1"></i>
              Limpar Sombras
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
