import React from 'react'
import { useCollaborationStore } from '../store/collaboration'
import type { CursorPosition } from '../types/collaboration'

interface PresenceIndicatorProps {
  canvasWidth: number
  canvasHeight: number
}

const CursorIcon: React.FC<{ 
  cursor: CursorPosition, 
  userName: string, 
  userColor: string 
}> = ({ cursor, userName, userColor }) => {
  return (
    <div
      className="position-absolute pointer-events-none"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-2px, -2px)',
        zIndex: 1000,
        transition: 'all 0.1s ease-out'
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <path
          d="M2 2L18 8L10 10L8 18L2 2Z"
          fill={userColor}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* Nome do usuário */}
      <div
        className="position-absolute top-100 mt-1 px-2 py-1 rounded text-white text-nowrap"
        style={{
          backgroundColor: userColor,
          fontSize: '12px',
          fontWeight: '500',
          left: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        {userName}
      </div>
    </div>
  )
}

const SelectionIndicator: React.FC<{
  elementIds: string[],
  userColor: string,
  userName: string
}> = ({ elementIds, userColor, userName }) => {
  return (
    <>
      {elementIds.map(elementId => (
        <div
          key={`selection-${elementId}`}
          className="position-absolute pointer-events-none"
          style={{
            border: `2px solid ${userColor}`,
            borderRadius: '4px',
            backgroundColor: `${userColor}20`,
            zIndex: 999,
            // TODO: Calcular posição baseada no elemento
            left: 0,
            top: 0,
            width: 100,
            height: 50,
          }}
        >
          <div
            className="position-absolute px-1 text-white text-nowrap"
            style={{
              backgroundColor: userColor,
              fontSize: '10px',
              top: '-20px',
              left: '-2px',
              borderRadius: '2px'
            }}
          >
            {userName} editing
          </div>
        </div>
      ))}
    </>
  )
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  canvasWidth,
  canvasHeight
}) => {
  const { 
    presence, 
    currentUser, 
    currentSession,
    config 
  } = useCollaborationStore()

  if (!config.enableCursors || !currentSession) {
    return null
  }

  const otherUsers = currentSession.participants.filter(
    user => user.id !== currentUser?.id && user.isOnline
  )

  const getUserColor = (userId: string) => {
    const user = otherUsers.find(u => u.id === userId)
    return user?.color || '#3B82F6'
  }

  const getUserName = (userId: string) => {
    const user = otherUsers.find(u => u.id === userId)
    return user?.name || 'Unknown'
  }

  return (
    <div 
      className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
      style={{ zIndex: 1000 }}
    >
      {/* Cursores dos outros usuários */}
      {Array.from(presence.cursors.entries()).map(([userId, cursor]) => {
        if (userId === currentUser?.id) return null
        
        const isInBounds = 
          cursor.x >= 0 && cursor.x <= canvasWidth &&
          cursor.y >= 0 && cursor.y <= canvasHeight

        if (!isInBounds) return null

        return (
          <CursorIcon
            key={`cursor-${userId}`}
            cursor={cursor}
            userName={getUserName(userId)}
            userColor={getUserColor(userId)}
          />
        )
      })}

      {/* Seleções dos outros usuários */}
      {Array.from(presence.selections.entries()).map(([userId, elementIds]) => {
        if (userId === currentUser?.id || elementIds.length === 0) return null

        return (
          <SelectionIndicator
            key={`selection-${userId}`}
            elementIds={elementIds}
            userColor={getUserColor(userId)}
            userName={getUserName(userId)}
          />
        )
      })}

      {/* Indicador de edição ativa */}
      {Array.from(presence.editing.entries()).map(([userId, elementId]) => {
        if (userId === currentUser?.id) return null

        return (
          <div
            key={`editing-${userId}-${elementId}`}
            className="position-absolute"
            style={{
              // TODO: Calcular posição baseada no elemento
              left: 100,
              top: 100,
              zIndex: 1001
            }}
          >
            <div
              className="d-flex align-items-center px-2 py-1 rounded text-white"
              style={{
                backgroundColor: getUserColor(userId),
                fontSize: '12px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <div
                className="spinner-border spinner-border-sm me-2"
                style={{ width: '12px', height: '12px' }}
              />
              {getUserName(userId)} está editando
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PresenceIndicator
