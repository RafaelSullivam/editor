import React, { useState } from 'react';
import { useCollaborationStore } from '../store/collaboration';
import type { Version } from '../types/collaboration';

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ isOpen, onClose }) => {
  const {
    versions,
    currentUser,
    createVersion,
    restoreVersion,
    compareVersions,
    config
  } = useCollaborationStore();
  
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list');
  
  if (!isOpen) return null;
  
  const handleCreateVersion = () => {
    if (!newVersionName.trim() || !currentUser) return;
    
    createVersion(newVersionName.trim(), newVersionDescription.trim());
    setNewVersionName('');
    setNewVersionDescription('');
    setIsCreatingVersion(false);
  };
  
  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    } else {
      setSelectedVersions([selectedVersions[1], versionId]);
    }
  };
  
  const handleCompareVersions = () => {
    if (selectedVersions.length === 2) {
      compareVersions(selectedVersions[0], selectedVersions[1]);
      setViewMode('comparison');
    }
  };
  
  const canDeleteVersion = (version: Version) => {
    return currentUser?.permissions === 'owner' || 
           version.createdBy.id === currentUser?.id;
  };
  
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="version-history-panel">
      <div className="version-history-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Histórico de Versões
          </h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <div className="version-actions mt-3">
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('list')}
            >
              <i className="bi bi-list"></i> Lista
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'comparison' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('comparison')}
              disabled={selectedVersions.length !== 2}
            >
              <i className="bi bi-arrows-angle-contract"></i> Comparar
            </button>
          </div>
          
          {config.enableVersioning && (
            <button
              className="btn btn-sm btn-success ms-2"
              onClick={() => setIsCreatingVersion(true)}
            >
              <i className="bi bi-plus"></i> Nova Versão
            </button>
          )}
        </div>
      </div>
      
      <div className="version-history-content">
        {viewMode === 'list' && (
          <>
            {isCreatingVersion && (
              <div className="new-version-form">
                <div className="form-group mb-3">
                  <label className="form-label">Nome da Versão</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="Ex: Layout Homepage v2.1"
                    maxLength={50}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Descrição (opcional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    placeholder="Descreva as mudanças desta versão..."
                    maxLength={200}
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleCreateVersion}
                    disabled={!newVersionName.trim()}
                  >
                    Criar Versão
                  </button>
                  <button
                    className="btn btn-sm btn-secondary ms-2"
                    onClick={() => {
                      setIsCreatingVersion(false);
                      setNewVersionName('');
                      setNewVersionDescription('');
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
            
            {selectedVersions.length === 2 && (
              <div className="comparison-prompt">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Duas versões selecionadas. 
                  <button
                    className="btn btn-sm btn-primary ms-2"
                    onClick={handleCompareVersions}
                  >
                    Comparar Agora
                  </button>
                </div>
              </div>
            )}
            
            <div className="versions-list">
              {sortedVersions.length === 0 ? (
                <div className="no-versions">
                  <i className="bi bi-clock-history text-muted"></i>
                  <p className="text-muted mb-0 mt-2">Nenhuma versão salva ainda</p>
                </div>
              ) : (
                sortedVersions.map((version) => (
                  <div
                    key={version.id}
                    className={`version-item ${selectedVersions.includes(version.id) ? 'selected' : ''}`}
                  >
                    <div className="version-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => handleVersionSelect(version.id)}
                        disabled={selectedVersions.length >= 2 && !selectedVersions.includes(version.id)}
                      />
                    </div>
                    
                    <div className="version-info">
                      <div className="version-header">
                        <h6 className="version-name">{version.name}</h6>
                        <div className="version-meta">
                          {version.isAutoSave && (
                            <span className="badge badge-secondary me-1">Auto</span>
                          )}
                          {version.tags.map(tag => (
                            <span key={tag} className="badge badge-info me-1">{tag}</span>
                          ))}
                        </div>
                      </div>
                      
                      {version.description && (
                        <p className="version-description">{version.description}</p>
                      )}
                      
                      <div className="version-details">
                        <div className="version-author">
                          <img
                            src={version.createdBy.avatar || `https://ui-avatars.com/api/?name=${version.createdBy.name}&background=random`}
                            alt={version.createdBy.name}
                            className="author-avatar"
                          />
                          <span>{version.createdBy.name}</span>
                        </div>
                        
                        <div className="version-date">
                          {new Date(version.createdAt).toLocaleString('pt-BR')}
                        </div>
                        
                        <div className="version-changes">
                          {version.changes.length} alterações
                        </div>
                      </div>
                    </div>
                    
                    <div className="version-actions">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => restoreVersion(version.id)}
                        title="Restaurar esta versão"
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                      
                      {canDeleteVersion(version) && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            // TODO: Implementar deleteVersion na store
                            console.log('Excluir versão:', version.id);
                          }}
                          title="Excluir versão"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
        {viewMode === 'comparison' && selectedVersions.length === 2 && (
          <VersionComparison
            version1Id={selectedVersions[0]}
            version2Id={selectedVersions[1]}
            onBack={() => setViewMode('list')}
          />
        )}
      </div>
    </div>
  );
};

interface VersionComparisonProps {
  version1Id: string;
  version2Id: string;
  onBack: () => void;
}

const VersionComparison: React.FC<VersionComparisonProps> = ({
  version1Id,
  version2Id,
  onBack
}) => {
  const { versions } = useCollaborationStore();
  
  const version1 = versions.find(v => v.id === version1Id);
  const version2 = versions.find(v => v.id === version2Id);
  
  if (!version1 || !version2) {
    return (
      <div className="comparison-error">
        <p>Erro ao carregar versões para comparação</p>
        <button className="btn btn-secondary" onClick={onBack}>
          Voltar
        </button>
      </div>
    );
  }
  
  // TODO: Implementar comparação visual real entre layouts
  const mockDifferences = [
    {
      type: 'added',
      element: 'Button "Comprar Agora"',
      description: 'Novo botão adicionado no header'
    },
    {
      type: 'modified',
      element: 'Container principal',
      description: 'Largura alterada de 1200px para 1400px'
    },
    {
      type: 'removed',
      element: 'Imagem de fundo',
      description: 'Imagem removida da seção hero'
    }
  ];
  
  return (
    <div className="version-comparison">
      <div className="comparison-header">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={onBack}
        >
          <i className="bi bi-arrow-left"></i> Voltar
        </button>
        <h6 className="mb-0">Comparação de Versões</h6>
      </div>
      
      <div className="comparison-info">
        <div className="version-info-card">
          <h6>{version1.name}</h6>
          <p className="text-muted">
            {version1.createdBy.name} • {new Date(version1.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
        
        <div className="comparison-arrow">
          <i className="bi bi-arrow-right"></i>
        </div>
        
        <div className="version-info-card">
          <h6>{version2.name}</h6>
          <p className="text-muted">
            {version2.createdBy.name} • {new Date(version2.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      
      <div className="differences-list">
        <h6>Diferenças Encontradas ({mockDifferences.length})</h6>
        
        {mockDifferences.map((diff, index) => (
          <div key={index} className={`difference-item ${diff.type}`}>
            <div className="difference-icon">
              {diff.type === 'added' && <i className="bi bi-plus-circle text-success"></i>}
              {diff.type === 'modified' && <i className="bi bi-pencil-circle text-warning"></i>}
              {diff.type === 'removed' && <i className="bi bi-dash-circle text-danger"></i>}
            </div>
            
            <div className="difference-content">
              <strong>{diff.element}</strong>
              <p className="mb-0 text-muted">{diff.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="comparison-actions">
        <button className="btn btn-primary">
          <i className="bi bi-eye"></i> Visualizar Lado a Lado
        </button>
        <button className="btn btn-outline-primary">
          <i className="bi bi-download"></i> Exportar Comparação
        </button>
      </div>
    </div>
  );
};

export default VersionHistoryPanel;
