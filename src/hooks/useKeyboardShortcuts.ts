import { useEffect } from 'react'
import { useEditorStore } from '../store/editor'

export const useKeyboardShortcuts = () => {
  const { 
    alignElements, 
    distributeElements, 
    alignToPage,
    getSelectedElements
  } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Só ativar atalhos se Ctrl estiver pressionado e não estivermos em um input
      if (!event.ctrlKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const selectedElements = getSelectedElements()
      const hasSelection = selectedElements.length > 0
      const canAlign = selectedElements.length >= 2
      const canDistribute = selectedElements.length >= 3

      switch (event.key.toLowerCase()) {
        // Alinhamento horizontal entre elementos
        case 'l':
          if (canAlign) {
            event.preventDefault()
            alignElements('left')
          }
          break
        case 'e':
          if (canAlign) {
            event.preventDefault()
            alignElements('center')
          }
          break
        case 'r':
          if (canAlign) {
            event.preventDefault()
            alignElements('right')
          }
          break

        // Alinhamento vertical entre elementos
        case 't':
          if (canAlign) {
            event.preventDefault()
            alignElements('top')
          }
          break
        case 'm':
          if (canAlign) {
            event.preventDefault()
            alignElements('middle')
          }
          break
        case 'b':
          if (canAlign) {
            event.preventDefault()
            alignElements('bottom')
          }
          break

        // Distribuição
        case 'h':
          if (canDistribute) {
            event.preventDefault()
            distributeElements('horizontal')
          }
          break
        case 'v':
          if (canDistribute) {
            event.preventDefault()
            distributeElements('vertical')
          }
          break

        // Alinhamento à página (Shift + Ctrl + tecla)
        case 'L':
          if (event.shiftKey && hasSelection) {
            event.preventDefault()
            alignToPage('left')
          }
          break
        case 'E':
          if (event.shiftKey && hasSelection) {
            event.preventDefault()
            alignToPage('center')
          }
          break
        case 'R':
          if (event.shiftKey && hasSelection) {
            event.preventDefault()
            alignToPage('right')
          }
          break
        case 'T':
          if (event.shiftKey && hasSelection) {
            event.preventDefault()
            alignToPage('top')
          }
          break
        case 'M':
          if (event.shiftKey && hasSelection) {
            event.preventDefault()
            alignToPage('middle')
          }
          break
        case 'B':
          if (event.shiftKey && hasSelection) {
            event.preventDefault()
            alignToPage('bottom')
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [alignElements, distributeElements, alignToPage, getSelectedElements])
}
