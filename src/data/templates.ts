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
      dataSources: [],
      pages: [{
        id: uuidv4(),
        name: 'Página 1',
        config: {
          width: 210,
          height: 297,
          unit: 'mm' as const,
          orientation: 'portrait' as const,
          dpi: 300,
        },
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            name: 'Título',
            bounds: { x: 20, y: 20, width: 170, height: 15 },
            locked: false,
            visible: true,
            zIndex: 1,
            content: 'RELATÓRIO',
            isDynamic: false,
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
        ],
        guides: [],
        snapSettings: {
          snapToGrid: false,
          snapToElements: true,
          snapToGuides: true,
          snapThreshold: 5,
          showSnapLines: true
        }
      }]
    }
  },
  {
    id: 'template-geocontrole-field-report',
    name: 'Relatório de Campo Geocontrole',
    description: 'Template completo para relatórios de ensaio de campo da Geocontrole',
    category: 'business',
    tags: ['geocontrole', 'relatório', 'campo', 'ensaio', 'laboratório'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    layout: {
      id: uuidv4(),
      name: 'Relatório de Campo Geocontrole',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
      dataSources: [],
      pages: [{
        id: uuidv4(),
        name: 'Página 1',
        config: {
          width: 210,
          height: 297,
          unit: 'mm' as const,
          orientation: 'portrait' as const,
          dpi: 300,
        },
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            name: 'Título Principal',
            bounds: { x: 20, y: 20, width: 170, height: 15 },
            locked: false,
            visible: true,
            zIndex: 1,
            content: 'RELATÓRIO DE ENSAIO DE CAMPO',
            isDynamic: false,
            fontSize: 18,
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
          },
          {
            id: uuidv4(),
            type: 'text',
            name: 'Identificação do Projeto',
            bounds: { x: 20, y: 45, width: 170, height: 30 },
            locked: false,
            visible: true,
            zIndex: 1,
            content: `Projeto: {{NomeProjeto}}
Cliente: {{NomeCliente}}
Local: {{LocalEnsaio}}
Data: {{DataEnsaio}}`,
            isDynamic: true,
            fontSize: 10,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            textAlign: 'left',
            verticalAlign: 'top',
            lineHeight: 1.4,
            letterSpacing: 0,
            textDecoration: 'none',
            wordWrap: true
          },
          {
            id: uuidv4(),
            type: 'text',
            name: 'Área de Conteúdo',
            bounds: { x: 20, y: 85, width: 170, height: 120 },
            locked: false,
            visible: true,
            zIndex: 1,
            content: `DESCRIÇÃO DOS ENSAIOS REALIZADOS

Tipo de Ensaio: {{TipoEnsaio}}
Norma Aplicada: {{NormaAplicada}}
Equipamentos Utilizados: {{Equipamentos}}

RESULTADOS:

{{ResultadosEnsaio}}

CONCLUSÕES:

{{Conclusoes}}`,
            isDynamic: true,
            fontSize: 10,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            textAlign: 'left',
            verticalAlign: 'top',
            lineHeight: 1.5,
            letterSpacing: 0,
            textDecoration: 'none',
            wordWrap: true
          },
          {
            id: uuidv4(),
            type: 'text',
            name: 'Footer Geocontrole',
            bounds: { x: 10, y: 230, width: 190, height: 50 },
            locked: false,
            visible: true,
            zIndex: 1,
            content: `┌─────────────────────────────────────────────────────────────────────┐
│ Status do Ensaio: {{StatusEnsaio}}      │ Aprovado ☐ │ Observação:   │
│                                          │ Reprovado ☐ │ {{Observacao}} │
├──────────────────────────────────────────┼─────────────┼───────────────┤
│ Execução: {{Executado}}                 │ Aprovação:  │ Fiscalização: │
├──────────────────────────────────────────┼─────────────┴───────────────┤
│ Código laboratório:    │ DATA EMISSÃO:     │ Pág: {{pagina}}/{{totalPaginas}} │
└─────────────────────────────────────────────────────────────────────┘

Este relatório de ensaio só pode ser copiado integralmente ou 
parcialmente com autorização da Geocontrole

Av.Canadá,Nº 159 - Jardim Canadá Nova Lima - Minas Gerais - Brasil
CEP: 34007-654 Tel.: +55 31 3517-9011
**Informações fornecidas pelo projeto e/ou cliente

═══════════════════════════════════════════════════════════════════
   www.geocontrole.com - e-mail: mail.br@geocontrole.com
═══════════════════════════════════════════════════════════════════`,
            isDynamic: true,
            fontSize: 7,
            fontFamily: 'Courier New',
            fontWeight: 'normal',
            fontStyle: 'normal',
            color: '#000000',
            textAlign: 'left',
            verticalAlign: 'top',
            lineHeight: 1.1,
            letterSpacing: 0,
            textDecoration: 'none',
            wordWrap: false
          }
        ],
        guides: [],
        snapSettings: {
          snapToGrid: false,
          snapToElements: true,
          snapToGuides: true,
          snapThreshold: 5,
          showSnapLines: true
        }
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
      locked: false,
      visible: true,
      zIndex: 1,
      content: 'TÍTULO',
      isDynamic: false,
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
    id: 'footer-geocontrole',
    name: 'Footer Geocontrole',
    description: 'Rodapé completo da Geocontrole para relatórios de ensaio',
    category: 'footers',
    tags: ['footer', 'rodapé', 'geocontrole', 'relatório', 'ensaio'],
    element: {
      type: 'text',
      name: 'Footer Geocontrole',
      bounds: { x: 10, y: 250, width: 190, height: 40 },
      locked: false,
      visible: true,
      zIndex: 1,
      content: `Status do Ensaio: {{StatusEnsaio}}
      
Aprovado | Reprovado

Observação: {{Observacao}}

Execução: {{Executado}} | Aprovação: | Fiscalização:

Código laboratório: | DATA EMISSÃO: | Pág: {{pagina}}/{{totalPaginas}}

Este relatório de ensaio só pode ser copiado integralmente ou parcialmente com autorização da Geocontrole
Av.Canadá,Nº 159 - Jardim Canadá Nova Lima - Minas Gerais - Brasil - CEP: 34007-654 Tel.: +55 31 3517-9011
**Informações fornecidas pelo projeto e/ou cliente

www.geocontrole.com - e-mail: mail.br@geocontrole.com`,
      isDynamic: true,
      fontSize: 8,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontStyle: 'normal',
      color: '#000000',
      textAlign: 'left',
      verticalAlign: 'top',
      lineHeight: 1.1,
      letterSpacing: 0,
      textDecoration: 'none',
      wordWrap: true
    }
  }
]

// Função para buscar templates por categoria
export const getTemplatesByCategory = (category?: string): Template[] => {
  if (!category) return defaultTemplates
  return defaultTemplates.filter(template => template.category === category)
}

// Função para buscar elementos por categoria
export const getElementsByCategory = (category?: string): ElementLibraryItem[] => {
  if (!category) return elementLibrary
  return elementLibrary.filter(item => item.category === category)
}

// Função para criar um novo layout a partir de um template
export const createLayoutFromTemplate = (templateId: string): Layout | null => {
  const template = defaultTemplates.find(t => t.id === templateId)
  if (!template) return null

  // Clone do layout com novos IDs
  const newLayout: Layout = {
    ...template.layout,
    id: uuidv4(),
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
