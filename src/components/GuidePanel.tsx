import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { v4 as uuidv4 } from 'uuid'
import type { Guide, SnapSettings } from '../types/layout'

interface GuidePanelProps {
  onClose: () => void
}

export const GuidePanel: React.FC<GuidePanelProps> = ({ onClose }) => {
  const { currentPage, updatePage } = useEditorStore()
  const [newGuideType, setNewGuideType] = useState<'horizontal' | 'vertical'>('horizontal')
  const [newGuidePosition, setNewGuidePosition] = useState<number>(100)

  if (!currentPage) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Guides e Snap</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <p>Nenhuma página ativa encontrada.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const guides = currentPage.guides || []
  const snapSettings = currentPage.snapSettings || {
    snapToGrid: false,
    snapToElements: true,
    snapToGuides: true,
    snapThreshold: 5,
    showSnapLines: true
  }

  const handleAddGuide = () => {
    const newGuide: Guide = {
      id: uuidv4(),
      type: newGuideType,
      position: newGuidePosition,
      color: '#007bff',
      visible: true
    }

    updatePage(currentPage.id, {
      guides: [...guides, newGuide]
    })
  }

  const handleRemoveGuide = (guideId: string) => {
    updatePage(currentPage.id, {
      guides: guides.filter(g => g.id !== guideId)
    })
  }

  const handleSnapSettingChange = (setting: keyof SnapSettings, value: boolean | number) => {
    updatePage(currentPage.id, {
      snapSettings: {
        ...snapSettings,
        [setting]: value
      }
    })
  }

  const clearAllGuides = () => {
    updatePage(currentPage.id, { guides: [] })
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-rulers me-2"></i>
              Guides e Magnetismo
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              {/* Configurações de Snap */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-magnet me-2"></i>
                      Configurações de Magnetismo
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="snapToGrid"
                        checked={snapSettings.snapToGrid}
                        onChange={(e) => handleSnapSettingChange('snapToGrid', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="snapToGrid">
                        <strong>Magnetismo à Grade</strong><br/>
                        <small className="text-muted">Elementos se alinham à grade quando movidos</small>
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="snapToElements"
                        checked={snapSettings.snapToElements}
                        onChange={(e) => handleSnapSettingChange('snapToElements', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="snapToElements">
                        <strong>Magnetismo entre Elementos</strong><br/>
                        <small className="text-muted">Elementos se alinham uns aos outros</small>
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="snapToGuides"
                        checked={snapSettings.snapToGuides}
                        onChange={(e) => handleSnapSettingChange('snapToGuides', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="snapToGuides">
                        <strong>Magnetismo aos Guides</strong><br/>
                        <small className="text-muted">Elementos se alinham aos guides</small>
                      </label>
                    </div>

                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="showSnapLines"
                        checked={snapSettings.showSnapLines}
                        onChange={(e) => handleSnapSettingChange('showSnapLines', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="showSnapLines">
                        <strong>Mostrar Linhas de Snap</strong><br/>
                        <small className="text-muted">Exibir linhas visuais durante alinhamento</small>
                      </label>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="snapThreshold" className="form-label">
                        <strong>Sensibilidade do Magnetismo</strong>
                      </label>
                      <div className="row align-items-center">
                        <div className="col-8">
                          <input
                            type="range"
                            className="form-range"
                            id="snapThreshold"
                            min="1"
                            max="20"
                            value={snapSettings.snapThreshold}
                            onChange={(e) => handleSnapSettingChange('snapThreshold', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="col-4">
                          <span className="small">{snapSettings.snapThreshold}px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gerenciamento de Guides */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-rulers me-2"></i>
                      Guides de Alinhamento
                    </h6>
                  </div>
                  <div className="card-body">
                    {/* Adicionar Guide */}
                    <div className="mb-4">
                      <h6 className="fw-bold">Adicionar Guide</h6>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <select
                            className="form-select form-select-sm"
                            value={newGuideType}
                            onChange={(e) => setNewGuideType(e.target.value as 'horizontal' | 'vertical')}
                          >
                            <option value="horizontal">Horizontal</option>
                            <option value="vertical">Vertical</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <div className="input-group input-group-sm">
                            <input
                              type="number"
                              className="form-control"
                              value={newGuidePosition}
                              onChange={(e) => setNewGuidePosition(parseInt(e.target.value) || 0)}
                              placeholder="Posição"
                            />
                            <span className="input-group-text">px</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm w-100"
                        onClick={handleAddGuide}
                      >
                        <i className="bi bi-plus-circle me-1"></i>
                        Adicionar Guide
                      </button>
                    </div>

                    {/* Lista de Guides */}
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="fw-bold mb-0">Guides Ativos ({guides.length})</h6>
                        {guides.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={clearAllGuides}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        )}
                      </div>

                      {guides.length === 0 ? (
                        <p className="text-muted small">Nenhum guide adicionado</p>
                      ) : (
                        <div className="list-group list-group-flush" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          {guides.map((guide: Guide) => (
                            <div key={guide.id} className="list-group-item px-0 py-2">
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <span className={`badge ${guide.type === 'horizontal' ? 'bg-primary' : 'bg-success'} me-2`}>
                                    {guide.type === 'horizontal' ? '═' : '║'}
                                  </span>
                                  <span className="small">
                                    {guide.type === 'horizontal' ? 'H' : 'V'}: {guide.position}px
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveGuide(guide.id)}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Atalhos */}
            <div className="row mt-3">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body py-2">
                    <h6 className="card-title mb-2">
                      <i className="bi bi-keyboard me-2"></i>
                      Atalhos de Teclado
                    </h6>
                    <div className="row small">
                      <div className="col-md-4">
                        <kbd>Ctrl</kbd> + <kbd>;</kbd> = Toggle Guides<br/>
                        <kbd>Ctrl</kbd> + <kbd>'</kbd> = Toggle Grid
                      </div>
                      <div className="col-md-4">
                        <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>;</kbd> = Toggle Snap<br/>
                        <kbd>Alt</kbd> + Arrastar = Ignorar Snap
                      </div>
                      <div className="col-md-4">
                        Clique duplo na régua = Adicionar Guide<br/>
                        Arrastar Guide = Mover posição
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
