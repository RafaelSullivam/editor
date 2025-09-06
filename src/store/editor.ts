import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { Layout, Page, Element, EditorState, HistoryState, Point } from '../types'
import { TemplateProcessor } from '../utils/templateProcessor'

interface EditorStore extends EditorState {
  // Layout state
  layout: Layout | null
  currentPage: Page | null
  
  // History state
  history: HistoryState[]
  historyIndex: number
  
  // Actions
  setLayout: (layout: Layout) => void
  createNewLayout: (name: string, pageFormat: { width: number; height: number }) => void
  updateLayout: (updates: Partial<Layout>) => void
  
  // Page actions
  setCurrentPage: (pageId: string) => void
  addPage: (page?: Partial<Page>) => void
  deletePage: (pageId: string) => void
  duplicatePage: (pageId: string) => void
  updatePage: (pageId: string, updates: Partial<Page>) => void
  
  // Element actions
  addElement: (element: Element) => void
  updateElement: (elementId: string, updates: Partial<Element>) => void
  deleteElement: (elementId: string) => void
  duplicateElement: (elementId: string) => void
  moveElement: (elementId: string, delta: Point) => void
  resizeElement: (elementId: string, bounds: { x: number; y: number; width: number; height: number }) => void
  setElementZIndex: (elementId: string, zIndex: number) => void
  
  // Selection actions
  selectElement: (elementId: string, multiple?: boolean) => void
  selectElements: (elementIds: string[]) => void
  deselectAll: () => void
  deleteSelected: () => void
  duplicateSelected: () => void
  
  // Editor actions
  setTool: (tool: EditorState['tool']) => void
  setZoom: (zoom: number) => void
  setPanOffset: (offset: Point) => void
  toggleGrid: () => void
  toggleRulers: () => void
  toggleSnapToGrid: () => void
  toggleSnapToElements: () => void
  
