// @ts-nocheck
import React, { useState } from 'react'
import { useEditorStore } from '../store/editor'
import { defaultTemplates, elementLibrary } from '../data/templates.js'
// import type { Template, ElementLibraryItem } from '../data/templates'
import type { Element as LayoutElement } from '../types'

interface TemplateManagerProps {
  onClose: () => void
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'elements'>('templates')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const { setLayout, addElement, currentPage } = useEditorStore()

  const templateCategories = [
    { id: '', name: 'Todos' },
    { id: 'business', name: 'Negócios' },
    { id: 'financial', name: 'Financeiro' },
    { id: 'certificate', name: 'Certificados' },
    { id: 'invoice', name: 'Faturas' },
    { id: 'educational', name: 'Educacional' },
    { id: 'personal', name: 'Pessoal' }
  ]

  const elementCategories = [
    { id: '', name: 'Todos' },
    { id: 'text', name: 'Texto' },
    { id: 'shapes', name: 'Formas' },
    { id: 'decorative', name: 'Decorativo' },
    { id: 'headers', name: 'Cabeçalhos' },
    { id: 'footers', name: 'Rodapés' },
    { id: 'logos', name: 'Logos' },
    { id: 'charts', name: 'Gráficos' }
  ]

  // Filtrar templates e elementos por categoria
  const templates = selectedCategory ? 
    defaultTemplates.filter(template => template.category === selectedCategory) : 
    defaultTemplates
  
  const elements = selectedCategory ? 
    elementLibrary.filter(item => item.category === selectedCategory) : 
    elementLibrary

  const handleTemplateSelect = (template: any) => {
    console.log('=== TEMPLATE SELECT DEBUG ===')
    console.log('Template selecionado:', template.name)
    
    // Criar layout a partir do template
    const templateFound = defaultTemplates.find(t => t.id === template.id)
    if (!templateFound) {
      console.log('ERRO: Template não encontrado!')
      return
    }

    const newLayout = {
      ...templateFound.layout,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: templateFound.layout.pages.map(page => ({
        ...page,
        id: crypto.randomUUID(),
        elements: page.elements.map(element => ({
          ...element,
          id: crypto.randomUUID()
        }))
      }))
    }
    
    console.log('Layout criado com páginas:', newLayout.pages.length)
    console.log('Elementos na primeira página:', newLayout.pages[0]?.elements?.length || 0)
    
    setLayout(newLayout)
    console.log('setLayout chamado')
    
    // Verificar estado após aplicação (com delay para garantir atualização)
    setTimeout(() => {
      const currentState = window.editorStore?.getState()
      console.log('Estado após setLayout - CurrentPage elements:', currentState?.currentPage?.elements?.length || 0)
      console.log('=== END TEMPLATE SELECT DEBUG ===')
    }, 100)
    
    onClose()
  }

  const handleElementSelect = (libraryItem: any) => {
    if (!currentPage) return
    
    // Clonar elemento da biblioteca
    const libraryItemFound = elementLibrary.find(item => item.id === libraryItem.id)
    if (!libraryItemFound) return

    const newElement = {
      id: crypto.randomUUID(),
      locked: false,
      visible: true,
      zIndex: 0,
      ...libraryItemFound.element
    } as LayoutElement
    
    if (newElement && newElement.bounds) {
      // Posicionar o elemento no centro da tela
      const centerX = currentPage.config.width / 2 - newElement.bounds.width / 2
      const centerY = currentPage.config.height / 2 - newElement.bounds.height / 2
      
      newElement.bounds = {
        ...newElement.bounds,
        x: centerX,
        y: centerY
      }
      
      addElement(newElement)
    }
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi-collection me-2"></i>
              Biblioteca de Templates e Elementos
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('templates')
                    setSelectedCategory('')
                  }}
                >
                  <i className="bi-file-earmark-text me-2"></i>
                  Templates
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'elements' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('elements')
                    setSelectedCategory('')
                  }}
                >
                  <i className="bi-puzzle me-2"></i>
                  Elementos
                </button>
              </li>
            </ul>

            <div className="row">
              {/* Sidebar com categorias */}
              <div className="col-md-3">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">Categorias</h6>
                  </div>
                  <div className="list-group list-group-flush">
                    {(activeTab === 'templates' ? templateCategories : elementCategories).map(category => (
                      <button
                        key={category.id}
                        className={`list-group-item list-group-item-action ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Conteúdo principal */}
              <div className="col-md-9">
                {activeTab === 'templates' ? (
                  <div className="row g-3">
                    {templates.length === 0 ? (
                      <div className="col-12">
                        <div className="text-center text-muted py-5">
                          <i className="bi-file-earmark-text display-4 d-block mb-3"></i>
                          <p>Nenhum template encontrado nesta categoria.</p>
                        </div>
                      </div>
                    ) : (
                      templates.map(template => (
                        <div key={template.id} className="col-md-6 col-lg-4">
                          <div className="card h-100 template-card" style={{ cursor: 'pointer' }}>
                            <div 
                              className="card-body d-flex flex-column"
                              onClick={() => handleTemplateSelect(template)}
                            >
                              {/* Thumbnail placeholder */}
                              <div className="bg-light rounded mb-3 d-flex align-items-center justify-content-center" style={{ height: '120px' }}>
                                <i className="bi-file-earmark-text display-4 text-muted"></i>
                              </div>
                              
                              <h6 className="card-title">{template.name}</h6>
                              <p className="card-text text-muted small flex-grow-1">
                                {template.description}
                              </p>
                              
                              <div className="d-flex flex-wrap gap-1 mb-2">
                                {template.tags.slice(0, 3).map(tag => (
                                  <span key={tag} className="badge bg-secondary text-white small">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              <button className="btn btn-primary btn-sm">
                                <i className="bi-plus-circle me-1"></i>
                                Usar Template
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="row g-3">
                    {elements.length === 0 ? (
                      <div className="col-12">
                        <div className="text-center text-muted py-5">
                          <i className="bi-puzzle display-4 d-block mb-3"></i>
                          <p>Nenhum elemento encontrado nesta categoria.</p>
                        </div>
                      </div>
                    ) : (
                      elements.map(libraryItem => (
                        <div key={libraryItem.id} className="col-md-4 col-lg-3">
                          <div className="card h-100 element-card" style={{ cursor: 'pointer' }}>
                            <div 
                              className="card-body d-flex flex-column text-center"
                              onClick={() => handleElementSelect(libraryItem)}
                            >
                              {/* Icon baseado no tipo */}
                              <div className="bg-light rounded mb-3 d-flex align-items-center justify-content-center" style={{ height: '80px' }}>
                                <i className={`display-6 text-primary ${
                                  libraryItem.element.type === 'text' ? 'bi-type' :
                                  libraryItem.element.type === 'rectangle' ? 'bi-square' :
                                  libraryItem.element.type === 'line' ? 'bi-hr' :
                                  'bi-puzzle'
                                }`}></i>
                              </div>
                              
                              <h6 className="card-title">{libraryItem.name}</h6>
                              <p className="card-text text-muted small flex-grow-1">
                                {libraryItem.description}
                              </p>
                              
                              <div className="d-flex flex-wrap gap-1 mb-2 justify-content-center">
                                {libraryItem.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="badge bg-light text-dark small">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              
                              <button className="btn btn-outline-primary btn-sm">
                                <i className="bi-plus-circle me-1"></i>
                                Adicionar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
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
