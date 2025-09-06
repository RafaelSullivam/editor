import React, { useState } from 'react'
import type { TableElement, TableCell, TableRow, TableColumn } from '../types/layout'

interface TableStylePanelProps {
  table: TableElement
  selectedCell?: { row: number; col: number }
  onUpdateTable: (updates: Partial<TableElement>) => void
  onUpdateCell?: (rowIndex: number, colIndex: number, cell: Partial<TableCell>) => void
  onUpdateRow?: (rowIndex: number, row: Partial<TableRow>) => void
  onUpdateColumn?: (colIndex: number, column: Partial<TableColumn>) => void
}

export const TableStylePanel: React.FC<TableStylePanelProps> = ({
  table,
  selectedCell,
  onUpdateTable,
  onUpdateCell,
  onUpdateRow,
  onUpdateColumn
}) => {
  const [activeSection, setActiveSection] = useState<'global' | 'cell' | 'row' | 'column'>('global')

  const getSelectedCell = (): TableCell | null => {
    if (!selectedCell || !table.rows[selectedCell.row]) return null
    return table.rows[selectedCell.row].cells[selectedCell.col] || null
  }

  const getSelectedRow = (): TableRow | null => {
    if (!selectedCell || !table.rows[selectedCell.row]) return null
    return table.rows[selectedCell.row]
  }

  const getSelectedColumn = (): TableColumn | null => {
    if (!selectedCell || !table.columns[selectedCell.col]) return null
    return table.columns[selectedCell.col]
  }

  const selectedCellData = getSelectedCell()
  const selectedRowData = getSelectedRow()
  const selectedColumnData = getSelectedColumn()

  return (
    <div className="table-style-panel">
      <div className="mb-3">
        <h6 className="fw-bold mb-2">Configurar Estilos</h6>
        
        {/* Seletor de seção */}
        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className={`btn btn-sm ${activeSection === 'global' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveSection('global')}
          >
            <i className="bi bi-globe2 me-1"></i>
            Global
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSection === 'cell' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveSection('cell')}
            disabled={!selectedCell}
          >
            <i className="bi bi-square me-1"></i>
            Célula
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSection === 'row' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveSection('row')}
            disabled={!selectedCell}
          >
            <i className="bi bi-arrow-right me-1"></i>
            Linha
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeSection === 'column' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveSection('column')}
            disabled={!selectedCell}
          >
            <i className="bi bi-arrow-down me-1"></i>
            Coluna
          </button>
        </div>
      </div>

      {/* Estilos Globais */}
      {activeSection === 'global' && (
        <div>
          <h6 className="fw-bold mb-3">Estilos Globais da Tabela</h6>
          
          {/* Fonte */}
          <div className="mb-3">
            <label className="form-label">Família da Fonte</label>
            <select
              className="form-select form-select-sm"
              value={table.globalStyle.fontFamily}
              onChange={(e) => onUpdateTable({
                globalStyle: { ...table.globalStyle, fontFamily: e.target.value }
              })}
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Courier">Courier</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">Tamanho</label>
              <input
                type="number"
                className="form-control form-control-sm"
                min="6"
                max="72"
                value={table.globalStyle.fontSize}
                onChange={(e) => onUpdateTable({
                  globalStyle: { ...table.globalStyle, fontSize: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Cor</label>
              <input
                type="color"
                className="form-control form-control-color form-control-sm"
                value={table.globalStyle.color}
                onChange={(e) => onUpdateTable({
                  globalStyle: { ...table.globalStyle, color: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Bordas */}
          <h6 className="fw-bold mb-2">Bordas</h6>
          <div className="row g-2 mb-3">
            <div className="col-4">
              <label className="form-label">Cor</label>
              <input
                type="color"
                className="form-control form-control-color form-control-sm"
                value={table.globalStyle.borderColor}
                onChange={(e) => onUpdateTable({
                  globalStyle: { ...table.globalStyle, borderColor: e.target.value }
                })}
              />
            </div>
            <div className="col-4">
              <label className="form-label">Espessura</label>
              <input
                type="number"
                className="form-control form-control-sm"
                min="0"
                max="10"
                value={table.globalStyle.borderWidth}
                onChange={(e) => onUpdateTable({
                  globalStyle: { ...table.globalStyle, borderWidth: parseInt(e.target.value) }
                })}
              />
            </div>
            <div className="col-4">
              <label className="form-label">Estilo</label>
              <select
                className="form-select form-select-sm"
                value={table.globalStyle.borderStyle}
                onChange={(e) => onUpdateTable({
                  globalStyle: { ...table.globalStyle, borderStyle: e.target.value as any }
                })}
              >
                <option value="solid">Sólido</option>
                <option value="dashed">Tracejado</option>
                <option value="dotted">Pontilhado</option>
              </select>
            </div>
          </div>

          {/* Configurações de exibição */}
          <h6 className="fw-bold mb-2">Exibição</h6>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={table.display.showHeaders}
              onChange={(e) => onUpdateTable({
                display: { ...table.display, showHeaders: e.target.checked }
              })}
            />
            <label className="form-check-label">Mostrar Cabeçalhos</label>
          </div>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={table.display.showBorders}
              onChange={(e) => onUpdateTable({
                display: { ...table.display, showBorders: e.target.checked }
              })}
            />
            <label className="form-check-label">Mostrar Bordas</label>
          </div>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={table.display.alternateRowColors}
              onChange={(e) => onUpdateTable({
                display: { ...table.display, alternateRowColors: e.target.checked }
              })}
            />
            <label className="form-check-label">Cores Alternadas</label>
          </div>

          {table.display.alternateRowColors && (
            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Cor Par</label>
                <input
                  type="color"
                  className="form-control form-control-color form-control-sm"
                  value={table.display.zebra?.evenColor || '#ffffff'}
                  onChange={(e) => onUpdateTable({
                    display: {
                      ...table.display,
                      zebra: {
                        evenColor: e.target.value,
                        oddColor: table.display.zebra?.oddColor || '#f9f9f9'
                      }
                    }
                  })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Cor Ímpar</label>
                <input
                  type="color"
                  className="form-control form-control-color form-control-sm"
                  value={table.display.zebra?.oddColor || '#f9f9f9'}
                  onChange={(e) => onUpdateTable({
                    display: {
                      ...table.display,
                      zebra: {
                        evenColor: table.display.zebra?.evenColor || '#ffffff',
                        oddColor: e.target.value
                      }
                    }
                  })}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estilos de Célula */}
      {activeSection === 'cell' && selectedCellData && (
        <div>
          <h6 className="fw-bold mb-3">
            Estilo da Célula ({selectedCell!.row + 1}, {selectedCell!.col + 1})
          </h6>
          
          {/* Conteúdo */}
          <div className="mb-3">
            <label className="form-label">Tipo de Conteúdo</label>
            <select
              className="form-select form-select-sm"
              value={selectedCellData.type}
              onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                type: e.target.value as TableCell['type']
              })}
            >
              <option value="text">Texto</option>
              <option value="number">Número</option>
              <option value="currency">Moeda</option>
              <option value="percentage">Porcentagem</option>
              <option value="date">Data</option>
            </select>
          </div>

          {/* Aparência */}
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">Cor de Fundo</label>
              <input
                type="color"
                className="form-control form-control-color form-control-sm"
                value={selectedCellData.style?.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: 4,
                    ...selectedCellData.style,
                    backgroundColor: e.target.value
                  }
                })}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Cor do Texto</label>
              <input
                type="color"
                className="form-control form-control-color form-control-sm"
                value={selectedCellData.style?.color || '#000000'}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: 4,
                    ...selectedCellData.style,
                    color: e.target.value
                  }
                })}
              />
            </div>
          </div>

          <div className="row g-2 mb-3">
            <div className="col-4">
              <label className="form-label">Tamanho</label>
              <input
                type="number"
                className="form-control form-control-sm"
                min="6"
                max="72"
                value={selectedCellData.style?.fontSize || 12}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: selectedCellData.style?.padding || 4,
                    ...selectedCellData.style,
                    fontSize: parseInt(e.target.value)
                  }
                })}
              />
            </div>
            <div className="col-4">
              <label className="form-label">Peso</label>
              <select
                className="form-select form-select-sm"
                value={selectedCellData.style?.fontWeight || 'normal'}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: selectedCellData.style?.padding || 4,
                    ...selectedCellData.style,
                    fontWeight: e.target.value as 'normal' | 'bold'
                  }
                })}
              >
                <option value="normal">Normal</option>
                <option value="bold">Negrito</option>
              </select>
            </div>
            <div className="col-4">
              <label className="form-label">Estilo</label>
              <select
                className="form-select form-select-sm"
                value={selectedCellData.style?.fontStyle || 'normal'}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: selectedCellData.style?.padding || 4,
                    ...selectedCellData.style,
                    fontStyle: e.target.value as 'normal' | 'italic'
                  }
                })}
              >
                <option value="normal">Normal</option>
                <option value="italic">Itálico</option>
              </select>
            </div>
          </div>

          {/* Alinhamento */}
          <h6 className="fw-bold mb-2">Alinhamento</h6>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">Horizontal</label>
              <select
                className="form-select form-select-sm"
                value={selectedCellData.style?.textAlign || 'left'}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: selectedCellData.style?.padding || 4,
                    ...selectedCellData.style,
                    textAlign: e.target.value as any
                  }
                })}
              >
                <option value="left">Esquerda</option>
                <option value="center">Centro</option>
                <option value="right">Direita</option>
                <option value="justify">Justificado</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Vertical</label>
              <select
                className="form-select form-select-sm"
                value={selectedCellData.style?.verticalAlign || 'top'}
                onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                  style: {
                    padding: selectedCellData.style?.padding || 4,
                    ...selectedCellData.style,
                    verticalAlign: e.target.value as any
                  }
                })}
              >
                <option value="top">Topo</option>
                <option value="middle">Meio</option>
                <option value="bottom">Base</option>
              </select>
            </div>
          </div>

          {/* Validação */}
          <h6 className="fw-bold mb-2">Validação</h6>
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedCellData.validation?.required || false}
              onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                validation: {
                  ...selectedCellData.validation,
                  required: e.target.checked
                }
              })}
            />
            <label className="form-check-label">Campo Obrigatório</label>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedCellData.editable}
              onChange={(e) => onUpdateCell?.(selectedCell!.row, selectedCell!.col, {
                editable: e.target.checked
              })}
            />
            <label className="form-check-label">Editável</label>
          </div>
        </div>
      )}

      {/* Estilos de Linha */}
      {activeSection === 'row' && selectedRowData && (
        <div>
          <h6 className="fw-bold mb-3">Estilo da Linha {selectedCell!.row + 1}</h6>
          
          <div className="mb-3">
            <label className="form-label">Altura da Linha</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="15"
              max="200"
              value={selectedRowData.height}
              onChange={(e) => onUpdateRow?.(selectedCell!.row, {
                height: parseInt(e.target.value)
              })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Cor de Fundo</label>
            <input
              type="color"
              className="form-control form-control-color form-control-sm"
              value={selectedRowData.style?.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdateRow?.(selectedCell!.row, {
                style: {
                  ...selectedRowData.style,
                  backgroundColor: e.target.value
                }
              })}
            />
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedRowData.isHeader}
              onChange={(e) => onUpdateRow?.(selectedCell!.row, {
                isHeader: e.target.checked
              })}
            />
            <label className="form-check-label">Linha de Cabeçalho</label>
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedRowData.visible}
              onChange={(e) => onUpdateRow?.(selectedCell!.row, {
                visible: e.target.checked
              })}
            />
            <label className="form-check-label">Visível</label>
          </div>
        </div>
      )}

      {/* Estilos de Coluna */}
      {activeSection === 'column' && selectedColumnData && (
        <div>
          <h6 className="fw-bold mb-3">Estilo da Coluna {selectedCell!.col + 1}</h6>
          
          <div className="mb-3">
            <label className="form-label">Nome da Coluna</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={selectedColumnData.name}
              onChange={(e) => onUpdateColumn?.(selectedCell!.col, {
                name: e.target.value
              })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Texto do Cabeçalho</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={selectedColumnData.headerText || ''}
              onChange={(e) => onUpdateColumn?.(selectedCell!.col, {
                headerText: e.target.value
              })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Largura</label>
            <input
              type="number"
              className="form-control form-control-sm"
              min="50"
              max="1000"
              value={selectedColumnData.width}
              onChange={(e) => onUpdateColumn?.(selectedCell!.col, {
                width: parseInt(e.target.value)
              })}
            />
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedColumnData.resizable}
              onChange={(e) => onUpdateColumn?.(selectedCell!.col, {
                resizable: e.target.checked
              })}
            />
            <label className="form-check-label">Redimensionável</label>
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedColumnData.sortable}
              onChange={(e) => onUpdateColumn?.(selectedCell!.col, {
                sortable: e.target.checked
              })}
            />
            <label className="form-check-label">Ordenável</label>
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={selectedColumnData.visible}
              onChange={(e) => onUpdateColumn?.(selectedCell!.col, {
                visible: e.target.checked
              })}
            />
            <label className="form-check-label">Visível</label>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="mt-4 pt-3 border-top">
        <div className="btn-group w-100" role="group">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => {
              // Reset estilos
              if (activeSection === 'cell' && selectedCell) {
                onUpdateCell?.(selectedCell.row, selectedCell.col, {
                  style: undefined
                })
              }
            }}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Reset
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              // Copiar estilos
              console.log('Copiar estilos')
            }}
          >
            <i className="bi bi-clipboard me-1"></i>
            Copiar
          </button>
        </div>
      </div>
    </div>
  )
}
