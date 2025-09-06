import { useEffect } from 'react'
import { useEditorStore } from '../store/editor'

/**
 * Hook para gerenciar dados dinâmicos no editor
 */
export const useDynamicData = () => {
  const { 
    layout, 
    templateProcessor, 
    processElementContent, 
    setDataIndex, 
    getTotalDataRecords 
  } = useEditorStore()

  // Atualizar o template processor quando as fontes de dados mudarem
  useEffect(() => {
    if (layout?.dataSources) {
      templateProcessor.updateDataSources(layout.dataSources)
    }
  }, [layout?.dataSources, templateProcessor])

  /**
   * Processa todos os elementos da página atual com dados dinâmicos
   */
  const processCurrentPageElements = (dataIndex: number = 0) => {
    if (!layout?.pages) return []
    
    setDataIndex(dataIndex)
    
    const currentPage = layout.pages.find(page => page.id === layout.pages[0].id)
    if (!currentPage) return []
    
    return currentPage.elements.map(element => processElementContent(element))
  }

  /**
   * Verifica se há elementos dinâmicos na página atual
   */
  const hasDynamicElements = () => {
    if (!layout?.pages) return false
    
    const currentPage = layout.pages[0] // Assumindo primeira página por agora
    if (!currentPage) return false
    
    return currentPage.elements.some(element => 
      element.type === 'text' && element.isDynamic
    )
  }

  /**
   * Obtém preview dos dados para um elemento específico
   */
  const getElementPreview = (element: any, dataIndex: number = 0) => {
    setDataIndex(dataIndex)
    return processElementContent(element)
  }

  /**
   * Obtém todas as variáveis disponíveis
   */
  const getAvailableVariables = () => {
    return templateProcessor.getAvailableVariables()
  }

  /**
   * Verifica se um template tem variáveis
   */
  const hasVariables = (template: string) => {
    return templateProcessor.hasVariables(template)
  }

  /**
   * Obtém lista de variáveis usadas em um template
   */
  const getUsedVariables = (template: string) => {
    return templateProcessor.getUsedVariables(template)
  }

  /**
   * Obtém valor de uma variável específica
   */
  const getVariableValue = (variableName: string, sourceId?: string) => {
    return templateProcessor.getVariableValue(variableName, sourceId)
  }

  /**
   * Processa um template string
   */
  const processTemplate = (template: string, sourceId?: string) => {
    return templateProcessor.processTemplate(template, sourceId)
  }

  return {
    // Estado
    totalDataRecords: getTotalDataRecords(),
    hasDynamicElements: hasDynamicElements(),
    availableVariables: getAvailableVariables(),
    
    // Métodos
    processCurrentPageElements,
    getElementPreview,
    setDataIndex,
    hasVariables,
    getUsedVariables,
    getVariableValue,
    processTemplate,
  }
}
