import React, { useState } from 'react'
import { useCollaborationStore } from '../store/collaboration'
import type { User } from '../types/collaboration'

interface CollaborationPanelProps {
  isOpen: boolean
  onClose: () => void
}

const UserAvatar: React.FC<{ 
  user: User, 
  size?: 'sm' | 'md' | 'lg' 
}> = ({ user, size = 'md' }) => {
  const sizeConfig = {
    sm: { width: '24px', height: '24px', fontSize: '10px' },
    md: { width: '32px', height: '32px', fontSize: '12px' },
    lg: { width: '48px', height: '48px', fontSize: '16px' }
  }

  const sizeStyle = sizeConfig[size]

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <div className="position-relative">
      <div
        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
        style={{
          backgroundColor: user.color,
          width: sizeStyle.width,
          height: sizeStyle.height,
          fontSize: sizeStyle.fontSize
        }}
        title={user.name}
      >
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-100 h-100 rounded-circle object-fit-cover"
          />
        ) : (
          initials
        )}
      </div>
      
      {/* Status online */}
      <div
        className="position-absolute rounded-circle border-2 border-white"
        style={{
          width: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
          height: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
          backgroundColor: user.isOnline ? '#10B981' : '#6B7280',
          bottom: '0',
          right: '0'
        }}
      />
    </div>
  )
}

const PermissionBadge: React.FC<{ permission: User['permissions'] }> = ({ 
  permission 
}) => {
  const badgeConfig = {
    owner: { color: 'danger', text: 'Proprietário', icon: 'crown' },
    editor: { color: 'primary', text: 'Editor', icon: 'pencil' },
    viewer: { color: 'secondary', text: 'Visualizador', icon: 'eye' }
  }

  const config = badgeConfig[permission]

  return (
    <span className={`badge bg-${config.color} d-flex align-items-center gap-1`}>
      <i className={`bi bi-${config.icon}`} style={{ fontSize: '10px' }} />
      {config.text}
    </span>
  )
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose
}) => {
  const {
    currentUser,
    currentSession,
    presence,
    config,
    inviteUser,
    updateUserPermissions,
    leaveSession
  } = useCollaborationStore()

  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePermission, setInvitePermission] = useState<User['permissions']>('viewer')
  const [showInviteForm, setShowInviteForm] = useState(false)

  if (!isOpen) return null

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    
    try {
      await inviteUser(inviteEmail, invitePermission)
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (error) {
      console.error('Erro ao convidar usuário:', error)
    }
  }

  const isOwner = currentUser?.permissions === 'owner'
  const onlineUsers = currentSession?.participants.filter(u => u.isOnline) || []
  const offlineUsers = currentSession?.participants.filter(u => !u.isOnline) || []

  return (
    <div className="position-fixed top-0 end-0 h-100 bg-white shadow-lg border-start" 
         style={{ width: '320px', zIndex: 1050 }}>
      
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
        <h6 className="mb-0 fw-bold">
          <i className="bi bi-people me-2" />
          Colaboração
        </h6>
        <button 
          className="btn btn-sm btn-outline-secondary"
          onClick={onClose}
        >
          <i className="bi bi-x" />
        </button>
      </div>

      <div className="flex-grow-1 overflow-auto p-3">
        
        {/* Status da sessão */}
        {currentSession && (
          <div className="mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div 
                className="rounded-circle"
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: config.enableRealTimeSync ? '#10B981' : '#6B7280'
                }}
              />
              <small className="text-muted">
                {config.enableRealTimeSync ? 'Sincronização ativa' : 'Modo offline'}
              </small>
            </div>
            <small className="text-muted">
              {onlineUsers.length} usuário(s) online
            </small>
          </div>
        )}

        {/* Usuários online */}
        {onlineUsers.length > 0 && (
          <div className="mb-4">
            <h6 className="text-success mb-2">
              <i className="bi bi-circle-fill me-1" style={{ fontSize: '8px' }} />
              Online ({onlineUsers.length})
            </h6>
            <div className="list-group list-group-flush">
              {onlineUsers.map(user => (
                <div key={user.id} className="list-group-item px-0 py-2">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <UserAvatar user={user} />
                      <div>
                        <div className="fw-medium">
                          {user.name}
                          {user.id === currentUser?.id && (
                            <small className="text-muted ms-1">(você)</small>
                          )}
                        </div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end gap-1">
                      <PermissionBadge permission={user.permissions} />
                      {presence.editing.has(user.id) && (
                        <small className="text-warning">
                          <i className="bi bi-pencil me-1" />
                          Editando
                        </small>
                      )}
                    </div>
                  </div>
                  
                  {/* Opções para owner */}
                  {isOwner && user.id !== currentUser?.id && (
                    <div className="mt-2">
                      <select
                        className="form-select form-select-sm"
                        value={user.permissions}
                        onChange={(e) => updateUserPermissions(
                          user.id, 
                          e.target.value as User['permissions']
                        )}
                      >
                        <option value="viewer">Visualizador</option>
                        <option value="editor">Editor</option>
                        <option value="owner">Proprietário</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usuários offline */}
        {offlineUsers.length > 0 && (
          <div className="mb-4">
            <h6 className="text-muted mb-2">
              <i className="bi bi-circle me-1" style={{ fontSize: '8px' }} />
              Offline ({offlineUsers.length})
            </h6>
            <div className="list-group list-group-flush">
              {offlineUsers.map(user => (
                <div key={user.id} className="list-group-item px-0 py-2 opacity-75">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <UserAvatar user={user} />
                      <div>
                        <div className="fw-medium">{user.name}</div>
                        <small className="text-muted">
                          Visto por último: {user.lastSeen ? 
                            new Date(user.lastSeen).toLocaleString() : 
                            'Nunca'
                          }
                        </small>
                      </div>
                    </div>
                    <PermissionBadge permission={user.permissions} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convidar usuários */}
        {isOwner && (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="mb-0">Convidar usuários</h6>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowInviteForm(!showInviteForm)}
              >
                <i className="bi bi-plus" />
              </button>
            </div>

            {showInviteForm && (
              <div className="border rounded p-3">
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Permissão</label>
                  <select
                    className="form-select form-select-sm"
                    value={invitePermission}
                    onChange={(e) => setInvitePermission(e.target.value as User['permissions'])}
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Proprietário</option>
                  </select>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-primary flex-grow-1"
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim()}
                  >
                    Enviar convite
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setShowInviteForm(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configurações */}
        <div className="mb-4">
          <h6 className="mb-2">Configurações</h6>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={config.enableCursors}
              onChange={(e) => useCollaborationStore.getState().updateConfig({
                enableCursors: e.target.checked
              })}
              id="enableCursors"
            />
            <label className="form-check-label" htmlFor="enableCursors">
              Mostrar cursores
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={config.enableComments}
              onChange={(e) => useCollaborationStore.getState().updateConfig({
                enableComments: e.target.checked
              })}
              id="enableComments"
            />
            <label className="form-check-label" htmlFor="enableComments">
              Permitir comentários
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={config.enableVersioning}
              onChange={(e) => useCollaborationStore.getState().updateConfig({
                enableVersioning: e.target.checked
              })}
              id="enableVersioning"
            />
            <label className="form-check-label" htmlFor="enableVersioning">
              Versionamento automático
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-top">
        <button
          className="btn btn-outline-danger w-100"
          onClick={leaveSession}
        >
          <i className="bi bi-box-arrow-left me-2" />
          Sair da sessão
        </button>
      </div>
    </div>
  )
}

export default CollaborationPanel
