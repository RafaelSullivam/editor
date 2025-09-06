import { z } from 'zod'

// Unidades de medida
export const UnitSchema = z.enum(['mm', 'px', 'pt', 'in'])
export type Unit = z.infer<typeof UnitSchema>

// Posição e dimensões
export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const DimensionSchema = z.object({
  width: z.number(),
  height: z.number(),
})

export const BoundsSchema = PositionSchema.merge(DimensionSchema)

// Transformações
export const TransformSchema = z.object({
  rotation: z.number().default(0),
  scaleX: z.number().default(1),
  scaleY: z.number().default(1),
  opacity: z.number().min(0).max(1).default(1),
})

// Estilo de borda
export const BorderStyleSchema = z.object({
  width: z.number().default(0),
  color: z.string().default('#000000'),
  style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  radius: z.number().default(0),
})

// Gradientes
export const GradientStopSchema = z.object({
  color: z.string(),
  position: z.number().min(0).max(100), // Posição em porcentagem
})

export const LinearGradientSchema = z.object({
  type: z.literal('linear'),
  angle: z.number().default(0), // Ângulo em graus
  stops: z.array(GradientStopSchema).min(2),
})

export const RadialGradientSchema = z.object({
  type: z.literal('radial'),
  centerX: z.number().default(50), // Posição X do centro em %
  centerY: z.number().default(50), // Posição Y do centro em %
  radius: z.number().default(50), // Raio em %
  stops: z.array(GradientStopSchema).min(2),
})

export const GradientSchema = z.union([LinearGradientSchema, RadialGradientSchema])

// Sombras
export const ShadowSchema = z.object({
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  blur: z.number().default(0),
  spread: z.number().default(0),
  color: z.string().default('rgba(0,0,0,0.5)'),
  inset: z.boolean().default(false),
})

// Bordas avançadas
export const AdvancedBorderSchema = z.object({
  width: z.number().default(0),
  color: z.string().default('#000000'),
  style: z.enum(['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset']).default('solid'),
  radius: z.object({
    topLeft: z.number().default(0),
    topRight: z.number().default(0),
    bottomLeft: z.number().default(0),
    bottomRight: z.number().default(0),
  }).default({ topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }),
  gradient: GradientSchema.optional(),
})

// Estilos avançados aplicáveis a elementos
export const AdvancedStyleSchema = z.object({
  gradient: GradientSchema.optional(),
  shadows: z.array(ShadowSchema).optional(),
  border: AdvancedBorderSchema.optional(),
  filters: z.object({
    blur: z.number().default(0),
    brightness: z.number().default(100),
    contrast: z.number().default(100),
    saturate: z.number().default(100),
    hueRotate: z.number().default(0),
  }).optional(),
})

// Guides e Snap
export const GuideSchema = z.object({
  id: z.string(),
  type: z.enum(['horizontal', 'vertical']),
  position: z.number(), // Posição em pixels
  color: z.string().default('#007bff'),
  visible: z.boolean().default(true),
})

export const SnapSettingsSchema = z.object({
  snapToGrid: z.boolean().default(false),
  snapToElements: z.boolean().default(true),
  snapToGuides: z.boolean().default(true),
  snapThreshold: z.number().default(5), // pixels
  showSnapLines: z.boolean().default(true),
})

// Sistema de Variáveis Dinâmicas
export const VariableSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['text', 'number', 'date', 'boolean', 'image', 'color']),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  description: z.string().optional(),
  format: z.string().optional(), // Para formatação de datas, números, etc.
  validation: z.object({
    required: z.boolean().default(false),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
})

export const DataSourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['json', 'csv', 'api', 'manual']),
  url: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  data: z.array(z.record(z.string(), z.any())).optional(),
  variables: z.array(VariableSchema).default([]),
  lastUpdated: z.string().optional(),
})

export const DataBindingSchema = z.object({
  sourceId: z.string(),
  variableName: z.string(),
  property: z.string().optional(), // Propriedade CSS para vincular
  transform: z.string().optional(), // Transformação JS opcional
})

// Alinhamentos
export const TextAlignSchema = z.enum(['left', 'center', 'right', 'justify'])
export const VerticalAlignSchema = z.enum(['top', 'middle', 'bottom'])

