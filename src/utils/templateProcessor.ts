import type { DataSource, Variable, Element } from '../types/layout'

/**
 * Processa templates com variáveis dinâmicas
 */
export class TemplateProcessor {
  private dataSources: DataSource[]
  private currentDataIndex: number = 0

  constructor(dataSources: DataSource[] = []) {
    this.dataSources = dataSources
  }

  /**
   * Atualiza as fontes de dados
   */
  updateDataSources(dataSources: DataSource[]) {
    this.dataSources = dataSources
  }

  /**
   * Define qual linha de dados usar para processamento
   */
  setDataIndex(index: number) {
    this.currentDataIndex = index
  }

  /**
   * Processa um template string substituindo variáveis por valores reais
   */
  processTemplate(template: string, dataSourceId?: string): string {
    if (!template) return ''
    
    // Regex para encontrar variáveis no formato ${variableName}
    const variableRegex = /\$\{([^}]+)\}/g
    
    return template.replace(variableRegex, (match, variableName) => {
      const value = this.getVariableValue(variableName, dataSourceId)
      return value !== undefined ? String(value) : match
    })
  }

  /**
   * Obtém o valor de uma variável específica
   */
  getVariableValue(variableName: string, dataSourceId?: string): any {
    // Se um dataSourceId específico foi fornecido, usar apenas essa fonte
    if (dataSourceId) {
      const dataSource = this.dataSources.find(ds => ds.id === dataSourceId)
      return this.getValueFromDataSource(dataSource, variableName)
    }

    // Buscar em todas as fontes de dados
    for (const dataSource of this.dataSources) {
      const value = this.getValueFromDataSource(dataSource, variableName)
      if (value !== undefined) {
        return value
      }
    }

    return undefined
  }

  /**
   * Obtém valor de uma fonte de dados específica
   */
  private getValueFromDataSource(dataSource: DataSource | undefined, variableName: string): any {
    if (!dataSource || !dataSource.data || dataSource.data.length === 0) {
      return undefined
    }

    // Verifica se a variável existe na fonte
    const variable = dataSource.variables.find(v => v.name === variableName)
    if (!variable) {
      return undefined
    }

    // Obtém os dados da linha atual
    const dataIndex = Math.min(this.currentDataIndex, dataSource.data.length - 1)
    const rowData = dataSource.data[dataIndex]
    
    if (!rowData) {
      return undefined
    }

    const rawValue = rowData[variableName]
    
    // Aplica formatação baseada no tipo da variável
    return this.formatValue(rawValue, variable)
  }

  /**
   * Formata um valor baseado no tipo da variável
   */
  private formatValue(value: any, variable: Variable): any {
    if (value === null || value === undefined) {
      return this.getDefaultValue(variable.type)
    }

    switch (variable.type) {
      case 'text':
        return String(value)
      
      case 'number':
        const num = Number(value)
        return isNaN(num) ? 0 : num
      
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('pt-BR')
        }
        const date = new Date(value)
        return isNaN(date.getTime()) ? 'Data inválida' : date.toLocaleDateString('pt-BR')
      
      case 'boolean':
        return Boolean(value)
      
      case 'image':
        return String(value) // URL da imagem
      
      case 'color':
        return String(value).startsWith('#') ? String(value) : `#${String(value)}`
      
      default:
        return String(value)
    }
  }

  /**
   * Retorna um valor padrão para cada tipo de variável
   */
  private getDefaultValue(type: Variable['type']): any {
    switch (type) {
      case 'text':
        return ''
      case 'number':
        return 0
      case 'date':
        return new Date().toLocaleDateString('pt-BR')
      case 'boolean':
        return false
      case 'image':
        return ''
      case 'color':
        return '#000000'
      default:
        return ''
    }
  }

  /**
   * Processa um elemento e retorna uma versão com dados dinâmicos aplicados
   */
  processElement(element: Element): Element {
    if (element.type === 'text' && element.isDynamic) {
      const textElement = { ...element }

      // Processa conteúdo do texto
      if (element.dataBinding) {
        const value = this.getVariableValue(
          element.dataBinding.variableName,
          element.dataBinding.sourceId
        )
        textElement.content = String(value || element.content)
      } else {
        // Processa template strings no conteúdo
        textElement.content = this.processTemplate(element.content)
      }

      // Processa propriedades CSS vinculadas
      if (element.dataBinding?.property) {
        const value = this.getVariableValue(
          element.dataBinding.variableName,
          element.dataBinding.sourceId
        )
        
        if (value !== undefined) {
          // Atualiza propriedades específicas baseadas no binding
          switch (element.dataBinding.property) {
            case 'color':
              textElement.color = String(value)
              break
            case 'fontSize':
              textElement.fontSize = Number(value) || textElement.fontSize
              break
            case 'fontWeight':
              textElement.fontWeight = String(value) as any
              break
            case 'fontFamily':
              textElement.fontFamily = String(value)
              break
            case 'lineHeight':
              textElement.lineHeight = Number(value) || textElement.lineHeight
              break
            case 'letterSpacing':
              textElement.letterSpacing = Number(value) || textElement.letterSpacing
              break
          }
        }
      }

      return textElement
    }

    return element
  }

  /**
   * Obtém todas as variáveis disponíveis
   */
  getAvailableVariables(): Array<{ 
    sourceId: string
    sourceName: string
    variables: Variable[] 
  }> {
    return this.dataSources.map(dataSource => ({
      sourceId: dataSource.id,
      sourceName: dataSource.name,
      variables: dataSource.variables
    }))
  }

  /**
   * Verifica se um template contém variáveis
   */
  hasVariables(template: string): boolean {
    const variableRegex = /\$\{([^}]+)\}/g
    return variableRegex.test(template)
  }

  /**
   * Obtém lista de variáveis usadas em um template
   */
  getUsedVariables(template: string): string[] {
    const variableRegex = /\$\{([^}]+)\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(template)) !== null) {
      variables.push(match[1])
    }

    return [...new Set(variables)] // Remove duplicatas
  }

  /**
   * Obtém o número total de registros de dados disponíveis
   */
  getTotalDataRecords(): number {
    if (this.dataSources.length === 0) return 0
    
    // Retorna o maior número de registros entre todas as fontes
    return Math.max(...this.dataSources.map(ds => ds.data?.length || 0))
  }

  /**
   * Cria múltiplas versões de um elemento com diferentes dados
   */
  processElementForAllData(element: Element): Element[] {
    const totalRecords = this.getTotalDataRecords()
    if (totalRecords === 0) return [element]

    const processedElements: Element[] = []
    
    for (let i = 0; i < totalRecords; i++) {
      this.setDataIndex(i)
      processedElements.push(this.processElement(element))
    }

    return processedElements
  }
}
