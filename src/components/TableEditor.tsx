import React, { useState, useCallback } from 'react'
import { useEditorStore } from '../store/editor'
import { v4 as uuidv4 } from 'uuid'
import type { TableElement, TableRow, TableColumn } from '../types/layout'

interface TableEditorProps {
  element?: TableElement
  onClose: () => void
  onSave?: (element: TableElement) => void
}

export const TableEditor: React.FC<TableEditorProps> = ({ element, onClose, onSave }) => {
  const { addElement, updateElement } = useEditorStore()
  
  // Estado da tabela
  const [tableConfig, setTableConfig] = useState<Partial<TableElement>>(() => {
    if (element) {
      return { ...element }
    }
    
    // Tabela padrão 3x3
    const defaultColumns: TableColumn[] = Array.from({ length: 3 }, (_, i) => ({
      id: uuidv4(),
      name: `Coluna ${i + 1}`,
      width: 120,
      resizable: true,
      sortable: false,
      headerText: `Coluna ${i + 1}`,
      visible: true,
      frozen: false
    }))

    const defaultRows: TableRow[] = Array.from({ length: 3 }, (_, rowIndex) => ({
      id: uuidv4(),
      cells: defaultColumns.map(() => ({
        content: '',
        type: 'text' as const,
        editable: true,
        rowSpan: 1,
        colSpan: 1
      })),
      height: 25,
      isHeader: rowIndex === 0,
      isFooter: false,
      visible: true
    }))

    return {
      type: 'table' as const,
      rows: defaultRows,
      columns: defaultColumns,
      globalStyle: {
        fontFamily: 'Arial',
        fontSize: 12,
        color: '#000000',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderStyle: 'solid'
      },
      display: {
        showHeaders: true,
        showBorders: true,
        showGridLines: true,
        alternateRowColors: false
      },
      pagination: {
        enabled: false,
        pageBreaks: true,
        repeatHeaders: true
      },
      features: {
        sorting: false,
        filtering: false,
        grouping: false,
        totals: false,
        selection: false
      },
      layout: {
        fixedLayout: false,
        autoWidth: false
      }
    }
  })

  const [activeTab, setActiveTab] = useState<'structure' | 'style' | 'data'>('structure')
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)

  // Adicionar linha
  const addRow = useCallback((position?: number) => {
    if (!tableConfig.rows || !tableConfig.columns) return

    const newRow: TableRow = {
      id: uuidv4(),
      cells: tableConfig.columns.map(() => ({
        content: '',
        type: 'text',
        editable: true,
        rowSpan: 1,
        colSpan: 1
      })),
      height: 25,
      isHeader: false,
      isFooter: false,
      visible: true
    }

    const newRows = [...tableConfig.rows]
    const insertAt = position !== undefined ? position : newRows.length
    newRows.splice(insertAt, 0, newRow)

    setTableConfig(prev => ({ ...prev, rows: newRows }))
  }, [tableConfig.rows, tableConfig.columns])

  // Remover linha
  const removeRow = useCallback((index: number) => {
    if (!tableConfig.rows || tableConfig.rows.length <= 1) return

    const newRows = [...tableConfig.rows]
    newRows.splice(index, 1)
    
    setTableConfig(prev => ({ ...prev, rows: newRows }))
  }, [tableConfig.rows])

  // Adicionar coluna
  const addColumn = useCallback((position?: number) => {
    if (!tableConfig.columns || !tableConfig.rows) return

    const newColumn: TableColumn = {
      id: uuidv4(),
      name: `Coluna ${tableConfig.columns.length + 1}`,
      width: 120,
      resizable: true,
      sortable: false,
      headerText: `Coluna ${tableConfig.columns.length + 1}`,
      visible: true,
      frozen: false
    }

    const newColumns = [...tableConfig.columns]
    const insertAt = position !== undefined ? position : newColumns.length
    newColumns.splice(insertAt, 0, newColumn)

    // Adicionar células para a nova coluna em todas as linhas
    const newRows = tableConfig.rows.map(row => ({
      ...row,
      cells: [
        ...row.cells.slice(0, insertAt),
        {
          content: '',
          type: 'text' as const,
          editable: true,
          rowSpan: 1,
          colSpan: 1
        },
        ...row.cells.slice(insertAt)
      ]
    }))

    setTableConfig(prev => ({ 
      ...prev, 
      columns: newColumns,
      rows: newRows
    }))
  }, [tableConfig.columns, tableConfig.rows])

  // Remover coluna
  const removeColumn = useCallback((index: number) => {
    if (!tableConfig.columns || !tableConfig.rows || tableConfig.columns.length <= 1) return

    const newColumns = [...tableConfig.columns]
    newColumns.splice(index, 1)

    const newRows = tableConfig.rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, cellIndex) => cellIndex !== index)
    }))

    setTableConfig(prev => ({ 
      ...prev, 
      columns: newColumns,
      rows: newRows
    }))
  }, [tableConfig.columns, tableConfig.rows])

  // Atualizar conteúdo da célula
  const updateCellContent = useCallback((rowIndex: number, colIndex: number, content: string) => {
    if (!tableConfig.rows) return

    const newRows = [...tableConfig.rows]
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      cells: newRows[rowIndex].cells.map((cell, cellIndex) => 
        cellIndex === colIndex ? { ...cell, content } : cell
      )
    }

    setTableConfig(prev => ({ ...prev, rows: newRows }))
  }, [tableConfig.rows])

  // Atualizar estilo global
  const updateGlobalStyle = useCallback((updates: Partial<NonNullable<TableElement['globalStyle']>>) => {
    setTableConfig(prev => ({
      ...prev,
      globalStyle: { ...prev.globalStyle!, ...updates }
    }))
  }, [])

  // Salvar tabela
  const handleSave = () => {
    if (!tableConfig.rows || !tableConfig.columns) return

    const tableElement: TableElement = {
      id: element?.id || uuidv4(),
      name: element?.name || 'Nova Tabela',
      type: 'table',
      bounds: element?.bounds || { x: 50, y: 50, width: 400, height: 200 },
      locked: element?.locked || false,
      visible: element?.visible !== false,
      zIndex: element?.zIndex || 1,
      rows: tableConfig.rows,
      columns: tableConfig.columns,
      globalStyle: tableConfig.globalStyle!,
      display: tableConfig.display!,
      pagination: tableConfig.pagination!,
      features: tableConfig.features!,
      layout: tableConfig.layout!,
      dataBinding: tableConfig.dataBinding
    }

    if (element) {
      updateElement(element.id, tableElement)
    } else {
      addElement(tableElement)
    }

    if (onSave) {
      onSave(tableElement)
    }

    onClose()
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-fullscreen">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-table me-2"></i>
              {element ? 'Editar Tabela' : 'Nova Tabela'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body d-flex flex-column">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'structure' ? 'active' : ''}`}
                  onClick={() => setActiveTab('structure')}
                >
                  <i className="bi bi-grid me-2"></i>
                  Estrutura
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'style' ? 'active' : ''}`}
                  onClick={() => setActiveTab('style')}
                >
                  <i className="bi bi-palette me-2"></i>
                  Estilos
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'data' ? 'active' : ''}`}
                  onClick={() => setActiveTab('data')}
                >
                  <i className="bi bi-database me-2"></i>
                  Dados
                </button>
              </li>
            </ul>

            <div className="flex-grow-1 d-flex">
              {/* Painel Lateral */}
              <div className="bg-light border-end p-3" style={{ width: '300px' }}>
                {activeTab === 'structure' && (
                  <div>
                    <h6 className="fw-bold mb-3">Estrutura da Tabela</h6>
                    
                    {/* Controles de linha */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Linhas ({tableConfig.rows?.length || 0})</label>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => addRow()}
                        >
                          <i className="bi bi-plus"></i>
                          Adicionar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => selectedCell && removeRow(selectedCell.row)}
                          disabled={!selectedCell || (tableConfig.rows?.length || 0) <= 1}
                        >
                          <i className="bi bi-dash"></i>
                          Remover
                        </button>
                      </div>
                    </div>

                    {/* Controles de coluna */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Colunas ({tableConfig.columns?.length || 0})</label>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => addColumn()}
                        >
                          <i className="bi bi-plus"></i>
                          Adicionar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => selectedCell && removeColumn(selectedCell.col)}
                          disabled={!selectedCell || (tableConfig.columns?.length || 0) <= 1}
                        >
                          <i className="bi bi-dash"></i>
                          Remover
                        </button>
                      </div>
                    </div>

                    {/* Configurações de exibição */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-2">Exibição</h6>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={tableConfig.display?.showHeaders}
                          onChange={(e) => setTableConfig(prev => ({
                            ...prev,
                            display: { ...prev.display!, showHeaders: e.target.checked }
                          }))}
                        />
                        <label className="form-check-label">Mostrar Cabeçalhos</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={tableConfig.display?.showBorders}
                          onChange={(e) => setTableConfig(prev => ({
                            ...prev,
                            display: { ...prev.display!, showBorders: e.target.checked }
                          }))}
                        />
                        <label className="form-check-label">Mostrar Bordas</label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={tableConfig.display?.alternateRowColors}
                          onChange={(e) => setTableConfig(prev => ({
                            ...prev,
                            display: { ...prev.display!, alternateRowColors: e.target.checked }
                          }))}
                        />
                        <label className="form-check-label">Cores Alternadas</label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'style' && (
                  <div>
                    <h6 className="fw-bold mb-3">Estilos Globais</h6>
                    
                    <div className="mb-3">
                      <label className="form-label">Fonte</label>
                      <select
                        className="form-select"
                        value={tableConfig.globalStyle?.fontFamily || 'Arial'}
                        onChange={(e) => updateGlobalStyle({ fontFamily: e.target.value })}
                      >
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Courier">Courier</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Tamanho da Fonte</label>
                      <input
                        type="number"
                        className="form-control"
                        min="8"
                        max="72"
                        value={tableConfig.globalStyle?.fontSize || 12}
                        onChange={(e) => updateGlobalStyle({ fontSize: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Cor do Texto</label>
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={tableConfig.globalStyle?.color || '#000000'}
                        onChange={(e) => updateGlobalStyle({ color: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Cor da Borda</label>
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={tableConfig.globalStyle?.borderColor || '#cccccc'}
                        onChange={(e) => updateGlobalStyle({ borderColor: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Espessura da Borda</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="10"
                        value={tableConfig.globalStyle?.borderWidth || 1}
                        onChange={(e) => updateGlobalStyle({ borderWidth: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div>
                    <h6 className="fw-bold mb-3">Dados Dinâmicos</h6>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Vincular dados será implementado na próxima etapa
                    </div>
                  </div>
                )}
              </div>

              {/* Área de Preview */}
              <div className="flex-grow-1 p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Preview da Tabela</h6>
                  {selectedCell && (
                    <small className="text-muted">
                      Célula selecionada: Linha {selectedCell.row + 1}, Coluna {selectedCell.col + 1}
                    </small>
                  )}
                </div>

                {/* Tabela Preview */}
                <div className="border rounded p-3 bg-white overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  <table
                    className="table table-bordered"
                    style={{
                      fontFamily: tableConfig.globalStyle?.fontFamily,
                      fontSize: `${tableConfig.globalStyle?.fontSize}px`,
                      color: tableConfig.globalStyle?.color
                    }}
                  >
                    <thead>
                      {tableConfig.display?.showHeaders && tableConfig.rows?.[0] && (
                        <tr>
                          {tableConfig.columns?.map((column, colIndex) => (
                            <th
                              key={column.id}
                              style={{
                                width: column.width,
                                border: `${tableConfig.globalStyle?.borderWidth || 1}px solid ${tableConfig.globalStyle?.borderColor || '#cccccc'}`
                              }}
                              className={selectedCell?.row === 0 && selectedCell?.col === colIndex ? 'table-active' : ''}
                              onClick={() => setSelectedCell({ row: 0, col: colIndex })}
                            >
                              {column.headerText || column.name}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {tableConfig.rows?.slice(tableConfig.display?.showHeaders ? 1 : 0).map((row, rowIndex) => {
                        const actualRowIndex = tableConfig.display?.showHeaders ? rowIndex + 1 : rowIndex
                        return (
                          <tr
                            key={row.id}
                            style={{
                              backgroundColor: tableConfig.display?.alternateRowColors && rowIndex % 2 === 1 
                                ? '#f9f9f9' 
                                : 'transparent'
                            }}
                          >
                            {row.cells.map((cell, colIndex) => (
                              <td
                                key={`${row.id}-${colIndex}`}
                                style={{
                                  border: `${tableConfig.globalStyle?.borderWidth || 1}px solid ${tableConfig.globalStyle?.borderColor || '#cccccc'}`
                                }}
                                className={selectedCell?.row === actualRowIndex && selectedCell?.col === colIndex ? 'table-active' : ''}
                                onClick={() => setSelectedCell({ row: actualRowIndex, col: colIndex })}
                              >
                                <input
                                  type="text"
                                  className="form-control border-0 bg-transparent"
                                  value={cell.content}
                                  onChange={(e) => updateCellContent(actualRowIndex, colIndex, e.target.value)}
                                  placeholder="Clique para editar"
                                />
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSave}>
              <i className="bi bi-check me-2"></i>
              {element ? 'Atualizar' : 'Criar'} Tabela
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
