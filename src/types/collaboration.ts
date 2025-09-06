import { z } from 'zod'

// Esquemas para colaboração em tempo real
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().optional(),
  color: z.string().default('#3B82F6'), // Cor do cursor
  isOnline: z.boolean().default(false),
  lastSeen: z.string().optional(),
  permissions: z.enum(['owner', 'editor', 'viewer']).default('viewer'),
  joinedAt: z.string(),
})

export const CursorPositionSchema = z.object({
  userId: z.string(),
  x: z.number(),
  y: z.number(),
  timestamp: z.number(),
  elementId: z.string().optional(), // Elemento sendo editado
})

export const CollaborationEventSchema = z.object({
  id: z.string(),
  type: z.enum([
    'user_joined',
    'user_left', 
    'cursor_moved',
    'element_selected',
    'element_modified',
    'element_created',
    'element_deleted',
    'comment_added',
    'comment_resolved'
  ]),
  userId: z.string(),
  timestamp: z.number(),
  data: z.any(), // Dados específicos do evento
  sessionId: z.string(),
})

export const CommentSchema: z.ZodType<any> = z.object({
  id: z.string(),
  elementId: z.string().optional(), // Comentário em elemento específico
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(), // Comentário em posição livre
  content: z.string(),
  author: UserSchema,
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  isResolved: z.boolean().default(false),
  replies: z.array(z.lazy(() => CommentSchema)).default([]),
  mentions: z.array(z.string()).default([]), // IDs de usuários mencionados
})

export const SessionSchema = z.object({
  id: z.string(),
  layoutId: z.string(),
  ownerId: z.string(),
  participants: z.array(UserSchema).default([]),
  createdAt: z.string(),
  lastActivity: z.string(),
  isActive: z.boolean().default(true),
  settings: z.object({
    allowEditing: z.boolean().default(true),
    allowComments: z.boolean().default(true),
    requireApproval: z.boolean().default(false),
    maxParticipants: z.number().default(10),
  }).default({
    allowEditing: true,
    allowComments: true,
    requireApproval: false,
    maxParticipants: 10,
  })
})

export const VersionSchema = z.object({
  id: z.string(),
  layoutId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: UserSchema,
  createdAt: z.string(),
  layoutSnapshot: z.any(), // Snapshot completo do layout
  changes: z.array(z.object({
    type: z.enum(['added', 'modified', 'deleted']),
    elementId: z.string(),
    before: z.any().optional(),
    after: z.any().optional(),
  })).default([]),
  isAutoSave: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
})

export const ConflictSchema = z.object({
  id: z.string(),
  elementId: z.string(),
  conflictingUsers: z.array(UserSchema),
  changes: z.array(z.object({
    userId: z.string(),
    timestamp: z.number(),
    operation: z.any(),
  })),
  resolved: z.boolean().default(false),
  resolution: z.object({
    selectedChange: z.string().optional(),
    mergedChange: z.any().optional(),
    resolvedBy: z.string(),
    resolvedAt: z.string(),
  }).optional(),
})

// Tipos TypeScript derivados
export type User = z.infer<typeof UserSchema>
export type CursorPosition = z.infer<typeof CursorPositionSchema>
export type CollaborationEvent = z.infer<typeof CollaborationEventSchema>
export type Comment = z.infer<typeof CommentSchema>
export type Session = z.infer<typeof SessionSchema>
export type Version = z.infer<typeof VersionSchema>
export type Conflict = z.infer<typeof ConflictSchema>

// Operações para transformação operacional
export interface Operation {
  type: 'insert' | 'delete' | 'modify' | 'move'
  elementId?: string
  position?: number
  data?: any
  path?: string[]
  value?: any
  oldValue?: any
}

export interface OperationResult {
  operation: Operation
  inverse: Operation
  timestamp: number
  userId: string
}

// Estados de presença
export type PresenceState = {
  cursors: Map<string, CursorPosition>
  selections: Map<string, string[]> // userId -> elementIds
  editing: Map<string, string> // userId -> elementId
}

// Configurações de colaboração
export interface CollaborationConfig {
  enableRealTimeSync: boolean
  enableCursors: boolean
  enableComments: boolean
  enableVersioning: boolean
  autoSaveInterval: number // em segundos
  conflictResolution: 'auto' | 'manual' | 'last-write-wins'
  maxHistorySize: number
}