  // Alignment actions
  alignElements: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  distributeElements: (type: 'horizontal' | 'vertical') => void
  alignToPage: (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void
  
  // History actions
  pushHistory: (description: string, data?: any) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Utility actions
  getElementById: (elementId: string) => Element | undefined
  getSelectedElements: () => Element[]
  exportLayout: () => Layout | null
  downloadProject: () => void
  loadFromFile: (file: File) => Promise<void>
  
  // Data processing actions
  templateProcessor: TemplateProcessor
  processElementContent: (element: Element) => Element
  setDataIndex: (index: number) => void
  getTotalDataRecords: () => number
}

const initialEditorState: EditorState = {
  selectedElementIds: [],
  currentPageId: '',
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  isGridVisible: true,
  isRulersVisible: true,
  snapToGrid: true,
  snapToElements: true,
  tool: 'select',
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialEditorState,
    layout: null,
    currentPage: null,
    history: [],
    historyIndex: -1,

    setLayout: (layout) => {
      set({ 
        layout,
        currentPageId: layout.pages[0]?.id || '',
        currentPage: layout.pages[0] || null,
        selectedElementIds: [],
      })
      get().pushHistory('Layout loaded')
    },

    createNewLayout: (name, pageFormat) => {
      const pageId = uuidv4()
      const layout: Layout = {
        id: uuidv4(),
        name,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dataSources: [],
        pages: [{
          id: pageId,
          name: 'Página 1',
          config: {
            width: pageFormat.width,
            height: pageFormat.height,
            unit: 'mm',
            orientation: 'portrait',
            dpi: 300,
          },
          elements: [],
          guides: [],
          snapSettings: {
            snapToGrid: false,
            snapToElements: true,
            snapToGuides: true,
            snapThreshold: 5,
            showSnapLines: true
          },
          backgroundPdf: undefined,
        }],
        metadata: {},
      }
      
      set({ 
        layout,
        currentPageId: pageId,
        currentPage: layout.pages[0],
        selectedElementIds: [],
        history: [],
        historyIndex: -1,
      })
      get().pushHistory('Layout criado')
    },

    updateLayout: (updates) => {
      const { layout } = get()
      if (!layout) return
      
      const updatedLayout = {
        ...layout,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      set({ layout: updatedLayout })
      get().pushHistory('Layout atualizado')
    },

    setCurrentPage: (pageId) => {
      const { layout } = get()
      if (!layout) return
      
      const page = layout.pages.find(p => p.id === pageId)
      if (page) {
        set({ 
          currentPageId: pageId,
          currentPage: page,
          selectedElementIds: [],
        })
      }
    },

    addPage: (pageData = {}) => {
      const { layout } = get()
      if (!layout) return
      
      const pageId = uuidv4()
      const newPage: Page = {
        id: pageId,
        name: `Página ${layout.pages.length + 1}`,
        config: {
          width: 210,
          height: 297,
          unit: 'mm',
          orientation: 'portrait',
          dpi: 300,
        },
        elements: [],
        guides: [],
        snapSettings: {
          snapToGrid: false,
          snapToElements: true,
          snapToGuides: true,
          snapThreshold: 5,
          showSnapLines: true
        },
        backgroundPdf: undefined,
        ...pageData,
      }
      
      const updatedLayout = {
        ...layout,
        pages: [...layout.pages, newPage],
        updatedAt: new Date().toISOString(),
      }
      
      set({ 
        layout: updatedLayout,
        currentPageId: pageId,
        currentPage: newPage,
      })
      get().pushHistory('Página adicionada')
    },

    deletePage: (pageId) => {
      const { layout, currentPageId } = get()
      if (!layout || layout.pages.length <= 1) return
      
      const updatedPages = layout.pages.filter(p => p.id !== pageId)
      const updatedLayout = {
        ...layout,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      }
      
      let newCurrentPageId = currentPageId
      let newCurrentPage = layout.pages.find(p => p.id === currentPageId)
      
      if (currentPageId === pageId) {
        newCurrentPageId = updatedPages[0].id
        newCurrentPage = updatedPages[0]
      }
      
      set({ 
        layout: updatedLayout,
        currentPageId: newCurrentPageId,
        currentPage: newCurrentPage,
        selectedElementIds: [],
      })
      get().pushHistory('Página removida')
    },

    duplicatePage: (pageId) => {
      const { layout } = get()
      if (!layout) return
      
      const page = layout.pages.find(p => p.id === pageId)
      if (!page) return
      
      const newPageId = uuidv4()
      const duplicatedPage: Page = {
        ...page,
        id: newPageId,
        name: `${page.name} (Cópia)`,
        elements: page.elements.map(element => ({
          ...element,
          id: uuidv4(),
        })),
      }
      
      const pageIndex = layout.pages.findIndex(p => p.id === pageId)
      const updatedPages = [
        ...layout.pages.slice(0, pageIndex + 1),
        duplicatedPage,
        ...layout.pages.slice(pageIndex + 1),
      ]
      
      const updatedLayout = {
        ...layout,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      }
      
      set({ 
        layout: updatedLayout,
        currentPageId: newPageId,
        currentPage: duplicatedPage,
      })
      get().pushHistory('Página duplicada')
    },

    updatePage: (pageId, updates) => {
      const { layout } = get()
      if (!layout) return
      
      const updatedPages = layout.pages.map(page =>
        page.id === pageId 
          ? { ...page, ...updates }
          : page
      )
      
      const updatedLayout = {
        ...layout,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      }
      
      set({ layout: updatedLayout })
      
      // Update current page if it's the one being updated
      if (pageId === get().currentPageId) {
        const updatedPage = updatedPages.find(p => p.id === pageId)
        set({ currentPage: updatedPage })
      }
      
      get().pushHistory('Página atualizada')
    },

    addElement: (element) => {
      console.log('Store addElement chamado:', element.id, element.type)
      const { layout, currentPageId } = get()
      console.log('addElement - Layout existe:', !!layout, 'CurrentPageId:', currentPageId)
      if (!layout || !currentPageId) return
      
      const updatedPages = layout.pages.map(page =>
        page.id === currentPageId
          ? { ...page, elements: [...page.elements, element] }
          : page
      )
      
      const currentPageAfterUpdate = updatedPages.find(p => p.id === currentPageId)
      console.log('Elementos após adicionar:', currentPageAfterUpdate?.elements.length)
      
      const updatedLayout = {
        ...layout,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      }
      
      set({ 
        layout: updatedLayout,
        currentPage: currentPageAfterUpdate,
        selectedElementIds: [element.id],
      })
      get().pushHistory('Elemento adicionado')
    },

    updateElement: (elementId, updates) => {
      console.log('Store: updateElement called', elementId, updates)
      const { layout, currentPageId } = get()
      if (!layout || !currentPageId) return
      
      const updatedPages = layout.pages.map(page =>
        page.id === currentPageId
          ? {
              ...page,
              elements: page.elements.map(element =>
                element.id === elementId
                  ? { ...element, ...updates }
                  : element
              ),
            }
          : page
      )
      
      const updatedLayout = {
        ...layout,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      }
      
      console.log('Store: Updated layout', updatedLayout)
      
      set({ 
        layout: updatedLayout as Layout,
        currentPage: updatedPages.find(p => p.id === currentPageId) as Page,
      })
    },

    deleteElement: (elementId) => {
      console.log('Store deleteElement chamado com ID:', elementId)
      const { layout, currentPageId, selectedElementIds } = get()
      console.log('Layout existe:', !!layout, 'CurrentPageId:', currentPageId)
      if (!layout || !currentPageId) return
      
      const currentPageElements = layout.pages.find(p => p.id === currentPageId)?.elements || []
      console.log('Elementos na página atual:', currentPageElements.length)
      console.log('Elemento a ser deletado existe:', currentPageElements.some(e => e.id === elementId))
      
      const updatedPages = layout.pages.map(page =>
        page.id === currentPageId
          ? {
              ...page,
              elements: page.elements.filter(element => element.id !== elementId),
            }
          : page
      )
      
      const updatedLayout = {
        ...layout,
        pages: updatedPages,
        updatedAt: new Date().toISOString(),
      }
      
      console.log('Elementos após filtrar:', updatedPages.find(p => p.id === currentPageId)?.elements.length)
      
      set({ 
        layout: updatedLayout,
        currentPage: updatedPages.find(p => p.id === currentPageId),
        selectedElementIds: selectedElementIds.filter(id => id !== elementId),
      })
      get().pushHistory('Elemento removido')
    },

    duplicateElement: (elementId) => {
      const { layout, currentPageId } = get()
      if (!layout || !currentPageId) return
      
      const currentPage = layout.pages.find(p => p.id === currentPageId)
      const element = currentPage?.elements.find(e => e.id === elementId)
      if (!element) return
      
      const duplicatedElement: Element = {
        ...element,
        id: uuidv4(),
        bounds: {
          ...element.bounds,
          x: element.bounds.x + 10,
          y: element.bounds.y + 10,
        },
      }
      
      get().addElement(duplicatedElement)
    },

    moveElement: (elementId, delta) => {
      const element = get().getElementById(elementId)
      if (!element) return
      
      get().updateElement(elementId, {
        bounds: {
          ...element.bounds,
          x: element.bounds.x + delta.x,
          y: element.bounds.y + delta.y,
        },
      })
    },

    resizeElement: (elementId, bounds) => {
      get().updateElement(elementId, { bounds })
    },

    setElementZIndex: (elementId, zIndex) => {
      get().updateElement(elementId, { zIndex })
    },

    selectElement: (elementId, multiple = false) => {
      const { selectedElementIds } = get()
      
      if (multiple) {
        const newSelection = selectedElementIds.includes(elementId)
          ? selectedElementIds.filter(id => id !== elementId)
          : [...selectedElementIds, elementId]
        set({ selectedElementIds: newSelection })
      } else {
        set({ selectedElementIds: [elementId] })
      }
    },

    selectElements: (elementIds) => {
      set({ selectedElementIds: elementIds })
    },

    deselectAll: () => {
      set({ selectedElementIds: [] })
    },

    deleteSelected: () => {
      const { selectedElementIds } = get()
      selectedElementIds.forEach(id => get().deleteElement(id))
    },

    duplicateSelected: () => {
      const { selectedElementIds } = get()
      selectedElementIds.forEach(id => get().duplicateElement(id))
    },

    setTool: (tool) => {
      set({ tool })
    },

    setZoom: (zoom) => {
      set({ zoom: Math.max(0.1, Math.min(5, zoom)) })
    },

    setPanOffset: (offset) => {
      set({ panOffset: offset })
    },

    toggleGrid: () => {
      set(state => ({ isGridVisible: !state.isGridVisible }))
    },

    toggleRulers: () => {
      set(state => ({ isRulersVisible: !state.isRulersVisible }))
    },

    toggleSnapToGrid: () => {
      set(state => ({ snapToGrid: !state.snapToGrid }))
    },

    toggleSnapToElements: () => {
      set(state => ({ snapToElements: !state.snapToElements }))
    },

    pushHistory: (description, data = null) => {
      const { history, historyIndex, layout } = get()
      
      const historyState: HistoryState = {
        id: uuidv4(),
        description,
        timestamp: Date.now(),
        data: data || layout,
      }
      
      const newHistory = [
        ...history.slice(0, historyIndex + 1),
        historyState,
      ].slice(-50) // Keep only last 50 states
      
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      })
    },

