import type { Layout, Element } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface Template {
  id: string
  name: string
  description: string
  category: 'business' | 'financial' | 'educational' | 'personal' | 'certificate' | 'invoice'
  thumbnail?: string
  layout: Layout
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ElementLibraryItem {
  id: string
  name: string
  description: string
  category: 'headers' | 'footers' | 'logos' | 'shapes' | 'text' | 'decorative' | 'charts'
  element: Partial<Element> & { type: Element['type'] }
  thumbnail?: string
  tags: string[]
}

// Templates básicos - versão simplificada para começar
export const defaultTemplates: Template[] = [
  {
    id: 'template-simple-report',
    name: 'Relatório Simples',
    description: 'Template básico para relatórios profissionais',
    category: 'business',
    tags: ['relatório', 'básico', 'profissional'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layout: {
      id: uuidv4(),
      name: 'Relatório Simples',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      pages: [{
        id: uuidv4(),
        name: 'Página 1',
        config: {
          width: 210,
          height: 297,
          unit: 'mm' as const,
          orientation: 'portrait' as const,
          dpi: 96,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        elements: []
      }]
    }
  },
  {
    id: 'template-certificate-basic',
    name: 'Certificado Básico',
    description: 'Template simples para certificados',
    category: 'certificate',
    tags: ['certificado', 'básico'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layout: {
      id: uuidv4(),
      name: 'Certificado Básico',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      pages: [{
        id: uuidv4(),
        name: 'Certificado',
        config: {
          width: 297,
          height: 210,
          unit: 'mm' as const,
          orientation: 'landscape' as const,
          dpi: 96,
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        elements: []
      }]
    }
  }
]

// Biblioteca de elementos básica
export const elementLibrary: ElementLibraryItem[] = [
  {
    id: 'text-title',
    name: 'Título',
    description: 'Texto de título',
    category: 'text',
    tags: ['título', 'texto'],
    element: {
      type: 'text',
      name: 'Título',
      bounds: { x: 0, y: 0, width: 100, height: 15 },
      content: 'TÍTULO',
      fontSize: 24,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      fontStyle: 'normal',
      color: '#000000',
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.2,
      letterSpacing: 0,
      textDecoration: 'none',
      wordWrap: true
    }
  },
  {
    id: 'shape-rectangle',
    name: 'Retângulo',
    description: 'Retângulo básico',
    category: 'shapes',
    tags: ['retângulo', 'forma'],
    element: {
      type: 'rectangle',
      name: 'Retângulo',
      bounds: { x: 0, y: 0, width: 80, height: 30 },
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1
    }
  },
  {
    id: 'line-separator',
    name: 'Linha',
    description: 'Linha separadora',
    category: 'decorative',
    tags: ['linha', 'separador'],
    element: {
      type: 'line',
      name: 'Linha',
      bounds: { x: 0, y: 0, width: 100, height: 1 },
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 100, y: 0 },
      stroke: '#000000',
      strokeWidth: 1,
      strokeStyle: 'solid'
    }
  }
]

// Função para buscar templates por categoria
export const getTemplatesByCategory = (category?: string): Template[] => {
  if (!category) return defaultTemplates
  return defaultTemplates.filter(template => template.category === category)
}

// Função para buscar elementos da biblioteca por categoria
export const getElementsByCategory = (category?: string): ElementLibraryItem[] => {
  if (!category) return elementLibrary
  return elementLibrary.filter(item => item.category === category)
}

// Função para criar um novo layout a partir de um template
export const createLayoutFromTemplate = (templateId: string): Layout | null => {
  const template = defaultTemplates.find(t => t.id === templateId)
  if (!template) return null

  // Clonar o layout e gerar novos IDs
  const newLayout: Layout = {
    ...template.layout,
    id: uuidv4(),
    name: `${template.layout.name} - Cópia`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pages: template.layout.pages.map(page => ({
      ...page,
      id: uuidv4(),
      elements: page.elements.map(element => ({
        ...element,
        id: uuidv4()
      }))
    }))
  }

  return newLayout
}

// Função para clonar um elemento da biblioteca
export const cloneLibraryElement = (elementId: string): Element | null => {
  const libraryItem = elementLibrary.find(item => item.id === elementId)
  if (!libraryItem) return null

  return {
    id: uuidv4(),
    locked: false,
    visible: true,
    zIndex: 0,
    ...libraryItem.element
  } as Element
}
