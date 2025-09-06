import React, { useState } from 'react'
import { useDynamicData } from '../hooks/useDynamicData'

interface DynamicPreviewProps {
  onClose: () => void
}

export const DynamicPreview: React.FC<DynamicPreviewProps> = ({ onClose }) => {
  const {
    totalDataRecords,
    hasDynamicElements,
    processCurrentPageElements,
    setDataIndex
  } = useDynamicData()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [previewElements, setPreviewElements] = useState<any[]>([])

  React.useEffect(() => {
    if (hasDynamicElements && totalDataRecords > 0) {
      const elements = processCurrentPageElements(currentIndex)
      setPreviewElements(elements)
    }
  }, [currentIndex, hasDynamicElements, totalDataRecords, processCurrentPageElements])

  const handleIndexChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < totalDataRecords) {
      setCurrentIndex(newIndex)
      setDataIndex(newIndex)
    }
  }

  if (!hasDynamicElements) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-eye me-2"></i>
                Preview Dinâmico
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nenhum elemento dinâmico encontrado. Crie elementos com variáveis para visualizar o preview.
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

  if (totalDataRecords === 0) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-eye me-2"></i>
                Preview Dinâmico
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Nenhum dado encontrado. Adicione dados às suas fontes para visualizar o preview.
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

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-eye me-2"></i>
              Preview Dinâmico
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Controles de navegação */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="d-flex align-items-center">
                  <label className="form-label me-3 mb-0">Registro:</label>
                  <div className="input-group" style={{ width: '200px' }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleIndexChange(currentIndex - 1)}
                      disabled={currentIndex === 0}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={currentIndex + 1}
                      min={1}
                      max={totalDataRecords}
                      onChange={(e) => {
                        const newIndex = parseInt(e.target.value) - 1
                        if (!isNaN(newIndex)) {
                          handleIndexChange(newIndex)
                        }
                      }}
                    />
                    <span className="input-group-text">de {totalDataRecords}</span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => handleIndexChange(currentIndex + 1)}
                      disabled={currentIndex === totalDataRecords - 1}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 text-end">
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleIndexChange(0)}
                    disabled={currentIndex === 0}
                  >
                    <i className="bi bi-skip-start"></i>
                    Primeiro
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => handleIndexChange(totalDataRecords - 1)}
                    disabled={currentIndex === totalDataRecords - 1}
                  >
                    Último
                    <i className="bi bi-skip-end"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview dos elementos */}
            <div className="border rounded p-4 bg-light" style={{ minHeight: '400px' }}>
              <h6 className="fw-bold mb-3">Preview dos Elementos</h6>
              
              {previewElements.length === 0 ? (
                <div className="text-center text-muted">
                  <i className="bi bi-file-text display-1 opacity-25"></i>
                  <p>Carregando preview...</p>
                </div>
              ) : (
                <div className="row">
                  {previewElements.map((element) => (
                    <div key={element.id} className="col-md-6 mb-3">
                      <div className="card">
                        <div className="card-header d-flex justify-content-between">
                          <small className="text-muted">{element.type.toUpperCase()}</small>
                          <small className="text-muted">{element.name}</small>
                        </div>
                        <div className="card-body">
                          {element.type === 'text' && (
                            <div>
                              <p 
                                className="mb-0" 
                                style={{
                                  fontSize: `${element.fontSize}px`,
                                  fontFamily: element.fontFamily,
                                  fontWeight: element.fontWeight,
                                  color: element.color,
                                  textAlign: element.textAlign,
                                  lineHeight: element.lineHeight,
                                  letterSpacing: `${element.letterSpacing}px`,
                                  textDecoration: element.textDecoration
                                }}
                              >
                                {element.content}
                              </p>
                              {element.isDynamic && (
                                <small className="text-success">
                                  <i className="bi bi-lightning-charge me-1"></i>
                                  Conteúdo dinâmico
                                </small>
                              )}
                            </div>
                          )}
                          
                          {element.type === 'image' && (
                            <div>
                              <img 
                                src={element.src} 
                                alt={element.alt}
                                className="img-fluid"
                                style={{ maxHeight: '100px' }}
                              />
                              <br />
                              <small className="text-muted">Imagem: {element.alt}</small>
                            </div>
                          )}
                          
                          {element.type === 'rectangle' && (
                            <div>
                              <div 
                                style={{
                                  width: '100%',
                                  height: '50px',
                                  backgroundColor: element.backgroundColor,
                                  border: `${element.borderWidth}px ${element.borderStyle} ${element.borderColor}`,
                                  borderRadius: `${element.borderRadius}px`
                                }}
                              ></div>
                              <small className="text-muted">Retângulo</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="alert alert-info mt-3">
              <i className="bi bi-lightbulb me-2"></i>
              <strong>Dica:</strong> Use os controles acima para navegar entre diferentes registros de dados e ver como o conteúdo dinâmico muda.
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