// Tipos de elementos
export const ElementTypeSchema = z.enum([
  'text',
  'image', 
  'rectangle',
  'line',
  'table',
  'qrcode',
  'barcode',
  'field'
])

// Schema base para todos os elementos
export const BaseElementSchema = z.object({
  id: z.string(),
  type: ElementTypeSchema,
  name: z.string(),
  bounds: BoundsSchema,
  transform: TransformSchema.optional(),
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  zIndex: z.number().default(0),
  advancedStyle: AdvancedStyleSchema.optional(),
})

// Elemento de texto
export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: z.string(),
  dataBinding: DataBindingSchema.optional(), // Vinculação de dados
  isDynamic: z.boolean().default(false), // Se o conteúdo é dinâmico
  fontSize: z.number().default(12),
  fontFamily: z.string().default('Arial'),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  fontStyle: z.enum(['normal', 'italic']).default('normal'),
  color: z.string().default('#000000'),
  textAlign: TextAlignSchema.default('left'),
  verticalAlign: VerticalAlignSchema.default('top'),
  lineHeight: z.number().default(1.2),
  letterSpacing: z.number().default(0),
  textDecoration: z.enum(['none', 'underline', 'line-through']).default('none'),
  wordWrap: z.boolean().default(true),
})

// Elemento de imagem
export const ImageFitSchema = z.enum(['fill', 'contain', 'cover', 'none'])

export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string().default(''),
  fit: ImageFitSchema.default('contain'),
  keepAspectRatio: z.boolean().default(true),
})

// Elemento retângulo
export const RectangleElementSchema = BaseElementSchema.extend({
  type: z.literal('rectangle'),
  fill: z.string().default('transparent'),
  stroke: z.string().default('#000000'),
  strokeWidth: z.number().default(1),
  border: BorderStyleSchema.optional(),
})

// Elemento linha
export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal('line'),
  startPoint: PositionSchema,
  endPoint: PositionSchema,
  stroke: z.string().default('#000000'),
  strokeWidth: z.number().default(1),
  strokeStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
})

// Esquemas relacionados a tabelas
export const TableCellSchema = z.object({
  content: z.string().default(''),
  dataBinding: DataBindingSchema.optional(),
  style: z.object({
    backgroundColor: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    fontStyle: z.enum(['normal', 'italic']).optional(),
    textAlign: TextAlignSchema.optional(),
    verticalAlign: VerticalAlignSchema.optional(),
    padding: z.number().default(4),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional()
  }).optional(),
  type: z.enum(['text', 'number', 'date', 'currency', 'percentage']).default('text'),
  editable: z.boolean().default(true),
  formula: z.string().optional(), // Ex: "=SUM(A1:A5)"
  validation: z.object({
    required: z.boolean().default(false),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    pattern: z.string().optional(),
    customMessage: z.string().optional()
  }).optional(),
  rowSpan: z.number().default(1),
  colSpan: z.number().default(1)
})

export const TableRowSchema = z.object({
  id: z.string(),
  cells: z.array(TableCellSchema),
  height: z.number().default(25),
  style: z.object({
    backgroundColor: z.string().optional(),
    borderColor: z.string().optional(),
    borderWidth: z.number().optional()
  }).optional(),
  isHeader: z.boolean().default(false),
  isFooter: z.boolean().default(false),
  visible: z.boolean().default(true)
})

export const TableColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
  width: z.number().default(100),
  resizable: z.boolean().default(true),
  sortable: z.boolean().default(false),
  dataField: z.string().optional(), // Campo para binding de dados
  headerText: z.string().optional(),
  headerStyle: z.object({
    backgroundColor: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.enum(['normal', 'bold']).optional(),
    textAlign: TextAlignSchema.optional()
  }).optional(),
  cellStyle: z.object({
    backgroundColor: z.string().optional(),
    color: z.string().optional(),
    fontSize: z.number().optional(),
    textAlign: TextAlignSchema.optional()
  }).optional(),
  visible: z.boolean().default(true),
  frozen: z.boolean().default(false) // Coluna congelada
})

