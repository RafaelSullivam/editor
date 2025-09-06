// Conversões de unidades
export const convertUnits = (value: number, fromUnit: string, toUnit: string, dpi = 300): number => {
  if (fromUnit === toUnit) return value
  
  // Converter tudo para mm primeiro
  let valueInMm: number
  switch (fromUnit) {
    case 'px':
      valueInMm = value * 25.4 / dpi
      break
    case 'pt':
      valueInMm = value * 0.352778
      break
    case 'in':
      valueInMm = value * 25.4
      break
    case 'mm':
    default:
      valueInMm = value
      break
  }
  
  // Converter de mm para unidade de destino
  switch (toUnit) {
    case 'px':
      return valueInMm * dpi / 25.4
    case 'pt':
      return valueInMm / 0.352778
    case 'in':
      return valueInMm / 25.4
    case 'mm':
    default:
      return valueInMm
  }
}

// Snap helpers
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize
}

export const snapToValue = (value: number, targets: number[], threshold = 5): number => {
  if (!targets || targets.length === 0) {
    return value
  }
  
  const closest = targets.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  )
  return Math.abs(closest - value) <= threshold ? closest : value
}

// Bounds helpers
export const isPointInBounds = (
  point: { x: number; y: number },
  bounds: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  )
}

export const boundsOverlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean => {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}

// DOM helpers
export const getElementBounds = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

// Color helpers
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// File helpers
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Format helpers
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Math helpers
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor
}

export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

export const radToDeg = (radians: number): number => {
  return radians * (180 / Math.PI)
}

// Validation helpers
export const isValidColor = (color: string): boolean => {
  const s = new Option().style
  s.color = color
  return s.color !== ''
}

export const isValidNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value))
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Debounce helper
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
