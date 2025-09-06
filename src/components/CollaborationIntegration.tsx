import React, { useState, useEffect } from 'react';
import { useCollaborationStore } from '../store/collaboration';
import CollaborationPanel from './CollaborationPanel';
import PresenceIndicator from './PresenceIndicator';
import CommentSystem from './CommentSystem';
import VersionHistoryPanel from './VersionHistoryPanel';

interface CollaborationToolbarProps {
  className?: string;
}

export const CollaborationToolbar: React.FC<CollaborationToolbarProps> = ({ className = '' }) => {
  const {
    currentSession,
    config
  } = useCollaborationStore();
  
  const [isCollaborationOpen, setIsCollaborationOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const handleToggleCollaboration = () => {
    // TODO: Implementar conectar/desconectar sessão
    console.log('Toggle collaboration');
  };
  
  useEffect(() => {
    if (currentSession) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [currentSession]);
  
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <i className="bi bi-wifi text-success"></i>;
      case 'connecting':
        return <i className="bi bi-arrow-repeat spin text-warning"></i>;
      default:
        return <i className="bi bi-wifi-off text-danger"></i>;
    }
  };
  
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Online';
      case 'connecting':
        return 'Conectando...';
      default:
        return 'Offline';
    }
  };
  
  return (
    <>
      <div className={`collaboration-toolbar ${className}`}>
        {/* Connection Status */}
        <div className="connection-status">
          {getConnectionStatusIcon()}
          <span className="connection-text">{getConnectionStatusText()}</span>
        </div>
        
        {/* Collaboration Toggle */}
        <button
          className={`btn btn-sm ${currentSession ? 'btn-success' : 'btn-outline-primary'}`}
          onClick={handleToggleCollaboration}
          title={currentSession ? 'Desconectar da colaboração' : 'Iniciar colaboração'}
        >
          <i className={`bi ${currentSession ? 'bi-people-fill' : 'bi-people'}`}></i>
          {currentSession ? 'Colaborando' : 'Colaborar'}
        </button>
        
        {/* Collaboration Panel Toggle */}
        {currentSession && (
          <button
            className={`btn btn-sm ${isCollaborationOpen ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setIsCollaborationOpen(!isCollaborationOpen)}
            title="Painel de colaboração"
          >
            <i className="bi bi-person-lines-fill"></i>
            Usuários
          </button>
        )}
        
        {/* Comments Toggle */}
        {currentSession && config.enableComments && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              // TODO: Implementar toggle de comentários
              console.log('Toggle comments');
            }}
            title={config.enableComments ? 'Ocultar comentários' : 'Mostrar comentários'}
          >
            <i className={`bi ${config.enableComments ? 'bi-chat-dots-fill' : 'bi-chat-dots'}`}></i>
            Comentários
          </button>
        )}
        
        {/* Version History */}
        {config.enableVersioning && (
          <button
            className={`btn btn-sm ${isVersionHistoryOpen ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setIsVersionHistoryOpen(!isVersionHistoryOpen)}
            title="Histórico de versões"
          >
            <i className="bi bi-clock-history"></i>
            Versões
          </button>
        )}
        
        {/* Settings Dropdown */}
        {currentSession && (
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              title="Configurações de colaboração"
            >
              <i className="bi bi-gear"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <label className="dropdown-item">
                  <input
                    type="checkbox"
                    checked={config.enableCursors}
                    onChange={() => {
                      // TODO: Implementar setConfig
                      console.log('Toggle cursors');
                    }}
                    className="me-2"
                  />
                  Mostrar cursores
                </label>
              </li>
              <li>
                <label className="dropdown-item">
                  <input
                    type="checkbox"
                    checked={config.enableComments}
                    onChange={() => {
                      // TODO: Implementar setConfig
                      console.log('Toggle comments setting');
                    }}
                    className="me-2"
                  />
                  Permitir comentários
                </label>
              </li>
              <li>
                <label className="dropdown-item">
                  <input
                    type="checkbox"
                    checked={config.enableVersioning}
                    onChange={() => {
                      // TODO: Implementar setConfig
                      console.log('Toggle versioning');
                    }}
                    className="me-2"
                  />
                  Versionamento
                </label>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <span className="dropdown-item-text">
                  <small>Auto-save: {config.autoSaveInterval}s</small>
                </span>
              </li>
              <li>
                <div className="dropdown-item">
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={config.autoSaveInterval}
                    onChange={() => {
                      // TODO: Implementar setConfig
                      console.log('Change auto-save interval');
                    }}
                    className="form-range"
                  />
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
      
      {/* Collaboration Panel */}
      {isCollaborationOpen && currentSession && (
        <CollaborationPanel
          isOpen={isCollaborationOpen}
          onClose={() => setIsCollaborationOpen(false)}
        />
      )}
      
      {/* Version History Panel */}
      {isVersionHistoryOpen && (
        <VersionHistoryPanel
          isOpen={isVersionHistoryOpen}
          onClose={() => setIsVersionHistoryOpen(false)}
        />
      )}
    </>
  );
};

interface CollaborationProviderProps {
  children: React.ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const { currentSession, config, updateCursor } = useCollaborationStore();
  const [elementBounds] = useState<Array<{ id: string; bounds: DOMRect }>>([
    {
      id: 'demo-element-1',
      bounds: new DOMRect(100, 100, 200, 150)
    },
    {
      id: 'demo-element-2', 
      bounds: new DOMRect(350, 100, 200, 150)
    }
  ]);
  
  // Atualizar cursor quando mouse se move
  useEffect(() => {
    if (!currentSession || !config.enableCursors) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      updateCursor({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [currentSession, config.enableCursors, updateCursor]);
  
  return (
    <div className="collaboration-provider">
      {children}
      
      {/* Presence Indicators */}
      {currentSession && config.enableCursors && (
        <PresenceIndicator 
          canvasWidth={800}
          canvasHeight={600}
        />
      )}
      
      {/* Comment System */}
      {currentSession && config.enableComments && (
        <CommentSystem elements={elementBounds} />
      )}
    </div>
  );
};

export default CollaborationToolbar;
