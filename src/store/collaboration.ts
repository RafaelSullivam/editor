import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { 
  User, 
  Session, 
  CursorPosition, 
  CollaborationEvent, 
  Comment, 
  Version, 
  Conflict,
  PresenceState,
  Operation,
  OperationResult,
  CollaborationConfig
} from '../types/collaboration'

interface CollaborationStore {
  // Estado atual
  currentUser: User | null
  currentSession: Session | null
  config: CollaborationConfig
  
  // Presença em tempo real
  presence: PresenceState
  
  // Comentários
  comments: Comment[]
  
  // Versões
  versions: Version[]
  currentVersion: string | null
  
  // Conflitos
  conflicts: Conflict[]
  
  // Histórico de operações
  operations: OperationResult[]
  
  // Estado de sincronização
  isConnected: boolean
  isSyncing: boolean
  lastSyncTime: number | null
  
  // Actions - Usuários e Sessões
  setCurrentUser: (user: User) => void
  joinSession: (sessionId: string) => Promise<void>
  leaveSession: () => void
  createSession: (layoutId: string) => Promise<Session>
  inviteUser: (email: string, permissions: User['permissions']) => Promise<void>
  updateUserPermissions: (userId: string, permissions: User['permissions']) => void
  
  // Actions - Presença
  updateCursor: (position: { x: number; y: number }) => void
  setElementEditing: (elementId: string | null) => void
  setElementSelection: (elementIds: string[]) => void
  
  // Actions - Comentários
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'author'>) => void
  replyToComment: (commentId: string, content: string) => void
  resolveComment: (commentId: string) => void
  deleteComment: (commentId: string) => void
  mentionUser: (commentId: string, userId: string) => void
  
  // Actions - Versionamento
  createVersion: (name: string, description?: string) => void
  restoreVersion: (versionId: string) => void
  compareVersions: (versionA: string, versionB: string) => any
  autoSave: () => void
  
  // Actions - Operações e Conflitos
  applyOperation: (operation: Operation) => void
  resolveConflict: (conflictId: string, resolution: any) => void
  
  // Actions - Configurações
  updateConfig: (config: Partial<CollaborationConfig>) => void
  
  // Actions - Conexão
  connect: () => void
  disconnect: () => void
  
  // Eventos
  onEvent: (event: CollaborationEvent) => void
}

const defaultConfig: CollaborationConfig = {
  enableRealTimeSync: true,
  enableCursors: true,
  enableComments: true,
  enableVersioning: true,
  autoSaveInterval: 30,
  conflictResolution: 'manual',
  maxHistorySize: 100,
}

