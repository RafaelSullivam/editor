import type { Operation, OperationResult } from '../types/collaboration'
import type { Element } from '../types/layout'

/**
 * Sistema de Transformação Operacional (OT) para sincronização colaborativa
 * Implementa algoritmos para resolver conflitos quando múltiplos usuários
 * editam o mesmo documento simultaneamente.
 */

export class OperationalTransform {
  /**
   * Transforma uma operação contra outra operação concorrente
   * @param op1 - Operação original
   * @param op2 - Operação concorrente
   * @returns Tupla com as operações transformadas [op1', op2']
   */
  static transform(op1: Operation, op2: Operation): [Operation, Operation] {
    // Se as operações não interferem entre si, mantém inalteradas
    if (!this.interfere(op1, op2)) {
      return [op1, op2]
    }

    // Transformações específicas por tipo de operação
    switch (op1.type) {
      case 'insert':
        return this.transformInsert(op1, op2)
      case 'delete':
        return this.transformDelete(op1, op2)
      case 'modify':
        return this.transformModify(op1, op2)
      case 'move':
        return this.transformMove(op1, op2)
      default:
        return [op1, op2]
    }
  }

  /**
   * Verifica se duas operações interferem entre si
   */
  private static interfere(op1: Operation, op2: Operation): boolean {
    // Operações no mesmo elemento sempre interferem
    if (op1.elementId && op2.elementId && op1.elementId === op2.elementId) {
      return true
    }

    // Operações de inserção/exclusão em posições próximas podem interferir
    if ((op1.type === 'insert' || op1.type === 'delete') &&
        (op2.type === 'insert' || op2.type === 'delete') &&
        op1.position !== undefined && op2.position !== undefined) {
      return Math.abs(op1.position - op2.position) <= 1
    }

    return false
  }

  /**
   * Transforma operações de inserção
   */
  private static transformInsert(op1: Operation, op2: Operation): [Operation, Operation] {
    if (op1.type !== 'insert') return [op1, op2]

    const newOp1 = { ...op1 }
    const newOp2 = { ...op2 }

    switch (op2.type) {
      case 'insert':
        // Ambas inserindo: ajustar posições
        if (op1.position !== undefined && op2.position !== undefined) {
          if (op2.position <= op1.position) {
            newOp1.position = op1.position + 1
          } else {
            newOp2.position = op2.position + 1
          }
        }
        break

      case 'delete':
        // Inserção vs exclusão: ajustar posição da inserção
        if (op1.position !== undefined && op2.position !== undefined) {
          if (op2.position < op1.position) {
            newOp1.position = op1.position - 1
          }
        }
        break

      case 'modify':
        // Inserção vs modificação: não há conflito direto
        break

      case 'move':
        // Inserção vs movimento: ajustar posições
        if (op1.position !== undefined && op2.position !== undefined) {
          if (op2.position <= op1.position) {
            newOp1.position = op1.position + 1
          }
        }
        break
    }

    return [newOp1, newOp2]
  }

  /**
   * Transforma operações de exclusão
   */
  private static transformDelete(op1: Operation, op2: Operation): [Operation, Operation] {
    if (op1.type !== 'delete') return [op1, op2]

    const newOp1 = { ...op1 }
    const newOp2 = { ...op2 }

    switch (op2.type) {
      case 'insert':
        // Exclusão vs inserção: ajustar posição da exclusão
        if (op1.position !== undefined && op2.position !== undefined) {
          if (op2.position <= op1.position) {
            newOp1.position = op1.position + 1
          }
        }
        break

      case 'delete':
        // Ambas excluindo: uma pode se tornar noop
        if (op1.position !== undefined && op2.position !== undefined) {
          if (op1.position === op2.position) {
            // Excluindo o mesmo elemento - uma operação se torna noop
            return [{ type: 'modify' }, newOp2] // noop
          } else if (op2.position < op1.position) {
            newOp1.position = op1.position - 1
          } else {
            newOp2.position = op2.position - 1
          }
        }
        break

      case 'modify':
        // Exclusão vs modificação: exclusão tem precedência
        if (op1.elementId === op2.elementId) {
          return [newOp1, { type: 'modify' }] // noop para modificação
        }
        break

      case 'move':
        // Exclusão vs movimento: exclusão tem precedência
        if (op1.elementId === op2.elementId) {
          return [newOp1, { type: 'modify' }] // noop para movimento
        }
        break
    }

    return [newOp1, newOp2]
  }

