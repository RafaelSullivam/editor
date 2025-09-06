import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import type { Element, DataBinding, DataSource, Variable } from '../types/layout'

interface VariableBindingProps {
  element: Element
  onClose: () => void
}

export const VariableBinding: React.FC<VariableBindingProps> = ({ element, onClose }) => {
  const { layout, updateElement } = useEditorStore()
  const [selectedSource, setSelectedSource] = useState<string>('')
  const [selectedVariable, setSelectedVariable] = useState<string>('')
  const [bindingType, setBindingType] = useState<'content' | 'property'>('content')
  const [propertyName, setPropertyName] = useState<string>('')

  if (!layout) return null

  const dataSources = layout.dataSources || []
  const selectedSourceData = dataSources.find(ds => ds.id === selectedSource)
  
  // Verifica se o elemento já tem binding
  const currentBinding = element.type === 'text' ? element.dataBinding : undefined
  const hasBinding = !!currentBinding

  const applyBinding = () => {
    if (!selectedSource || !selectedVariable) return

    const variable = selectedSourceData?.variables.find(v => v.id === selectedVariable)
    if (!variable) return

    const binding: DataBinding = {
      sourceId: selectedSource,
      variableName: variable.name,
      property: bindingType === 'property' ? propertyName : undefined
    }

    // Atualiza o elemento com o binding
    if (element.type === 'text') {
      updateElement(element.id, {
        dataBinding: binding,
        isDynamic: true,
        // Se for binding de conteúdo, atualiza o texto com a variável
        ...(bindingType === 'content' && { 
          content: `\${${variable.name}}` 
        })
      })
    }

    onClose()
  }

  const removeBinding = () => {
    if (element.type === 'text') {
      updateElement(element.id, {
        dataBinding: undefined,
        isDynamic: false
      })
    }
    onClose()
  }

  const previewContent = () => {
    if (!selectedSourceData || !selectedVariable) return ''
    
    const variable = selectedSourceData.variables.find(v => v.id === selectedVariable)
    if (!variable) return ''

    // Simula dados para preview
    const sampleData = selectedSourceData.data?.[0] || {}
    const value = sampleData[variable.name] || `[${variable.type}]`
    
    return String(value)
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-link-45deg me-2"></i>
              Vincular a Dados
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {hasBinding && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                <strong>Elemento Vinculado</strong><br/>
                Fonte: <code>{dataSources.find(ds => ds.id === currentBinding?.sourceId)?.name}</code><br/>
                Variável: <code>${currentBinding?.variableName}</code>
                {currentBinding?.property && (
                  <>
                    <br/>Propriedade: <code>{currentBinding.property}</code>
                  </>
                )}
              </div>
            )}

            {dataSources.length === 0 ? (
              <div className="alert alert-warning">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Nenhuma fonte de dados disponível. Crie uma fonte de dados primeiro.
              </div>
            ) : (
              <div>
                {/* Seleção da Fonte */}
                <div className="mb-3">
                  <label className="form-label">Fonte de Dados</label>
                  <select
                    className="form-select"
                    value={selectedSource}
                    onChange={(e) => {
                      setSelectedSource(e.target.value)
                      setSelectedVariable('')
                    }}
                  >
                    <option value="">Selecione uma fonte...</option>
                    {dataSources.map((source: DataSource) => (
                      <option key={source.id} value={source.id}>
                        {source.name} ({source.variables.length} variáveis)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleção da Variável */}
                {selectedSourceData && (
                  <div className="mb-3">
                    <label className="form-label">Variável</label>
                    <select
                      className="form-select"
                      value={selectedVariable}
                      onChange={(e) => setSelectedVariable(e.target.value)}
                    >
                      <option value="">Selecione uma variável...</option>
                      {selectedSourceData.variables.map((variable: Variable) => (
                        <option key={variable.id} value={variable.id}>
                          ${variable.name} ({variable.type})
                          {variable.description && ` - ${variable.description}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tipo de Binding */}
                {element.type === 'text' && selectedVariable && (
                  <div className="mb-3">
                    <label className="form-label">Tipo de Vinculação</label>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="content"
                            checked={bindingType === 'content'}
                            onChange={() => setBindingType('content')}
                          />
                          <label className="form-check-label" htmlFor="content">
                            <strong>Conteúdo</strong><br/>
                            <small className="text-muted">Substitui o texto do elemento</small>
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            id="property"
                            checked={bindingType === 'property'}
                            onChange={() => setBindingType('property')}
                          />
                          <label className="form-check-label" htmlFor="property">
                            <strong>Propriedade</strong><br/>
                            <small className="text-muted">Vincula a uma propriedade CSS</small>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Propriedade CSS */}
                {bindingType === 'property' && selectedVariable && (
                  <div className="mb-3">
                    <label className="form-label">Propriedade CSS</label>
                    <select
                      className="form-select"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                    >
                      <option value="">Selecione uma propriedade...</option>
                      <option value="color">Cor do Texto</option>
                      <option value="backgroundColor">Cor de Fundo</option>
                      <option value="fontSize">Tamanho da Fonte</option>
                      <option value="fontWeight">Peso da Fonte</option>
                      <option value="opacity">Opacidade</option>
                      <option value="borderColor">Cor da Borda</option>
                    </select>
                  </div>
                )}

                {/* Preview */}
                {selectedVariable && (
                  <div className="mb-3">
                    <label className="form-label">Preview</label>
                    <div className="card bg-light">
                      <div className="card-body">
                        {bindingType === 'content' ? (
                          <div>
                            <strong>Texto atual:</strong> {element.type === 'text' ? element.content : 'N/A'}<br/>
                            <strong>Texto com dados:</strong> {previewContent()}
                          </div>
                        ) : (
                          <div>
                            <strong>Propriedade:</strong> {propertyName || 'Não selecionada'}<br/>
                            <strong>Valor:</strong> {previewContent()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            {hasBinding && (
              <button type="button" className="btn btn-outline-danger me-auto" onClick={removeBinding}>
                <i className="bi bi-unlink me-2"></i>
                Remover Vinculação
              </button>
            )}
            
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            
            {dataSources.length > 0 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={applyBinding}
                disabled={!selectedSource || !selectedVariable || (bindingType === 'property' && !propertyName)}
              >
                <i className="bi bi-link me-2"></i>
                {hasBinding ? 'Atualizar' : 'Aplicar'} Vinculação
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
