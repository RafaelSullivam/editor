// @ts-check
import { v4 as uuidv4 } from 'uuid';

/**
 * @typedef {import('../types').Layout} Layout
 * @typedef {import('../types').Element} Element
 */

/**
 * @typedef {Object} Template
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'business' | 'financial' | 'educational' | 'personal' | 'certificate' | 'invoice'} category
 * @property {string} [thumbnail]
 * @property {Layout} layout
 * @property {string[]} tags
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ElementLibraryItem
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {'headers' | 'footers' | 'logos' | 'shapes' | 'text' | 'decorative' | 'charts'} category
 * @property {Partial<Element> & { type: Element['type'] }} element
 * @property {string} [thumbnail]
 * @property {string[]} tags
 */

export const defaultTemplates = [
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
          unit: 'mm',
          orientation: 'portrait',
          dpi: 300,
        },
        elements: [
          {
            id: uuidv4(),
            type: 'text',
            name: 'Footer Geocontrole',
            bounds: { x: 10, y: 230, width: 190, height: 50 },
            locked: false,
            visible: true,
            zIndex: 1,
            content: 'Status do Ensaio: {{StatusEnsaio}} | Aprovado ☐ Reprovado ☐\nObservação: {{Observacao}}\n\nExecução: {{Executado}} | Aprovação: | Fiscalização:\nCódigo laboratório: | DATA EMISSÃO: | Pág: {{pagina}}/{{totalPaginas}}\n\nEste relatório de ensaio só pode ser copiado integralmente ou parcialmente com autorização da Geocontrole\nAv.Canadá,Nº 159 - Jardim Canadá Nova Lima - Minas Gerais - Brasil\nCEP: 34007-654 Tel.: +55 31 3517-9011\n**Informações fornecidas pelo projeto e/ou cliente\n\nwww.geocontrole.com - e-mail: mail.br@geocontrole.com',
            isDynamic: true,
            fontSize: 7,
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
];

export const elementLibrary = [];

export const getTemplatesByCategory = (category) => {
  if (!category) return defaultTemplates;
  return defaultTemplates.filter(template => template.category === category);
};

export const getElementsByCategory = (category) => {
  if (!category) return elementLibrary;
  return elementLibrary.filter(item => item.category === category);
};

export const createLayoutFromTemplate = (templateId) => {
  const template = defaultTemplates.find(t => t.id === templateId);
  if (!template) return null;

  const newLayout = {
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
  };

  return newLayout;
};

export const cloneLibraryElement = (elementId) => {
  const libraryItem = elementLibrary.find(item => item.id === elementId);
  if (!libraryItem) return null;

  return {
    id: uuidv4(),
    locked: false,
    visible: true,
    zIndex: 0,
    ...libraryItem.element
  };
};