  /**
   * Transforma operações de modificação
   */
  private static transformModify(op1: Operation, op2: Operation): [Operation, Operation] {
    if (op1.type !== 'modify') return [op1, op2]

    const newOp1 = { ...op1 }
    const newOp2 = { ...op2 }

    switch (op2.type) {
      case 'modify':
        // Ambas modificando o mesmo elemento
        if (op1.elementId === op2.elementId) {
          // Merge das modificações ou resolução por timestamp
          newOp1.value = this.mergeProperties(op1.value, op2.value)
          return [newOp1, { type: 'modify' }] // noop para segunda modificação
        }
        break

      case 'delete':
        // Modificação vs exclusão: exclusão tem precedência
        if (op1.elementId === op2.elementId) {
          return [{ type: 'modify' }, newOp2] // noop para modificação
        }
        break

      case 'move':
        // Modificação vs movimento: ambas podem coexistir
        if (op1.elementId === op2.elementId) {
          // Aplicar modificação depois do movimento
          return [newOp1, newOp2]
        }
        break
    }

    return [newOp1, newOp2]
  }

  /**
   * Transforma operações de movimento
   */
  private static transformMove(op1: Operation, op2: Operation): [Operation, Operation] {
    if (op1.type !== 'move') return [op1, op2]

    const newOp1 = { ...op1 }
    const newOp2 = { ...op2 }

    switch (op2.type) {
      case 'move':
        // Ambas movendo: verificar se é o mesmo elemento
        if (op1.elementId === op2.elementId) {
          // Última operação ganha (ou merge baseado em timestamp)
          return [{ type: 'modify' }, newOp2] // noop para primeiro movimento
        }
        break

      case 'delete':
        // Movimento vs exclusão: exclusão tem precedência
        if (op1.elementId === op2.elementId) {
          return [{ type: 'modify' }, newOp2] // noop para movimento
        }
        break
    }

    return [newOp1, newOp2]
  }

  /**
   * Faz merge de propriedades de elementos
   */
  private static mergeProperties(props1: any, props2: any): any {
    if (!props1 || !props2) {
      return props2 || props1
    }

    // Merge simples - propriedades de props2 sobrescrevem props1
    // Em implementação real, poderia ser mais sofisticado
    return { ...props1, ...props2 }
  }

  /**
   * Aplica uma sequência de operações em ordem
   */
  static applyOperations(
    elements: Element[], 
    operations: OperationResult[]
  ): Element[] {
    let result = [...elements]

    // Ordenar operações por timestamp
    const sortedOps = operations.sort((a, b) => a.timestamp - b.timestamp)

    for (const opResult of sortedOps) {
      result = this.applyOperation(result, opResult.operation)
    }

    return result
  }

  /**
   * Aplica uma única operação
   */
  static applyOperation(elements: Element[], operation: Operation): Element[] {
    switch (operation.type) {
      case 'insert':
        return this.applyInsert(elements, operation)
      case 'delete':
        return this.applyDelete(elements, operation)
      case 'modify':
        return this.applyModify(elements, operation)
      case 'move':
        return this.applyMove(elements, operation)
      default:
        return elements
    }
  }

  private static applyInsert(elements: Element[], operation: Operation): Element[] {
    if (!operation.data || operation.position === undefined) {
      return elements
    }

    const newElements = [...elements]
    newElements.splice(operation.position, 0, operation.data)
    return newElements
  }

  private static applyDelete(elements: Element[], operation: Operation): Element[] {
    if (!operation.elementId) return elements

    return elements.filter(element => element.id !== operation.elementId)
  }

  private static applyModify(elements: Element[], operation: Operation): Element[] {
    if (!operation.elementId || !operation.value) return elements

    return elements.map(element => {
      if (element.id === operation.elementId) {
        return { ...element, ...operation.value }
      }
      return element
    })
  }

