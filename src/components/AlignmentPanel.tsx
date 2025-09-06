import React from 'react'
import { useEditorStore } from '../store/editor'

interface AlignmentPanelProps {
  onClose: () => void
}

export const AlignmentPanel: React.FC<AlignmentPanelProps> = ({ onClose }) => {
  const { 
    getSelectedElements, 
    alignElements, 
    distributeElements, 
    alignToPage 
  } = useEditorStore()

  const selectedElements = getSelectedElements()
  const hasSelection = selectedElements.length > 0
  const canAlign = selectedElements.length >= 2
  const canDistribute = selectedElements.length >= 3

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-distribute-horizontal me-2"></i>
              Ferramentas de Alinhamento
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {!hasSelection && (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Selecione um ou mais elementos para usar as ferramentas de alinhamento.
              </div>
            )}

            {hasSelection && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                {selectedElements.length} elemento(s) selecionado(s)
              </div>
            )}

            <div className="row">
              {/* Alinhamento entre Elementos */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-align-start me-2"></i>
                      Alinhar Elementos
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="card-text small text-muted mb-3">
                      Alinha elementos selecionados entre si (mínimo 2 elementos)
                    </p>

                    {/* Alinhamento Horizontal */}
                    <div className="mb-4">
                      <label className="form-label fw-bold small">Horizontal</label>
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => alignElements('left')}
                          disabled={!canAlign}
                          title="Alinhar à esquerda"
                        >
                          <i className="bi bi-align-start"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => alignElements('center')}
                          disabled={!canAlign}
                          title="Alinhar ao centro"
                        >
                          <i className="bi bi-align-center"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => alignElements('right')}
                          disabled={!canAlign}
                          title="Alinhar à direita"
                        >
                          <i className="bi bi-align-end"></i>
                        </button>
                      </div>
                    </div>

                    {/* Alinhamento Vertical */}
                    <div className="mb-3">
                      <label className="form-label fw-bold small">Vertical</label>
                      <div className="btn-group w-100" role="group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => alignElements('top')}
                          disabled={!canAlign}
                          title="Alinhar ao topo"
                        >
                          <i className="bi bi-align-top"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => alignElements('middle')}
                          disabled={!canAlign}
                          title="Alinhar ao meio"
                        >
                          <i className="bi bi-align-middle"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => alignElements('bottom')}
                          disabled={!canAlign}
                          title="Alinhar à base"
                        >
                          <i className="bi bi-align-bottom"></i>
                        </button>
                      </div>
                    </div>

                    {!canAlign && hasSelection && (
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Selecione pelo menos 2 elementos para alinhar
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Distribuição */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-distribute-horizontal me-2"></i>
                      Distribuir Elementos
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="card-text small text-muted mb-3">
                      Distribui elementos uniformemente (mínimo 3 elementos)
                    </p>

                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
                        onClick={() => distributeElements('horizontal')}
                        disabled={!canDistribute}
                      >
                        <i className="bi bi-distribute-horizontal me-2"></i>
                        Distribuir Horizontalmente
                      </button>
                      
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm d-flex align-items-center justify-content-center"
                        onClick={() => distributeElements('vertical')}
                        disabled={!canDistribute}
                      >
                        <i className="bi bi-distribute-vertical me-2"></i>
                        Distribuir Verticalmente
                      </button>
                    </div>

                    {!canDistribute && hasSelection && (
                      <small className="text-muted mt-2 d-block">
                        <i className="bi bi-info-circle me-1"></i>
                        Selecione pelo menos 3 elementos para distribuir
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Alinhamento à Página */}
            <div className="row mt-3">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-layout-text-window-reverse me-2"></i>
                      Alinhar à Página
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="card-text small text-muted mb-3">
                      Alinha elementos selecionados em relação à página atual
                    </p>

                    <div className="row">
                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Horizontal</label>
                        <div className="btn-group w-100 mb-3" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={() => alignToPage('left')}
                            disabled={!hasSelection}
                            title="Alinhar à margem esquerda"
                          >
                            <i className="bi bi-align-start"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={() => alignToPage('center')}
                            disabled={!hasSelection}
                            title="Centralizar na página"
                          >
                            <i className="bi bi-align-center"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={() => alignToPage('right')}
                            disabled={!hasSelection}
                            title="Alinhar à margem direita"
                          >
                            <i className="bi bi-align-end"></i>
                          </button>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-bold small">Vertical</label>
                        <div className="btn-group w-100 mb-3" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={() => alignToPage('top')}
                            disabled={!hasSelection}
                            title="Alinhar ao topo da página"
                          >
                            <i className="bi bi-align-top"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={() => alignToPage('middle')}
                            disabled={!hasSelection}
                            title="Centralizar verticalmente"
                          >
                            <i className="bi bi-align-middle"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-info btn-sm"
                            onClick={() => alignToPage('bottom')}
                            disabled={!hasSelection}
                            title="Alinhar à base da página"
                          >
                            <i className="bi bi-align-bottom"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Atalhos de Teclado */}
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
                        <kbd>Ctrl</kbd> + <kbd>L</kbd> = Alinhar à esquerda<br/>
                        <kbd>Ctrl</kbd> + <kbd>E</kbd> = Centralizar<br/>
                        <kbd>Ctrl</kbd> + <kbd>R</kbd> = Alinhar à direita
                      </div>
                      <div className="col-md-4">
                        <kbd>Ctrl</kbd> + <kbd>T</kbd> = Alinhar ao topo<br/>
                        <kbd>Ctrl</kbd> + <kbd>M</kbd> = Alinhar ao meio<br/>
                        <kbd>Ctrl</kbd> + <kbd>B</kbd> = Alinhar à base
                      </div>
                      <div className="col-md-4">
                        <kbd>Ctrl</kbd> + <kbd>H</kbd> = Distribuir H<br/>
                        <kbd>Ctrl</kbd> + <kbd>V</kbd> = Distribuir V
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