// Elemento tabela
export const TableElementSchema = BaseElementSchema.extend({
  type: z.literal('table'),
  rows: z.array(TableRowSchema).default([]),
  columns: z.array(TableColumnSchema).default([]),
  dataBinding: z.object({
    sourceId: z.string().optional(),
    autoPopulate: z.boolean().default(false),
    startRow: z.number().default(1), // Linha onde começar a popular dados
    maxRows: z.number().optional() // Limite de linhas
  }).optional(),
  
  // Estilos globais
  globalStyle: z.object({
    fontFamily: z.string().default('Arial'),
    fontSize: z.number().default(12),
    color: z.string().default('#000000'),
    borderColor: z.string().default('#cccccc'),
    borderWidth: z.number().default(1),
    borderStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid')
  }).default({
    fontFamily: 'Arial',
    fontSize: 12,
    color: '#000000',
    borderColor: '#cccccc',
    borderWidth: 1,
    borderStyle: 'solid'
  }),
  
  // Configurações de exibição
  display: z.object({
    showHeaders: z.boolean().default(true),
    showBorders: z.boolean().default(true),
    showGridLines: z.boolean().default(true),
    alternateRowColors: z.boolean().default(false),
    zebra: z.object({
      evenColor: z.string().default('#f9f9f9'),
      oddColor: z.string().default('#ffffff')
    }).optional()
  }).default({
    showHeaders: true,
    showBorders: true,
    showGridLines: true,
    alternateRowColors: false
  }),
  
  // Configurações de página
  pagination: z.object({
    enabled: z.boolean().default(false),
    pageBreaks: z.boolean().default(true),
    repeatHeaders: z.boolean().default(true),
    maxRowsPerPage: z.number().optional()
  }).default({
    enabled: false,
    pageBreaks: true,
    repeatHeaders: true
  }),
  
  // Recursos avançados
  features: z.object({
    sorting: z.boolean().default(false),
    filtering: z.boolean().default(false),
    grouping: z.boolean().default(false),
    totals: z.boolean().default(false),
    selection: z.boolean().default(false)
  }).default({
    sorting: false,
    filtering: false,
    grouping: false,
    totals: false,
    selection: false
  }),

  // Configurações de layout
  layout: z.object({
    fixedLayout: z.boolean().default(false),
    autoWidth: z.boolean().default(false),
    minWidth: z.number().optional(),
    maxWidth: z.number().optional()
  }).default({
    fixedLayout: false,
    autoWidth: false
  })
})

// Elemento QR Code
export const QRCodeElementSchema = BaseElementSchema.extend({
  type: z.literal('qrcode'),
  content: z.string(),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
  version: z.number().min(1).max(40).optional(),
  margin: z.number().default(4),
  color: z.string().default('#000000'),
  backgroundColor: z.string().default('#ffffff'),
})

// Elemento código de barras
export const BarcodeElementSchema = BaseElementSchema.extend({
  type: z.literal('barcode'),
  content: z.string(),
  format: z.enum(['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC']).default('CODE128'),
  displayValue: z.boolean().default(true),
  fontSize: z.number().default(12),
  color: z.string().default('#000000'),
  backgroundColor: z.string().default('#ffffff'),
})

// Campo dinâmico
export const FieldElementSchema = BaseElementSchema.extend({
  type: z.literal('field'),
  fieldPath: z.string(), // Ex: "cliente.nome", "invoice.total"
  defaultValue: z.string().default(''),
  format: z.string().optional(), // Ex: "currency", "date", "number"
  fontSize: z.number().default(12),
  fontFamily: z.string().default('Arial'),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  fontStyle: z.enum(['normal', 'italic']).default('normal'),
  color: z.string().default('#000000'),
  textAlign: TextAlignSchema.default('left'),
})

// União de todos os tipos de elementos
export const ElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  ImageElementSchema,
  RectangleElementSchema,
  LineElementSchema,
  TableElementSchema,
  QRCodeElementSchema,
  BarcodeElementSchema,
  FieldElementSchema,
])

// Configuração de página
export const PageConfigSchema = z.object({
  width: z.number(),
  height: z.number(),
  unit: UnitSchema.default('mm'),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  margins: z.object({
    top: z.number().default(20),
    right: z.number().default(20),
    bottom: z.number().default(20),
    left: z.number().default(20),
  }).optional(),
  dpi: z.number().default(300),
})