  private static applyMove(elements: Element[], operation: Operation): Element[] {
    if (!operation.elementId || operation.position === undefined) {
      return elements
    }

    const elementIndex = elements.findIndex(el => el.id === operation.elementId)
    if (elementIndex === -1) return elements

    const newElements = [...elements]
    const [element] = newElements.splice(elementIndex, 1)
    newElements.splice(operation.position, 0, element)

    return newElements
  }

  /**
   * Gera operação inversa para desfazer
   */
  static generateInverse(operation: Operation, currentState: any): Operation {
    switch (operation.type) {
      case 'insert':
        return {
          type: 'delete',
          elementId: operation.elementId,
          position: operation.position
        }

      case 'delete':
        return {
          type: 'insert',
          elementId: operation.elementId,
          position: operation.position,
          data: currentState // elemento que foi deletado
        }

      case 'modify':
        return {
          type: 'modify',
          elementId: operation.elementId,
          value: operation.oldValue || currentState
        }

      case 'move':
        const currentPosition = currentState?.position || 0
        return {
          type: 'move',
          elementId: operation.elementId,
          position: currentPosition
        }

      default:
        return operation
    }
  }
}

/**
 * Classe para gerenciar fila de operações e resolução de conflitos
 */
export class OperationQueue {
  private pendingOperations: OperationResult[] = []
  private appliedOperations: OperationResult[] = []

  /**
   * Adiciona operação à fila
   */
  addOperation(operation: OperationResult): void {
    this.pendingOperations.push(operation)
  }

  /**
   * Processa todas as operações pendentes
   */
  processOperations(): OperationResult[] {
    const toProcess = [...this.pendingOperations]
    this.pendingOperations = []

    // Transformar operações concorrentes
    const transformed = this.transformConcurrentOperations(toProcess)

    // Adicionar às operações aplicadas
    this.appliedOperations.push(...transformed)

    return transformed
  }

  /**
   * Transforma operações concorrentes usando OT
   */
  private transformConcurrentOperations(operations: OperationResult[]): OperationResult[] {
    if (operations.length <= 1) {
      return operations
    }

    // Agrupa operações por timestamp para identificar concorrência
    const groups: OperationResult[][] = []
    let currentGroup: OperationResult[] = []
    let lastTimestamp = 0

    for (const op of operations.sort((a, b) => a.timestamp - b.timestamp)) {
      // Se a diferença de timestamp for pequena, considera concorrente
      if (op.timestamp - lastTimestamp < 100) { // 100ms de tolerância
        currentGroup.push(op)
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup)
        }
        currentGroup = [op]
      }
      lastTimestamp = op.timestamp
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }

    // Transforma operações dentro de cada grupo
    const result: OperationResult[] = []

    for (const group of groups) {
      if (group.length === 1) {
        result.push(group[0])
      } else {
        // Transforma operações concorrentes
        const transformed = this.transformGroup(group)
        result.push(...transformed)
      }
    }

    return result
  }

  /**
   * Transforma um grupo de operações concorrentes
   */
  private transformGroup(operations: OperationResult[]): OperationResult[] {
    if (operations.length <= 1) {
      return operations
    }

    const result: OperationResult[] = []
    
    // Aplica transformação par a par
    for (let i = 0; i < operations.length; i++) {
      let currentOp = operations[i]
      
      for (let j = i + 1; j < operations.length; j++) {
        const [transformed1, transformed2] = OperationalTransform.transform(
          currentOp.operation,
          operations[j].operation
        )
        
        currentOp = { ...currentOp, operation: transformed1 }
        operations[j] = { ...operations[j], operation: transformed2 }
      }
      
      result.push(currentOp)
    }

    return result
  }

  /**
   * Limpa operações antigas para evitar acúmulo de memória
   */
  cleanup(maxAge: number = 300000): void { // 5 minutos por padrão
    const cutoff = Date.now() - maxAge
    this.appliedOperations = this.appliedOperations.filter(
      op => op.timestamp > cutoff
    )
  }

  /**
   * Obtém histórico de operações
   */
  getHistory(): OperationResult[] {
    return [...this.appliedOperations]
  }
}
