import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { GradientEditor } from './GradientEditor'
import { ShadowEditor } from './ShadowEditor'
import { AlignmentPanel } from './AlignmentPanel'
import { BorderEditor } from './BorderEditor'
import { GuidePanel } from './GuidePanel'
import type { AdvancedStyle, Gradient, Shadow } from '../types/layout'

interface AdvancedDesignPanelProps {
  onClose: () => void
}

export const AdvancedDesignPanel: React.FC<AdvancedDesignPanelProps> = ({
  onClose
}) => {
  const { getSelectedElements, updateElement } = useEditorStore()
  const [activeEditor, setActiveEditor] = useState<'gradient' | 'shadow' | 'border' | 'filters' | 'alignment' | 'guides' | null>(null)

  const selectedElements = getSelectedElements()
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null

  if (!selectedElement) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Design Avançado</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <i className="bi bi-info-circle text-warning fs-1 mb-3"></i>
              <p>Selecione um elemento para acessar as ferramentas de design avançado.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentStyle = selectedElement.advancedStyle || {}

  const handleGradientChange = (gradient: Gradient | undefined) => {
    const newStyle: AdvancedStyle = {
      ...currentStyle,
      gradient
    }
    updateElement(selectedElement.id, { advancedStyle: newStyle })
  }

  const handleShadowChange = (shadows: Shadow[]) => {
    console.log('AdvancedDesignPanel: Updating shadows for element', selectedElement?.id, shadows)
    const newStyle: AdvancedStyle = {
      ...currentStyle,
      shadows
    }
    console.log('AdvancedDesignPanel: New style object', newStyle)
    updateElement(selectedElement.id, { advancedStyle: newStyle })
  }

  const handleBorderChange = (border: any) => {
    const newStyle: AdvancedStyle = {
      ...currentStyle,
      border
    }
    updateElement(selectedElement.id, { advancedStyle: newStyle })
  }

  const handleFilterChange = (filterType: string, value: number) => {
    const currentFilters = currentStyle.filters || {
      blur: 0,
      brightness: 100,
      contrast: 100,
      saturate: 100,
      hueRotate: 0
    }
    
    const newFilters = {
      ...currentFilters,
      [filterType]: value
    }
    
    const newStyle: AdvancedStyle = {
      ...currentStyle,
      filters: newFilters
    }
    updateElement(selectedElement.id, { advancedStyle: newStyle })
  }

  const resetFilters = () => {
    const newStyle: AdvancedStyle = {
      ...currentStyle,
      filters: {
        blur: 0,
        brightness: 100,
        contrast: 100,
        saturate: 100,
        hueRotate: 0
      }
    }
    updateElement(selectedElement.id, { advancedStyle: newStyle })
  }

  const clearAllStyles = () => {
    updateElement(selectedElement.id, { advancedStyle: undefined })
  }

  const generateFilterCSS = () => {
    if (!currentStyle.filters) return 'none'
    
    const filters = []
    const f = currentStyle.filters
    
    if (f.blur > 0) filters.push(`blur(${f.blur}px)`)
    if (f.brightness !== 100) filters.push(`brightness(${f.brightness}%)`)
    if (f.contrast !== 100) filters.push(`contrast(${f.contrast}%)`)
    if (f.saturate !== 100) filters.push(`saturate(${f.saturate}%)`)
    if (f.hueRotate !== 0) filters.push(`hue-rotate(${f.hueRotate}deg)`)
    
    return filters.length > 0 ? filters.join(' ') : 'none'
  }

  return (
    <>
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-palette me-2"></i>
                Design Avançado - {selectedElement.name}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            
            <div className="modal-body">
              <div className="row">
                {/* Painel de Ferramentas */}
                <div className="col-md-4">
                  <h6 className="fw-bold mb-3">Ferramentas</h6>
                  
                  {/* Gradientes */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-palette me-2"></i>
                        Gradientes
                      </h6>
                      <p className="card-text small text-muted">
                        Adicione gradientes lineares ou radiais
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setActiveEditor('gradient')}
                      >
                        {currentStyle.gradient ? 'Editar Gradiente' : 'Adicionar Gradiente'}
                      </button>
                      {currentStyle.gradient && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm ms-2"
                          onClick={() => handleGradientChange(undefined)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sombras */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-brightness-high me-2"></i>
                        Sombras
                      </h6>
                      <p className="card-text small text-muted">
                        Configure sombras externas e internas
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setActiveEditor('shadow')}
                      >
                        {currentStyle.shadows?.length ? 'Editar Sombras' : 'Adicionar Sombras'}
                      </button>
                      {currentStyle.shadows?.length && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm ms-2"
                          onClick={() => handleShadowChange([])}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bordas */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-border-style me-2"></i>
                        Bordas Avançadas
                      </h6>
                      <p className="card-text small text-muted">
                        Configure bordas com estilos e cantos personalizados
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setActiveEditor('border')}
                      >
                        {currentStyle.border ? 'Editar Bordas' : 'Adicionar Bordas'}
                      </button>
                      {currentStyle.border && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm ms-2"
                          onClick={() => handleBorderChange(undefined)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alinhamento */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-distribute-horizontal me-2"></i>
                        Alinhamento
                      </h6>
                      <p className="card-text small text-muted">
                        Ferramentas de alinhamento e distribuição
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setActiveEditor('alignment')}
                      >
                        Abrir Ferramentas
                      </button>
                    </div>
                  </div>

                  {/* Guides e Snap */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-rulers me-2"></i>
                        Guides e Snap
                      </h6>
                      <p className="card-text small text-muted">
                        Magnetismo e guias de alinhamento visual
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-info btn-sm"
                        onClick={() => setActiveEditor('guides')}
                      >
                        Configurar Guides
                      </button>
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="card mb-3">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-sliders me-2"></i>
                        Filtros
                      </h6>
                      
                      {/* Blur */}
                      <div className="mb-3">
                        <label className="form-label small">Desfoque</label>
                        <div className="row align-items-center">
                          <div className="col-8">
                            <input
                              type="range"
                              className="form-range"
                              min="0"
                              max="20"
                              step="0.1"
                              value={currentStyle.filters?.blur || 0}
                              onChange={(e) => handleFilterChange('blur', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="col-4">
                            <span className="small">{currentStyle.filters?.blur || 0}px</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Brightness */}
                      <div className="mb-3">
                        <label className="form-label small">Brilho</label>
                        <div className="row align-items-center">
                          <div className="col-8">
                            <input
                              type="range"
                              className="form-range"
                              min="0"
                              max="200"
                              value={currentStyle.filters?.brightness || 100}
                              onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="col-4">
                            <span className="small">{currentStyle.filters?.brightness || 100}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contrast */}
                      <div className="mb-3">
                        <label className="form-label small">Contraste</label>
                        <div className="row align-items-center">
                          <div className="col-8">
                            <input
                              type="range"
                              className="form-range"
                              min="0"
                              max="200"
                              value={currentStyle.filters?.contrast || 100}
                              onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="col-4">
                            <span className="small">{currentStyle.filters?.contrast || 100}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Saturate */}
                      <div className="mb-3">
                        <label className="form-label small">Saturação</label>
                        <div className="row align-items-center">
                          <div className="col-8">
                            <input
                              type="range"
                              className="form-range"
                              min="0"
                              max="200"
                              value={currentStyle.filters?.saturate || 100}
                              onChange={(e) => handleFilterChange('saturate', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="col-4">
                            <span className="small">{currentStyle.filters?.saturate || 100}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hue Rotate */}
                      <div className="mb-3">
                        <label className="form-label small">Matiz</label>
                        <div className="row align-items-center">
                          <div className="col-8">
                            <input
                              type="range"
                              className="form-range"
                              min="0"
                              max="360"
                              value={currentStyle.filters?.hueRotate || 0}
                              onChange={(e) => handleFilterChange('hueRotate', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="col-4">
                            <span className="small">{currentStyle.filters?.hueRotate || 0}°</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={resetFilters}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Resetar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Painel de Preview */}
                <div className="col-md-8">
                  <h6 className="fw-bold mb-3">Preview</h6>
                  
                  <div className="card">
                    <div className="card-body text-center" style={{ backgroundColor: '#f8f9fa', minHeight: '300px' }}>
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <div
                          className="border bg-white rounded p-4"
                          style={{
                            width: '200px',
                            height: '150px',
                            background: currentStyle.gradient ? (() => {
                              if (currentStyle.gradient.type === 'linear') {
                                const stops = currentStyle.gradient.stops
                                  .map((stop: any) => `${stop.color} ${stop.position}%`)
                                  .join(', ')
                                return `linear-gradient(${currentStyle.gradient.angle}deg, ${stops})`
                              } else {
                                const stops = currentStyle.gradient.stops
                                  .map((stop: any) => `${stop.color} ${stop.position}%`)
                                  .join(', ')
                                return `radial-gradient(circle at ${currentStyle.gradient.centerX}% ${currentStyle.gradient.centerY}%, ${stops})`
                              }
                            })() : '#ffffff',
                            boxShadow: currentStyle.shadows?.length ? 
                              currentStyle.shadows.map((shadow: any) => {
                                const inset = shadow.inset ? 'inset ' : ''
                                return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
                              }).join(', ') : 'none',
                            filter: generateFilterCSS()
                          }}
                        >
                          <div className="d-flex justify-content-center align-items-center h-100">
                            <span className="text-dark">Preview</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* CSS Output */}
                  <div className="mt-3">
                    <h6 className="fw-bold">CSS Gerado</h6>
                    <textarea
                      className="form-control font-monospace"
                      rows={6}
                      readOnly
                      value={`/* Gradiente */
background: ${currentStyle.gradient ? (() => {
  if (currentStyle.gradient.type === 'linear') {
    const stops = currentStyle.gradient.stops
      .map((stop: any) => `${stop.color} ${stop.position}%`)
      .join(', ')
    return `linear-gradient(${currentStyle.gradient.angle}deg, ${stops})`
  } else {
    const stops = currentStyle.gradient.stops
      .map((stop: any) => `${stop.color} ${stop.position}%`)
      .join(', ')
    return `radial-gradient(circle at ${currentStyle.gradient.centerX}% ${currentStyle.gradient.centerY}%, ${stops})`
  }
})() : '#ffffff'};

/* Sombras */
box-shadow: ${currentStyle.shadows?.length ? 
  currentStyle.shadows.map((shadow: any) => {
    const inset = shadow.inset ? 'inset ' : ''
    return `${inset}${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
  }).join(', ') : 'none'};

/* Filtros */
filter: ${generateFilterCSS()};`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={clearAllStyles}
              >
                <i className="bi bi-trash me-1"></i>
                Limpar Tudo
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editores Modal */}
      {activeEditor === 'gradient' && (
        <GradientEditor
          gradient={currentStyle.gradient}
          onChange={handleGradientChange}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'shadow' && (
        <ShadowEditor
          shadows={currentStyle.shadows || []}
          onChange={handleShadowChange}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'border' && (
        <BorderEditor
          border={currentStyle.border}
          onChange={handleBorderChange}
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'alignment' && (
        <AlignmentPanel
          onClose={() => setActiveEditor(null)}
        />
      )}

      {activeEditor === 'guides' && (
        <GuidePanel
          onClose={() => setActiveEditor(null)}
        />
      )}
    </>
  )
}