// Página do layout
export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  config: PageConfigSchema,
  elements: z.array(ElementSchema).default([]),
  guides: z.array(GuideSchema).default([]),
  snapSettings: SnapSettingsSchema.default({
    snapToGrid: false,
    snapToElements: true,
    snapToGuides: true,
    snapThreshold: 5,
    showSnapLines: true
  }),
  backgroundPdf: z.object({
    url: z.string(),
    pageNumber: z.number().default(1),
  }).optional(),
})

// Configurações globais do editor
export const EditorConfigSchema = z.object({
  snapToGrid: z.boolean().default(true),
  snapToElements: z.boolean().default(true),
  gridSize: z.number().default(5),
  showGrid: z.boolean().default(true),
  showRulers: z.boolean().default(true),
  snapThreshold: z.number().default(5),
  defaultUnit: UnitSchema.default('mm'),
  zoom: z.number().default(1),
})

// Schema completo do layout
export const LayoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string().default('1.0.0'),
  createdAt: z.string(),
  updatedAt: z.string(),
  config: EditorConfigSchema.optional(),
  pages: z.array(PageSchema).min(1),
  dataSources: z.array(DataSourceSchema).default([]), // Fontes de dados
  metadata: z.record(z.string(), z.any()).default({}),
})

// Tipos TypeScript derivados
export type Position = z.infer<typeof PositionSchema>
export type Dimension = z.infer<typeof DimensionSchema>
export type Bounds = z.infer<typeof BoundsSchema>
export type Transform = z.infer<typeof TransformSchema>
export type BorderStyle = z.infer<typeof BorderStyleSchema>
export type GradientStop = z.infer<typeof GradientStopSchema>
export type LinearGradient = z.infer<typeof LinearGradientSchema>
export type RadialGradient = z.infer<typeof RadialGradientSchema>
export type Gradient = z.infer<typeof GradientSchema>
export type Shadow = z.infer<typeof ShadowSchema>
export type AdvancedBorder = z.infer<typeof AdvancedBorderSchema>
export type AdvancedStyle = z.infer<typeof AdvancedStyleSchema>
export type Guide = z.infer<typeof GuideSchema>
export type SnapSettings = z.infer<typeof SnapSettingsSchema>
export type Variable = z.infer<typeof VariableSchema>
export type DataSource = z.infer<typeof DataSourceSchema>
export type DataBinding = z.infer<typeof DataBindingSchema>
export type TextAlign = z.infer<typeof TextAlignSchema>
export type VerticalAlign = z.infer<typeof VerticalAlignSchema>
export type ElementType = z.infer<typeof ElementTypeSchema>
export type BaseElement = z.infer<typeof BaseElementSchema>
export type TextElement = z.infer<typeof TextElementSchema>
export type ImageElement = z.infer<typeof ImageElementSchema>
export type RectangleElement = z.infer<typeof RectangleElementSchema>
export type LineElement = z.infer<typeof LineElementSchema>
export type TableColumn = z.infer<typeof TableColumnSchema>
export type TableElement = z.infer<typeof TableElementSchema>
export type QRCodeElement = z.infer<typeof QRCodeElementSchema>
export type BarcodeElement = z.infer<typeof BarcodeElementSchema>
export type FieldElement = z.infer<typeof FieldElementSchema>
export type Element = z.infer<typeof ElementSchema>
export type PageConfig = z.infer<typeof PageConfigSchema>
export type Page = z.infer<typeof PageSchema>
export type EditorConfig = z.infer<typeof EditorConfigSchema>
export type Layout = z.infer<typeof LayoutSchema>

// Tipos específicos para tabelas
export type TableCell = z.infer<typeof TableCellSchema>
export type TableRow = z.infer<typeof TableRowSchema>
export type TableColumn = z.infer<typeof TableColumnSchema>

// Tipos para dados dinâmicos
export interface DataContext {
  [key: string]: any
}

// Configurações de exportação
export interface ExportOptions {
  format: 'pdf' | 'html' | 'json'
  includeBackground: boolean
  quality: 'low' | 'medium' | 'high'
  scale: number
}

// Resultado de exportação
export interface ExportResult {
  success: boolean
  data?: Blob | string
  error?: string
  metadata?: {
    pageCount: number
    fileSize: number
    format: string
  }
}
