import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { v4 as uuidv4 } from 'uuid'
import type { DataSource, Variable } from '../types/layout'

interface DataManagerProps {
  onClose: () => void
}

export const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const { layout, updateLayout } = useEditorStore()
  const [activeTab, setActiveTab] = useState<'sources' | 'variables'>('sources')
  const [newSource, setNewSource] = useState<Partial<DataSource>>({
    name: '',
    type: 'manual'
  })
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    name: '',
    type: 'text',
    description: ''
  })

  if (!layout) {
    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Gerenciador de Dados</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center">
              <p>Nenhum layout ativo encontrado.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const dataSources = layout.dataSources || []

  const addDataSource = () => {
    if (!newSource.name) return

    const dataSource: DataSource = {
      id: uuidv4(),
      name: newSource.name,
      type: newSource.type || 'manual',
      variables: [],
      data: newSource.type === 'manual' ? [{}] : [],
      lastUpdated: new Date().toISOString()
    }

    updateLayout({
      dataSources: [...dataSources, dataSource]
    })

    setNewSource({ name: '', type: 'manual' })
  }

  const removeDataSource = (sourceId: string) => {
    updateLayout({
      dataSources: dataSources.filter(ds => ds.id !== sourceId)
    })
  }

  const addVariable = (sourceId: string) => {
    if (!newVariable.name) return

    const variable: Variable = {
      id: uuidv4(),
      name: newVariable.name,
      type: newVariable.type || 'text',
      description: newVariable.description
    }

    const updatedSources = dataSources.map(ds => 
      ds.id === sourceId 
        ? { ...ds, variables: [...ds.variables, variable] }
        : ds
    )

    updateLayout({ dataSources: updatedSources })
    setNewVariable({ name: '', type: 'text', description: '' })
  }

  const removeVariable = (sourceId: string, variableId: string) => {
    const updatedSources = dataSources.map(ds => 
      ds.id === sourceId 
        ? { ...ds, variables: ds.variables.filter(v => v.id !== variableId) }
        : ds
    )

    updateLayout({ dataSources: updatedSources })
  }

  const updateDataSourceData = (sourceId: string, data: any[]) => {
    const updatedSources = dataSources.map(ds => 
      ds.id === sourceId 
        ? { ...ds, data, lastUpdated: new Date().toISOString() }
        : ds
    )

    updateLayout({ dataSources: updatedSources })
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-database me-2"></i>
              Gerenciador de Dados
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'sources' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sources')}
                >
                  <i className="bi bi-server me-2"></i>
                  Fontes de Dados ({dataSources.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'variables' ? 'active' : ''}`}
                  onClick={() => setActiveTab('variables')}
                >
                  <i className="bi bi-code-square me-2"></i>
                  Variáveis
                </button>
              </li>
            </ul>

            {activeTab === 'sources' && (
              <div>
                {/* Adicionar Nova Fonte */}
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-plus-circle me-2"></i>
                      Nova Fonte de Dados
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Nome da Fonte</label>
                        <input
                          type="text"
                          className="form-control"
                          value={newSource.name || ''}
                          onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                          placeholder="Ex: Dados de Vendas"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Tipo</label>
                        <select
                          className="form-select"
                          value={newSource.type || 'manual'}
                          onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                        >
                          <option value="manual">Manual</option>
                          <option value="json">JSON</option>
                          <option value="csv">CSV</option>
                          <option value="api">API</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label">&nbsp;</label>
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={addDataSource}
                          disabled={!newSource.name}
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Fontes */}
                {dataSources.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Nenhuma fonte de dados criada. Crie uma fonte para começar a usar variáveis dinâmicas.
                  </div>
                ) : (
                  <div className="row">
                    {dataSources.map((source: DataSource) => (
                      <div key={source.id} className="col-12 mb-4">
                        <div className="card">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="card-title mb-0">{source.name}</h6>
                              <small className="text-muted">
                                {source.type.toUpperCase()} • {source.variables.length} variáveis
                              </small>
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeDataSource(source.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              {/* Variáveis */}
                              <div className="col-md-6">
                                <h6 className="fw-bold">Variáveis</h6>
                                <div className="mb-3">
                                  <div className="input-group input-group-sm mb-2">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Nome da variável"
                                      value={newVariable.name || ''}
                                      onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                                    />
                                    <select
                                      className="form-select"
                                      value={newVariable.type || 'text'}
                                      onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as any })}
                                    >
                                      <option value="text">Texto</option>
                                      <option value="number">Número</option>
                                      <option value="date">Data</option>
                                      <option value="boolean">Booleano</option>
                                      <option value="image">Imagem</option>
                                      <option value="color">Cor</option>
                                    </select>
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      onClick={() => addVariable(source.id)}
                                      disabled={!newVariable.name}
                                    >
                                      <i className="bi bi-plus"></i>
                                    </button>
                                  </div>
                                </div>

                                {source.variables.length === 0 ? (
                                  <p className="text-muted small">Nenhuma variável definida</p>
                                ) : (
                                  <div className="list-group list-group-flush">
                                    {source.variables.map((variable: Variable) => (
                                      <div key={variable.id} className="list-group-item px-0 py-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <div>
                                            <span className="fw-bold">${variable.name}</span>
                                            <span className={`badge ms-2 ${
                                              variable.type === 'text' ? 'bg-primary' :
                                              variable.type === 'number' ? 'bg-success' :
                                              variable.type === 'date' ? 'bg-warning' :
                                              variable.type === 'boolean' ? 'bg-info' :
                                              variable.type === 'image' ? 'bg-secondary' : 'bg-dark'
                                            }`}>
                                              {variable.type}
                                            </span>
                                            {variable.description && (
                                              <>
                                                <br />
                                                <small className="text-muted">{variable.description}</small>
                                              </>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => removeVariable(source.id, variable.id)}
                                          >
                                            <i className="bi bi-x"></i>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Preview de Dados */}
                              <div className="col-md-6">
                                <h6 className="fw-bold">Dados de Amostra</h6>
                                {source.type === 'manual' && (
                                  <div>
                                    <textarea
                                      className="form-control font-monospace"
                                      rows={6}
                                      placeholder="Cole dados JSON aqui..."
                                      defaultValue={JSON.stringify(source.data, null, 2)}
                                      onBlur={(e) => {
                                        try {
                                          const data = JSON.parse(e.target.value)
                                          updateDataSourceData(source.id, Array.isArray(data) ? data : [data])
                                        } catch (error) {
                                          console.error('JSON inválido:', error)
                                        }
                                      }}
                                    />
                                    <small className="text-muted">
                                      Formato: array de objetos JSON
                                    </small>
                                  </div>
                                )}
                                {source.type === 'api' && (
                                  <div>
                                    <input
                                      type="url"
                                      className="form-control mb-2"
                                      placeholder="URL da API"
                                      defaultValue={source.url}
                                    />
                                    <small className="text-muted">
                                      A API deve retornar um array de objetos
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'variables' && (
              <div>
                <div className="alert alert-info">
                  <i className="bi bi-lightbulb me-2"></i>
                  <strong>Como usar variáveis:</strong><br/>
                  • Em elementos de texto, use <code>${`{nome_da_variavel}`}</code><br/>
                  • Para acessar propriedades: <code>${`{dados.nome}`}</code><br/>
                  • Para arrays: <code>${`{lista[0].propriedade}`}</code>
                </div>

                {dataSources.map((source: DataSource) => (
                  <div key={source.id} className="card mb-3">
                    <div className="card-header">
                      <h6 className="card-title mb-0">{source.name}</h6>
                    </div>
                    <div className="card-body">
                      {source.variables.length === 0 ? (
                        <p className="text-muted">Nenhuma variável definida para esta fonte</p>
                      ) : (
                        <div className="row">
                          {source.variables.map((variable: Variable) => (
                            <div key={variable.id} className="col-md-6 mb-3">
                              <div className="border rounded p-3">
                                <h6 className="fw-bold text-primary">${variable.name}</h6>
                                <p className="mb-1">
                                  <strong>Tipo:</strong> {variable.type}<br/>
                                  {variable.description && (
                                    <>
                                      <strong>Descrição:</strong> {variable.description}<br/>
                                    </>
                                  )}
                                  <strong>Uso:</strong> <code>${`{${variable.name}}`}</code>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
