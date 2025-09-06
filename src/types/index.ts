export * from './layout'

// Tipos auxiliares para o editor
export interface Point {
  x: number
  y: number
}

export interface SelectionRect {
  x: number
  y: number
  width: number
  height: number
}

export interface HistoryState {
  id: string
  description: string
  timestamp: number
  data: any
}

export interface EditorState {
  selectedElementIds: string[]
  currentPageId: string
  zoom: number
  panOffset: Point
  isGridVisible: boolean
  isRulersVisible: boolean
  snapToGrid: boolean
  snapToElements: boolean
  tool: 'select' | 'text' | 'image' | 'rectangle' | 'line' | 'table' | 'qrcode' | 'barcode' | 'field'
}

export interface DragState {
  isDragging: boolean
  dragStart: Point
  dragOffset: Point
  dragElementId?: string
}

export interface ResizeState {
  isResizing: boolean
  resizeHandle: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null
  resizeElementId?: string
  aspectRatio?: number
}

export interface GuideLines {
  vertical: number[]
  horizontal: number[]
}

// Constantes
export const PAGE_FORMATS = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A5: { width: 148, height: 210 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Tabloid: { width: 279.4, height: 431.8 },
} as const

export const UNITS = {
  mm: { name: 'Milímetros', abbr: 'mm', scale: 1 },
  px: { name: 'Pixels', abbr: 'px', scale: 3.779528 }, // 1mm = 3.779528px at 96 DPI
  pt: { name: 'Points', abbr: 'pt', scale: 2.834646 }, // 1mm = 2.834646pt
  in: { name: 'Inches', abbr: 'in', scale: 0.039370 }, // 1mm = 0.039370in
} as const

export const DEFAULT_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
  'Trebuchet MS',
  'Comic Sans MS',
  'Impact',
] as const
