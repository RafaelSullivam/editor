import React, { useState, useRef } from 'react'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { useEditorStore } from './store/editor'
import PDFViewer from './components/PDFViewer'
import CanvasOverlay from './components/CanvasOverlay'
import { PAGE_FORMATS } from './types'

function App() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showWelcome, setShowWelcome] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [isGridVisible, setIsGridVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    currentPage,
    addPage,
    updatePage
  } = useEditorStore()

  const pageWidth = currentPage?.config?.width || PAGE_FORMATS.A4.width
  const pageHeight = currentPage?.config?.height || PAGE_FORMATS.A4.height

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setShowWelcome(false)
    }
  }

  const handleNewLayout = () => {
    addPage()
    setShowWelcome(false)
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      {/* Welcome Screen */}
      {showWelcome && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ 
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
               zIndex: 1050 
             }}>
          <div className="text-center text-white">
            <div className="mb-5">
              <i className="bi bi-file-earmark-text display-1 text-white opacity-75"></i>
            </div>
            <h1 className="display-4 fw-bold mb-4 text-white">
              Editor de Layouts
            </h1>
            <p className="lead mb-5 text-white opacity-75">
              Crie layouts profissionais para seus relatórios com facilidade
            </p>

            <div className="row justify-content-center mb-5">
              <div className="col-md-4 mb-4">
                <div className="card bg-white bg-opacity-10 border-0 h-100 hover-lift">
                  <div className="card-body text-center">
                    <i className="bi bi-plus-circle display-6 text-white mb-3"></i>
                    <h5 className="card-title text-white">Novo Layout</h5>
                    <p className="card-text text-white opacity-75">
                      Comece do zero criando um novo layout
                    </p>
                    <button 
                      onClick={handleNewLayout}
                      className="btn btn-light btn-lg px-4"
                    >
                      <i className="bi bi-plus me-2"></i>
                      Criar Agora
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-md-4 mb-4">
                <div className="card bg-white bg-opacity-10 border-0 h-100 hover-lift">
                  <div className="card-body text-center">
                    <i className="bi bi-upload display-6 text-white mb-3"></i>
                    <h5 className="card-title text-white">Carregar PDF</h5>
                    <p className="card-text text-white opacity-75">
                      Use um PDF existente como base
                    </p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline-light btn-lg px-4"
                    >
                      <i className="bi bi-upload me-2"></i>
                      Enviar PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="row text-center">
              <div className="col-md-3 mb-3">
                <i className="bi bi-layers h4 text-primary"></i>
                <h6 className="mt-2 text-white">Múltiplas Camadas</h6>
              </div>
              <div className="col-md-3 mb-3">
                <i className="bi bi-grid h4 text-primary"></i>
                <h6 className="mt-2 text-white">Grade Inteligente</h6>
              </div>
              <div className="col-md-3 mb-3">
                <i className="bi bi-download h4 text-success"></i>
                <h6 className="mt-2 text-white">Exportação Fácil</h6>
              </div>
              <div className="col-md-3 mb-3">
                <i className="bi bi-image h4 text-info"></i>
                <h6 className="mt-2 text-white">Suporte a Imagens</h6>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main App Layout */}
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <header className="navbar navbar-expand-lg glass shadow-sm">
          <div className="container-fluid px-4">
            <button 
              className="btn btn-link text-decoration-none p-2 me-3"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <i className="bi bi-list h5 mb-0"></i>
            </button>

            <a className="navbar-brand fw-bold gradient-text" href="#">
              <i className="bi bi-file-earmark-text me-2"></i>
              Editor de Layouts
            </a>

            <div className="navbar-nav ms-auto d-flex flex-row">
              <button className="btn btn-outline-secondary btn-sm me-2">
                <i className="bi bi-folder me-1"></i>
                Projetos
              </button>
              
              <button className="btn btn-outline-secondary btn-sm me-2">
                <i className="bi bi-search me-1"></i>
                Buscar
              </button>

              <div className="btn-group me-3">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                >
                  <i className="bi bi-zoom-out"></i>
                </button>
                <button className="btn btn-outline-secondary btn-sm" disabled>
                  {Math.round(zoom * 100)}%
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                >
                  <i className="bi bi-zoom-in"></i>
                </button>
              </div>

              <button 
                className={`btn btn-sm me-2 ${isGridVisible ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setIsGridVisible(!isGridVisible)}
              >
                <i className="bi bi-grid"></i>
              </button>

              <button className="btn btn-outline-secondary btn-sm me-2">
                <i className="bi bi-eye"></i>
              </button>
              
              <button className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-gear"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Sidebar */}
          {showSidebar && (
            <div className="bg-white border-end" style={{ width: '280px' }}>
              <div className="p-4 h-100 overflow-auto">
                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-muted mb-3">
                    <i className="bi bi-gear me-2"></i>
                    Configurações
                  </h6>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-medium text-muted">
                      Formato da Página
                    </label>
                    <select 
                      className="form-select form-select-sm"
                      value={Object.entries(PAGE_FORMATS).find(([_, format]) => 
                        format.width === currentPage?.config.width && 
                        format.height === currentPage?.config.height
                      )?.[0] || 'A4'}
                      onChange={(e) => {
                        const format = PAGE_FORMATS[e.target.value as keyof typeof PAGE_FORMATS]
                        if (format && currentPage) {
                          updatePage(currentPage.id, {
                            config: {
                              ...currentPage.config,
                              width: format.width,
                              height: format.height
                            }
                          })
                        }
                      }}
                    >
                      {Object.entries(PAGE_FORMATS).map(([name, format]) => (
                        <option key={name} value={name}>
                          {name} ({format.width}×{format.height}mm)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium text-muted">
                      Orientação
                    </label>
                    <div className="btn-group w-100">
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-phone me-1"></i>
                        Retrato
                      </button>
                      <button className="btn btn-outline-secondary btn-sm">
                        <i className="bi bi-phone-landscape me-1"></i>
                        Paisagem
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-uppercase text-muted mb-3">
                    <i className="bi bi-cloud-upload me-2"></i>
                    Upload de Arquivo
                  </h6>
                  
                  <div 
                    className="border-2 border-dashed rounded p-4 text-center bg-light"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="bi bi-cloud-upload h2 text-muted mb-2"></i>
                    <p className="small text-muted mb-2">
                      Clique para enviar ou arraste um PDF aqui
                    </p>
                    <small className="text-muted">Apenas arquivos PDF são aceitos</small>
                  </div>
                </div>

                {currentPage && (
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase text-muted mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Informações
                    </h6>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Largura:</span>
                        <span>{pageWidth}mm</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Altura:</span>
                        <span>{pageHeight}mm</span>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-muted">Elementos:</span>
                        <span>{currentPage?.elements?.length || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Zoom:</span>
                        <span>{Math.round(zoom * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <main className="flex-grow-1 overflow-auto p-4" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div className="h-100 d-flex align-items-center justify-content-center">
              {currentPage ? (
                <div 
                  className="bg-white rounded shadow-lg border position-relative" 
                  style={{ 
                    maxWidth: 'fit-content',
                    transform: `scale(${Math.min(1, zoom)})`,
                    transformOrigin: 'center'
                  }}
                >
                  {/* Canvas Header */}
                  <div className="position-absolute top-0 start-0 end-0 glass border-bottom p-3" style={{ zIndex: 10 }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary rounded d-flex align-items-center justify-content-center me-3" style={{ width: '24px', height: '24px' }}>
                          <i className="bi bi-file-earmark text-white" style={{ fontSize: '12px' }}></i>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-semibold">
                            {currentPage.name}
                          </h6>
                          <small className="text-muted">
                            {pageWidth}mm × {pageHeight}mm
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-secondary me-2">
                          {Math.round(zoom * 100)}%
                        </span>
                        <span className="badge bg-success">
                          <i className="bi bi-circle-fill me-1" style={{ fontSize: '6px' }}></i>
                          Ativo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Canvas */}
                  <div 
                    className="position-relative" 
                    style={{ 
                      width: `${pageWidth * 3.779527559}px`, 
                      height: `${pageHeight * 3.779527559 + 64}px`,
                      paddingTop: '64px'
                    }}
                  >
                    {pdfFile && (
                      <PDFViewer
                        file={pdfFile}
                        pageNumber={1}
                        scale={zoom}
                        className="position-absolute top-0 start-0"
                      />
                    )}
                    
                    <div className="position-absolute top-0 start-0" style={{ top: '64px' }}>
                      <CanvasOverlay
                        width={pageWidth}
                        height={pageHeight}
                        scale={zoom}
                      />
                    </div>

                    {/* Grid Overlay */}
                    {isGridVisible && (
                      <div className="position-absolute top-0 start-0" style={{ top: '64px', pointerEvents: 'none' }}>
                        <svg 
                          width={pageWidth * 3.779527559} 
                          height={pageHeight * 3.779527559}
                          style={{ opacity: 0.2 }}
                        >
                          <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#6b7280" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Canvas Footer */}
                  <div className="position-absolute bottom-0 start-0 end-0 glass border-top p-3">
                    <div className="d-flex align-items-center justify-content-between small text-muted">
                      <div className="d-flex align-items-center">
                        <span>Elementos: {currentPage?.elements?.length || 0}</span>
                        <span className="mx-2">•</span>
                        <span>Snap: {isGridVisible ? 'Ativo' : 'Inativo'}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="me-2">Pronto</span>
                        <div className="bg-success rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Welcome State */
                <div className="text-center">
                  <div className="bg-light rounded d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '96px', height: '96px' }}>
                    <i className="bi bi-file-earmark h1 text-muted mb-0"></i>
                  </div>
                  <h3 className="fw-bold text-dark mb-3">
                    Canvas Vazio
                  </h3>
                  <p className="text-muted mb-4">
                    Crie um novo layout ou carregue um PDF para começar a editar seu documento.
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                    <button
                      onClick={handleNewLayout}
                      className="btn btn-primary px-4 py-2"
                    >
                      <i className="bi bi-plus me-2"></i>
                      Novo Layout
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline-secondary px-4 py-2"
                    >
                      <i className="bi bi-upload me-2"></i>
                      Carregar PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handlePdfUpload}
        className="d-none"
      />
    </div>
  )
}

export default App