export const useCollaborationStore = create<CollaborationStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    currentUser: null,
    currentSession: null,
    config: defaultConfig,
    
    presence: {
      cursors: new Map(),
      selections: new Map(),
      editing: new Map(),
    },
    
    comments: [],
    versions: [],
    currentVersion: null,
    conflicts: [],
    operations: [],
    
    isConnected: false,
    isSyncing: false,
    lastSyncTime: null,
    
    // Implementação das actions
    setCurrentUser: (user) => {
      set({ currentUser: user })
    },
    
    joinSession: async (sessionId) => {
      // Simulação de API call
      const mockSession: Session = {
        id: sessionId,
        layoutId: 'current-layout',
        ownerId: 'owner-id',
        participants: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true,
        settings: {
          allowEditing: true,
          allowComments: true,
          requireApproval: false,
          maxParticipants: 10,
        },
      }
      
      set({ 
        currentSession: mockSession,
        isConnected: true 
      })
    },
    
    leaveSession: () => {
      set({ 
        currentSession: null,
        isConnected: false,
        presence: {
          cursors: new Map(),
          selections: new Map(),
          editing: new Map(),
        }
      })
    },
    
    createSession: async (layoutId) => {
      const session: Session = {
        id: uuidv4(),
        layoutId,
        ownerId: get().currentUser?.id || 'unknown',
        participants: get().currentUser ? [get().currentUser!] : [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true,
        settings: {
          allowEditing: true,
          allowComments: true,
          requireApproval: false,
          maxParticipants: 10,
        },
      }
      
      set({ currentSession: session })
      return session
    },
    
    inviteUser: async (email, permissions) => {
      // Simulação de convite
      console.log(`Convidando ${email} com permissões ${permissions}`)
    },
    
    updateUserPermissions: (userId, permissions) => {
      const session = get().currentSession
      if (!session) return
      
      const updatedParticipants = session.participants.map(user =>
        user.id === userId ? { ...user, permissions } : user
      )
      
      set({
        currentSession: {
          ...session,
          participants: updatedParticipants
        }
      })
    },
    
    updateCursor: (position) => {
      const user = get().currentUser
      if (!user || !get().config.enableCursors) return
      
      const cursorPosition: CursorPosition = {
        userId: user.id,
        x: position.x,
        y: position.y,
        timestamp: Date.now(),
      }
      
      const newCursors = new Map(get().presence.cursors)
      newCursors.set(user.id, cursorPosition)
      
      set({
        presence: {
          ...get().presence,
          cursors: newCursors
        }
      })
    },
    
    setElementEditing: (elementId) => {
      const user = get().currentUser
      if (!user) return
      
      const newEditing = new Map(get().presence.editing)
      if (elementId) {
        newEditing.set(user.id, elementId)
      } else {
        newEditing.delete(user.id)
      }
      
      set({
        presence: {
          ...get().presence,
          editing: newEditing
        }
      })
    },
    
    setElementSelection: (elementIds) => {
      const user = get().currentUser
      if (!user) return
      
      const newSelections = new Map(get().presence.selections)
      if (elementIds.length > 0) {
        newSelections.set(user.id, elementIds)
      } else {
        newSelections.delete(user.id)
      }
      
      set({
        presence: {
          ...get().presence,
          selections: newSelections
        }
      })
    },
    
    addComment: (commentData) => {
      const user = get().currentUser
      if (!user || !get().config.enableComments) return
      
      const comment: Comment = {
        id: uuidv4(),
        ...commentData,
        author: user,
        createdAt: new Date().toISOString(),
        isResolved: false,
        replies: [],
        mentions: [],
      }
      
      set({
        comments: [...get().comments, comment]
      })
    },
    
    replyToComment: (commentId, content) => {
      const user = get().currentUser
      if (!user) return
      
      const reply: Comment = {
        id: uuidv4(),
        content,
        author: user,
        createdAt: new Date().toISOString(),
        isResolved: false,
        replies: [],
        mentions: [],
      }
      
      const updatedComments = get().comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
      
      set({ comments: updatedComments })
    },
    
    resolveComment: (commentId) => {
      const updatedComments = get().comments.map(comment =>
        comment.id === commentId
          ? { ...comment, isResolved: true }
          : comment
      )
      
      set({ comments: updatedComments })
    },
    
    deleteComment: (commentId) => {
      const updatedComments = get().comments.filter(
        comment => comment.id !== commentId
      )
      
      set({ comments: updatedComments })
    },
    
    mentionUser: (commentId, userId) => {
      const updatedComments = get().comments.map(comment =>
        comment.id === commentId
          ? { 
              ...comment, 
              mentions: [...comment.mentions, userId]
            }
          : comment
      )
      
      set({ comments: updatedComments })
    },
    
    createVersion: (name, description) => {
      const user = get().currentUser
      if (!user || !get().config.enableVersioning) return
      
      const version: Version = {
        id: uuidv4(),
        layoutId: get().currentSession?.layoutId || 'unknown',
        name,
        description,
        createdBy: user,
        createdAt: new Date().toISOString(),
        layoutSnapshot: {}, // TODO: Capturar snapshot real do layout
        changes: [],
        isAutoSave: false,
        tags: [],
      }
      
      set({
        versions: [...get().versions, version],
        currentVersion: version.id
      })
    },
    
    restoreVersion: (versionId) => {
      const version = get().versions.find(v => v.id === versionId)
      if (!version) return
      
      // TODO: Aplicar snapshot do layout
      set({ currentVersion: versionId })
    },
    
    compareVersions: (versionA, versionB) => {
      const vA = get().versions.find(v => v.id === versionA)
      const vB = get().versions.find(v => v.id === versionB)
      
      if (!vA || !vB) return null
      
      // TODO: Implementar comparação de versões
      return {
        added: [],
        modified: [],
        deleted: []
      }
    },
    
    autoSave: () => {
      if (!get().config.enableVersioning) return
      
      const user = get().currentUser
      if (!user) return
      
      const autoVersion: Version = {
        id: uuidv4(),
        layoutId: get().currentSession?.layoutId || 'unknown',
        name: `Auto-save ${new Date().toLocaleTimeString()}`,
        createdBy: user,
        createdAt: new Date().toISOString(),
        layoutSnapshot: {}, // TODO: Capturar snapshot real
        changes: [],
        isAutoSave: true,
        tags: ['auto-save'],
      }
      
      set({
        versions: [...get().versions.slice(-get().config.maxHistorySize + 1), autoVersion]
      })
    },
    
    applyOperation: (operation) => {
      if (!get().config.enableRealTimeSync) return
      
      const user = get().currentUser
      if (!user) return
      
      const result: OperationResult = {
        operation,
        inverse: { type: 'modify' }, // TODO: Calcular operação inversa adequada
        timestamp: Date.now(),
        userId: user.id,
      }
      
      set({
        operations: [...get().operations, result],
        isSyncing: true
      })
      
      // Simular aplicação da operação
      setTimeout(() => {
        set({ isSyncing: false, lastSyncTime: Date.now() })
      }, 100)
    },
    
    resolveConflict: (conflictId, resolution) => {
      const updatedConflicts = get().conflicts.map(conflict =>
        conflict.id === conflictId
          ? { 
              ...conflict, 
              resolved: true,
              resolution: {
                ...resolution,
                resolvedBy: get().currentUser?.id || 'unknown',
                resolvedAt: new Date().toISOString(),
              }
            }
          : conflict
      )
      
      set({ conflicts: updatedConflicts })
    },
    
    updateConfig: (newConfig) => {
      set({
        config: { ...get().config, ...newConfig }
      })
    },
    
    connect: () => {
      set({ isConnected: true })
    },
    
    disconnect: () => {
      set({ isConnected: false })
    },
    
    onEvent: (event) => {
      // Processar eventos de colaboração
      switch (event.type) {
        case 'user_joined':
          // Adicionar usuário à sessão
          break
        case 'user_left':
          // Remover usuário da sessão
          break
        case 'cursor_moved':
          // Atualizar posição do cursor
          break
        case 'element_modified':
          // Sincronizar mudança de elemento
          break
        default:
          console.log('Evento não processado:', event.type)
      }
    },
  }))
)

// Auto-save automático
let autoSaveInterval: NodeJS.Timeout | null = null

useCollaborationStore.subscribe(
  (state) => state.config.autoSaveInterval,
  (interval) => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
    }
    
    if (interval > 0) {
      autoSaveInterval = setInterval(() => {
        const store = useCollaborationStore.getState()
        if (store.isConnected && store.config.enableVersioning) {
          store.autoSave()
        }
      }, interval * 1000)
    }
  }
)
