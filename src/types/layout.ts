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
})

// Elemento de texto
export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: z.string(),
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

// Coluna de tabela
export const TableColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  field: z.string(),
  width: z.union([z.number(), z.literal('auto')]).default('auto'),
  textAlign: TextAlignSchema.default('left'),
  fontSize: z.number().default(12),
  fontWeight: z.enum(['normal', 'bold']).default('normal'),
  color: z.string().default('#000000'),
})

// Elemento tabela
export const TableElementSchema = BaseElementSchema.extend({
  type: z.literal('table'),
  columns: z.array(TableColumnSchema),
  headerStyle: z.object({
    backgroundColor: z.string().default('#f5f5f5'),
    fontSize: z.number().default(12),
    fontWeight: z.enum(['normal', 'bold']).default('bold'),
    color: z.string().default('#000000'),
    height: z.number().default(30),
  }).optional(),
  rowStyle: z.object({
    backgroundColor: z.string().default('transparent'),
    alternateBackgroundColor: z.string().default('#f9f9f9'),
    fontSize: z.number().default(12),
    color: z.string().default('#000000'),
    height: z.number().default(25),
  }).optional(),
  showHeader: z.boolean().default(true),
  showBorders: z.boolean().default(true),
  borderColor: z.string().default('#cccccc'),
  borderWidth: z.number().default(1),
  pageBreak: z.boolean().default(true),
  repeatHeader: z.boolean().default(true),
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
  metadata: z.record(z.string(), z.any()).default({}),
})

// Tipos TypeScript derivados
export type Position = z.infer<typeof PositionSchema>
export type Dimension = z.infer<typeof DimensionSchema>
export type Bounds = z.infer<typeof BoundsSchema>
export type Transform = z.infer<typeof TransformSchema>
export type BorderStyle = z.infer<typeof BorderStyleSchema>
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
