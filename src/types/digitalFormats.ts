import { z } from 'zod'

// Tipos de dispositivos suportados
export const DeviceTypeSchema = z.enum(['desktop', 'tablet', 'mobile'])

// Orientações suportadas
export const OrientationSchema = z.enum(['portrait', 'landscape'])

// Definições de formatos de página para dispositivos digitais
export const DigitalPageFormatSchema = z.object({
  id: z.string(),
  name: z.string(),
  device: DeviceTypeSchema,
  width: z.number(), // em pixels
  height: z.number(), // em pixels
  orientation: OrientationSchema,
  pixelDensity: z.number().default(1), // Para displays retina/alta resolução
  description: z.string().optional(),
  isCommon: z.boolean().default(false), // Formatos mais usados
  category: z.string().optional(),
})

// Formatos de página pré-definidos para dispositivos digitais
export const DIGITAL_PAGE_FORMATS = [
  // === DESKTOP ===
  {
    id: 'desktop-1920x1080',
    name: 'Full HD (1920×1080)',
    device: 'desktop',
    width: 1920,
    height: 1080,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Resolução Full HD padrão para desktops',
    isCommon: true,
    category: 'Desktop'
  },
  {
    id: 'desktop-1440x900',
    name: 'MacBook Air 13" (1440×900)',
    device: 'desktop',
    width: 1440,
    height: 900,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'MacBook Air 13 polegadas',
    isCommon: true,
    category: 'Desktop'
  },
  {
    id: 'desktop-1366x768',
    name: 'HD (1366×768)',
    device: 'desktop',
    width: 1366,
    height: 768,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Resolução HD comum em laptops',
    isCommon: true,
    category: 'Desktop'
  },
  {
    id: 'desktop-2560x1440',
    name: '2K QHD (2560×1440)',
    device: 'desktop',
    width: 2560,
    height: 1440,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Resolução 2K para monitores de alta definição',
    isCommon: false,
    category: 'Desktop'
  },
  {
    id: 'desktop-3840x2160',
    name: '4K UHD (3840×2160)',
    device: 'desktop',
    width: 3840,
    height: 2160,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Resolução 4K Ultra HD',
    isCommon: false,
    category: 'Desktop'
  },

  // === TABLETS ===
  {
    id: 'tablet-1024x768',
    name: 'iPad (1024×768)',
    device: 'tablet',
    width: 1024,
    height: 768,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'iPad clássico em modo landscape',
    isCommon: true,
    category: 'Tablet'
  },
  {
    id: 'tablet-768x1024',
    name: 'iPad Portrait (768×1024)',
    device: 'tablet',
    width: 768,
    height: 1024,
    orientation: 'portrait',
    pixelDensity: 1,
    description: 'iPad clássico em modo portrait',
    isCommon: true,
    category: 'Tablet'
  },
  {
    id: 'tablet-1280x800',
    name: 'Android Tablet (1280×800)',
    device: 'tablet',
    width: 1280,
    height: 800,
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Tablet Android 10 polegadas',
    isCommon: true,
    category: 'Tablet'
  },
  {
    id: 'tablet-800x1280',
    name: 'Android Tablet Portrait (800×1280)',
    device: 'tablet',
    width: 800,
    height: 1280,
    orientation: 'portrait',
    pixelDensity: 1,
    description: 'Tablet Android em modo portrait',
    isCommon: true,
    category: 'Tablet'
  },

  // === MOBILE ===
  {
    id: 'mobile-375x667',
    name: 'iPhone 8 (375×667)',
    device: 'mobile',
    width: 375,
    height: 667,
    orientation: 'portrait',
    pixelDensity: 2,
    description: 'iPhone 8, 7, 6s, 6',
    isCommon: true,
    category: 'Mobile'
  },
  {
    id: 'mobile-414x896',
    name: 'iPhone 11 (414×896)',
    device: 'mobile',
    width: 414,
    height: 896,
    orientation: 'portrait',
    pixelDensity: 2,
    description: 'iPhone 11, XR',
    isCommon: true,
    category: 'Mobile'
  },
  {
    id: 'mobile-390x844',
    name: 'iPhone 14 (390×844)',
    device: 'mobile',
    width: 390,
    height: 844,
    orientation: 'portrait',
    pixelDensity: 3,
    description: 'iPhone 14, 13, 12',
    isCommon: true,
    category: 'Mobile'
  },
  {
    id: 'mobile-360x640',
    name: 'Android (360×640)',
    device: 'mobile',
    width: 360,
    height: 640,
    orientation: 'portrait',
    pixelDensity: 2,
    description: 'Android padrão médio',
    isCommon: true,
    category: 'Mobile'
  },
  {
    id: 'mobile-412x915',
    name: 'Samsung Galaxy (412×915)',
    device: 'mobile',
    width: 412,
    height: 915,
    orientation: 'portrait',
    pixelDensity: 2.6,
    description: 'Samsung Galaxy S21, S22',
    isCommon: true,
    category: 'Mobile'
  },

  // === MOBILE LANDSCAPE ===
  {
    id: 'mobile-667x375',
    name: 'iPhone 8 Landscape (667×375)',
    device: 'mobile',
    width: 667,
    height: 375,
    orientation: 'landscape',
    pixelDensity: 2,
    description: 'iPhone 8 em modo landscape',
    isCommon: false,
    category: 'Mobile'
  },
  {
    id: 'mobile-896x414',
    name: 'iPhone 11 Landscape (896×414)',
    device: 'mobile',
    width: 896,
    height: 414,
    orientation: 'landscape',
    pixelDensity: 2,
    description: 'iPhone 11 em modo landscape',
    isCommon: false,
    category: 'Mobile'
  },

  // === FORMATOS DE IMPRESSÃO ===
  {
    id: 'print-a4-portrait',
    name: 'A4 Portrait (210×297mm)',
    device: 'desktop',
    width: 794, // 210mm * 3.779527559 (72 DPI)
    height: 1123, // 297mm * 3.779527559
    orientation: 'portrait',
    pixelDensity: 1,
    description: 'Formato A4 para impressão - Portrait',
    isCommon: true,
    category: 'Impressão'
  },
  {
    id: 'print-a4-landscape',
    name: 'A4 Landscape (297×210mm)',
    device: 'desktop',
    width: 1123, // 297mm * 3.779527559
    height: 794, // 210mm * 3.779527559
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Formato A4 para impressão - Landscape',
    isCommon: true,
    category: 'Impressão'
  },
  {
    id: 'print-letter-portrait',
    name: 'Letter Portrait (8.5×11")',
    device: 'desktop',
    width: 612, // 8.5" * 72 DPI
    height: 792, // 11" * 72 DPI
    orientation: 'portrait',
    pixelDensity: 1,
    description: 'Formato Letter para impressão - Portrait',
    isCommon: true,
    category: 'Impressão'
  },
  {
    id: 'print-letter-landscape',
    name: 'Letter Landscape (11×8.5")',
    device: 'desktop',
    width: 792, // 11" * 72 DPI
    height: 612, // 8.5" * 72 DPI
    orientation: 'landscape',
    pixelDensity: 1,
    description: 'Formato Letter para impressão - Landscape',
    isCommon: true,
    category: 'Impressão'
  }
] as const

