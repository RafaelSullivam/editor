// Collaboration System - Exports
// Phase 5: Sistema de Colaboração em Tempo Real

// Types
export type {
  User,
  Session,
  Comment,
  Version,
  Operation,
  PresenceState,
  CursorPosition,
  OperationResult,
  CollaborationConfig
} from '../../types/collaboration';

// Store
export { useCollaborationStore } from '../../store/collaboration';

// Components
export { default as CollaborationPanel } from '../CollaborationPanel';
export { default as PresenceIndicator } from '../PresenceIndicator';
export { default as CommentSystem } from '../CommentSystem';
export { default as VersionHistoryPanel } from '../VersionHistoryPanel';
export { 
  CollaborationToolbar, 
  CollaborationProvider 
} from '../CollaborationIntegration';

// Utils
export { OperationalTransform, OperationQueue } from '../../utils/operationalTransform';

// Styles (import these in your main CSS file)
// import '../../styles/collaboration-toolbar.css';
// import '../../styles/comment-system.css';
// import '../../styles/version-history.css';