    undo: () => {
      const { history, historyIndex } = get()
      if (historyIndex > 0) {
        const previousState = history[historyIndex - 1]
        set({
          layout: previousState.data,
          historyIndex: historyIndex - 1,
        })
      }
    },

    redo: () => {
      const { history, historyIndex } = get()
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1]
        set({
          layout: nextState.data,
          historyIndex: historyIndex + 1,
        })
      }
    },

    canUndo: () => {
      const { historyIndex } = get()
      return historyIndex > 0
    },

    canRedo: () => {
      const { history, historyIndex } = get()
      return historyIndex < history.length - 1
    },

    getElementById: (elementId) => {
      const { currentPage } = get()
      return currentPage?.elements.find(e => e.id === elementId)
    },

    getSelectedElements: () => {
      const { selectedElementIds, currentPage } = get()
      if (!currentPage) return []
      return currentPage.elements.filter(e => selectedElementIds.includes(e.id))
    },

    exportLayout: () => {
      return get().layout
    },

    downloadProject: () => {
      const layout = get().layout
      if (!layout) return

      const projectData = JSON.stringify(layout, null, 2)
      const blob = new Blob([projectData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${layout.name.replace(/\s+/g, '-')}-layout.json`
      a.click()
      
      URL.revokeObjectURL(url)
    },

    loadFromFile: async (file: File) => {
      try {
        const text = await file.text()
        const layout: Layout = JSON.parse(text)
        
        // Validar estrutura básica
        if (layout && layout.id && layout.pages && Array.isArray(layout.pages)) {
          // Atualizar timestamp
          layout.updatedAt = new Date().toISOString()
          
          get().setLayout(layout)
          get().pushHistory('Projeto carregado do arquivo')
        } else {
          throw new Error('Estrutura do arquivo inválida')
        }
      } catch (error) {
        console.error('Erro ao carregar arquivo:', error)
        throw new Error('Arquivo inválido ou corrompido')
      }
    },

    // Alignment functions
    alignElements: (type) => {
      const { selectedElementIds, currentPage } = get()
      if (!currentPage || selectedElementIds.length < 2) return

      const selectedElements = currentPage.elements.filter(e => 
        selectedElementIds.includes(e.id)
      )

      if (selectedElements.length < 2) return

      // Calcular bounds de referência (primeiro elemento selecionado)
      const referenceElement = selectedElements[0]
      const referenceBounds = referenceElement.bounds

      const updatedElements = selectedElements.map(element => {
        if (element.id === referenceElement.id) return element

        const newBounds = { ...element.bounds }

        switch (type) {
          case 'left':
            newBounds.x = referenceBounds.x
            break
          case 'center':
            newBounds.x = referenceBounds.x + (referenceBounds.width / 2) - (newBounds.width / 2)
            break
          case 'right':
            newBounds.x = referenceBounds.x + referenceBounds.width - newBounds.width
            break
          case 'top':
            newBounds.y = referenceBounds.y
            break
          case 'middle':
            newBounds.y = referenceBounds.y + (referenceBounds.height / 2) - (newBounds.height / 2)
            break
          case 'bottom':
            newBounds.y = referenceBounds.y + referenceBounds.height - newBounds.height
            break
        }

        return { ...element, bounds: newBounds }
      })

      // Atualizar elementos na página
      const updatedPage = {
        ...currentPage,
        elements: currentPage.elements.map(element => {
          const updatedElement = updatedElements.find(e => e.id === element.id)
          return updatedElement || element
        })
      }

      get().updatePage(currentPage.id, updatedPage)
      get().pushHistory(`Elementos alinhados: ${type}`)
    },

    distributeElements: (type) => {
      const { selectedElementIds, currentPage } = get()
      if (!currentPage || selectedElementIds.length < 3) return

      const selectedElements = currentPage.elements
        .filter(e => selectedElementIds.includes(e.id))
        .sort((a, b) => {
          if (type === 'horizontal') {
            return a.bounds.x - b.bounds.x
          } else {
            return a.bounds.y - b.bounds.y
          }
        })

      if (selectedElements.length < 3) return

      const firstElement = selectedElements[0]
      const lastElement = selectedElements[selectedElements.length - 1]

      let totalSpace: number
      let availableSpace: number

      if (type === 'horizontal') {
        totalSpace = (lastElement.bounds.x + lastElement.bounds.width) - firstElement.bounds.x
        const totalElementWidth = selectedElements.reduce((sum, el) => sum + el.bounds.width, 0)
        availableSpace = totalSpace - totalElementWidth
      } else {
        totalSpace = (lastElement.bounds.y + lastElement.bounds.height) - firstElement.bounds.y
        const totalElementHeight = selectedElements.reduce((sum, el) => sum + el.bounds.height, 0)
        availableSpace = totalSpace - totalElementHeight
      }

      const spacing = availableSpace / (selectedElements.length - 1)

      const updatedElements = selectedElements.map((element, index) => {
        if (index === 0 || index === selectedElements.length - 1) {
          return element // Não mover o primeiro e último elementos
        }

        const newBounds = { ...element.bounds }
        
        if (type === 'horizontal') {
          let newX = firstElement.bounds.x + firstElement.bounds.width
          for (let i = 1; i < index; i++) {
            newX += spacing + selectedElements[i].bounds.width
          }
          newX += spacing
          newBounds.x = newX
        } else {
          let newY = firstElement.bounds.y + firstElement.bounds.height
          for (let i = 1; i < index; i++) {
            newY += spacing + selectedElements[i].bounds.height
          }
          newY += spacing
          newBounds.y = newY
        }

        return { ...element, bounds: newBounds }
      })

      // Atualizar elementos na página
      const updatedPage = {
        ...currentPage,
        elements: currentPage.elements.map(element => {
          const updatedElement = updatedElements.find(e => e.id === element.id)
          return updatedElement || element
        })
      }

      get().updatePage(currentPage.id, updatedPage)
      get().pushHistory(`Elementos distribuídos: ${type}`)
    },

    alignToPage: (type) => {
      const { selectedElementIds, currentPage } = get()
      if (!currentPage || selectedElementIds.length === 0) return

      const selectedElements = currentPage.elements.filter(e => 
        selectedElementIds.includes(e.id)
      )

      const pageConfig = currentPage.config
      const pageWidth = pageConfig.width
      const pageHeight = pageConfig.height

      const updatedElements = selectedElements.map(element => {
        const newBounds = { ...element.bounds }

        switch (type) {
          case 'left':
            newBounds.x = 0
            break
          case 'center':
            newBounds.x = (pageWidth / 2) - (newBounds.width / 2)
            break
          case 'right':
            newBounds.x = pageWidth - newBounds.width
            break
          case 'top':
            newBounds.y = 0
            break
          case 'middle':
            newBounds.y = (pageHeight / 2) - (newBounds.height / 2)
            break
          case 'bottom':
            newBounds.y = pageHeight - newBounds.height
            break
        }

        return { ...element, bounds: newBounds }
      })

      // Atualizar elementos na página
      const updatedPage = {
        ...currentPage,
        elements: currentPage.elements.map(element => {
          const updatedElement = updatedElements.find(e => e.id === element.id)
          return updatedElement || element
        })
      }

      get().updatePage(currentPage.id, updatedPage)
      get().pushHistory(`Elementos alinhados à página: ${type}`)
    },

    // Template processor and data methods
    templateProcessor: new TemplateProcessor([]),

    processElementContent: (element: Element) => {
      const { layout, templateProcessor } = get()
      if (!layout) return element
      
      // Atualizar as fontes de dados do processador
      templateProcessor.updateDataSources(layout.dataSources || [])
      
      return templateProcessor.processElement(element)
    },

    setDataIndex: (index: number) => {
      const { templateProcessor } = get()
      templateProcessor.setDataIndex(index)
    },

    getTotalDataRecords: () => {
      const { templateProcessor } = get()
      return templateProcessor.getTotalDataRecords()
    },
  }))
)