// Schema para configurações responsivas
export const ResponsiveConfigSchema = z.object({
  breakpoints: z.object({
    mobile: z.number().default(768),
    tablet: z.number().default(1024),
    desktop: z.number().default(1200),
  }),
  activeFormat: DigitalPageFormatSchema,
  previewFormats: z.array(z.string()).default([]), // IDs dos formatos para preview
  autoScale: z.boolean().default(true), // Auto-escalar elementos
  keepAspectRatio: z.boolean().default(true),
})

// Tipos TypeScript
export type DeviceType = z.infer<typeof DeviceTypeSchema>
export type Orientation = z.infer<typeof OrientationSchema>
export type DigitalPageFormat = z.infer<typeof DigitalPageFormatSchema>
export type ResponsiveConfig = z.infer<typeof ResponsiveConfigSchema>

// Utilitários
export const getFormatsByDevice = (device: DeviceType) => {
  return DIGITAL_PAGE_FORMATS.filter(format => format.device === device)
}

export const getCommonFormats = () => {
  return DIGITAL_PAGE_FORMATS.filter(format => format.isCommon)
}

export const getFormatById = (id: string) => {
  return DIGITAL_PAGE_FORMATS.find(format => format.id === id)
}

export const getDeviceIcon = (device: DeviceType): string => {
  switch (device) {
    case 'desktop':
      return 'bi-display'
    case 'tablet':
      return 'bi-tablet'
    case 'mobile':
      return 'bi-phone'
    default:
      return 'bi-display'
  }
}

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Impressão':
      return 'bi-printer'
    case 'Desktop':
      return 'bi-display'
    case 'Tablet':
      return 'bi-tablet'
    case 'Mobile':
      return 'bi-phone'
    default:
      return 'bi-display'
  }
}

export const getOrientationIcon = (orientation: Orientation): string => {
  return orientation === 'portrait' ? 'bi-phone' : 'bi-phone-landscape'
}

// Função para calcular escala apropriada para o canvas
export const calculateCanvasScale = (
  format: DigitalPageFormat, 
  containerWidth: number, 
  containerHeight: number
): number => {
  const scaleX = containerWidth / format.width
  const scaleY = containerHeight / format.height
  return Math.min(scaleX, scaleY, 1) // Não fazer zoom além de 100%
}
