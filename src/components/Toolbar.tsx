import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { PageFormatDisplay } from './PageFormatDisplay'
import { ResponsivePreview } from './ResponsivePreview'

interface ToolbarProps {
  onDownload?: () => void
  onLoadFromFile?: () => void
  onExport?: () => void
  onImport?: () => void
  onOpenTemplates?: () => void
  onOpenAdvancedDesign?: () => void
  onOpenDataManager?: () => void
  onOpenVariableBinding?: () => void
  onOpenDynamicPreview?: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onDownload,
  onLoadFromFile,
  onExport,
  onImport,
  onOpenTemplates,
  onOpenAdvancedDesign,
  onOpenDataManager,
  onOpenVariableBinding,
  onOpenDynamicPreview,
}) => {
  const [showResponsivePreview, setShowResponsivePreview] = useState(false)
  
  const {
    tool,
    zoom,
    isGridVisible,
    isRulersVisible,
    snapToGrid,
    snapToElements,
    setTool,
    setZoom,
    toggleGrid,
    toggleRulers,
    toggleSnapToGrid,
    toggleSnapToElements,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useEditorStore()

  const tools = [
    { id: 'select' as const, icon: 'bi-cursor', label: 'Selecionar' },
    { id: 'text' as const, icon: 'bi-type', label: 'Texto' },
    { id: 'image' as const, icon: 'bi-image', label: 'Imagem' },
    { id: 'rectangle' as const, icon: 'bi-square', label: 'Retângulo' },
    { id: 'line' as const, icon: 'bi-dash', label: 'Linha' },
    { id: 'table' as const, icon: 'bi-table', label: 'Tabela' },
  ]

  const handleZoomChange = (delta: number) => {
    setZoom(Math.max(0.1, Math.min(5, zoom + delta)))
  }

  return (
    <div className="bg-white border-bottom shadow-sm py-2">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between">
          {/* Tools Section */}
          <div className="d-flex align-items-center">
            <div className="btn-group me-3" role="group">
              {tools.map((toolItem) => (
                <button
                  key={toolItem.id}
                  type="button"
                  className={`btn btn-sm ${
                    tool === toolItem.id ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => setTool(toolItem.id)}
                  title={toolItem.label}
                >
                  <i className={toolItem.icon}></i>
                </button>
              ))}
            </div>

            {/* Separator */}
            <div className="vr me-3"></div>

            {/* History Actions */}
            <div className="btn-group me-3" role="group">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={undo}
                disabled={!canUndo}
                title="Desfazer"
              >
                <i className="bi-arrow-counterclockwise"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={redo}
                disabled={!canRedo}
                title="Refazer"
              >
                <i className="bi-arrow-clockwise"></i>
              </button>
            </div>

            {/* Separator */}
            <div className="vr me-3"></div>

            {/* View Options */}
            <div className="btn-group me-3" role="group">
              <button
                type="button"
                className={`btn btn-sm ${
                  isGridVisible ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={toggleGrid}
                title="Grade"
              >
                <i className="bi-grid"></i>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  isRulersVisible ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={toggleRulers}
                title="Réguas"
              >
                <i className="bi-rulers"></i>
              </button>
            </div>

            {/* Separator */}
            <div className="vr me-3"></div>

            {/* Snap Options */}
            <div className="btn-group me-3" role="group">
              <button
                type="button"
                className={`btn btn-sm ${
                  snapToGrid ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={toggleSnapToGrid}
                title="Snap à Grade"
              >
                <i className="bi-grid-3x3-gap"></i>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  snapToElements ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={toggleSnapToElements}
                title="Snap aos Elementos"
              >
                <i className="bi-bounding-box"></i>
              </button>
            </div>

            {/* Separator */}
            <div className="vr me-3"></div>

            {/* Page Format Display */}
            <div className="me-3">
              <PageFormatDisplay />
            </div>

            {/* Responsive Preview Button */}
            <div className="me-3">
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={() => setShowResponsivePreview(true)}
                title="Preview Responsivo"
              >
                <i className="bi-phone-landscape me-1"></i>
                Preview
              </button>
            </div>
          </div>

          {/* Right Section - Zoom and Actions */}
          <div className="d-flex align-items-center">
            {/* Zoom Controls */}
            <div className="btn-group me-3" role="group">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleZoomChange(-0.1)}
                title="Diminuir Zoom"
              >
                <i className="bi-zoom-out"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleZoomChange(0.1)}
                title="Aumentar Zoom"
              >
                <i className="bi-zoom-in"></i>
              </button>
            </div>

            {/* Separator */}
            <div className="vr me-3"></div>

            {/* Template Library */}
            <div className="btn-group" role="group">
              {onOpenTemplates && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={onOpenTemplates}
                  title="Biblioteca de Templates"
                >
                  <i className="bi-collection"></i>
                </button>
              )}
              {onOpenAdvancedDesign && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={onOpenAdvancedDesign}
                  title="Design Avançado"
                >
                  <i className="bi-palette"></i>
                </button>
              )}
              {onOpenDataManager && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={onOpenDataManager}
                  title="Gerenciar Dados"
                >
                  <i className="bi-database"></i>
                </button>
              )}
              {onOpenVariableBinding && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  onClick={onOpenVariableBinding}
                  title="Vincular Dados"
                >
                  <i className="bi-link-45deg"></i>
                </button>
              )}
              {onOpenDynamicPreview && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={onOpenDynamicPreview}
                  title="Preview Dinâmico"
                >
                  <i className="bi-eye"></i>
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="vr me-3"></div>

            {/* File Actions */}
            <div className="btn-group" role="group">
              {onImport && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={onImport}
                  title="Importar"
                >
                  <i className="bi-upload"></i>
                </button>
              )}
              {onLoadFromFile && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info"
                  onClick={onLoadFromFile}
                  title="Carregar Projeto do Arquivo"
                >
                  <i className="bi-folder-open"></i>
                </button>
              )}
              {onDownload && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={onDownload}
                  title="Baixar Projeto (JSON)"
                >
                  <i className="bi-download"></i>
                </button>
              )}
              {onExport && (
                <button
                  type="button"
                  className="btn btn-sm btn-success"
                  onClick={onExport}
                  title="Exportar"
                >
                  <i className="bi-box-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Preview Modal */}
      {showResponsivePreview && (
        <ResponsivePreview onClose={() => setShowResponsivePreview(false)} />
      )}
    </div>
  )
}

export default Toolbar
