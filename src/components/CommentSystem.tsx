import React, { useState, useRef, useEffect } from 'react';
import { useCollaborationStore } from '../store/collaboration';
import type { Comment } from '../types/collaboration';

interface CommentBubbleProps {
  elementId: string;
  position: { x: number; y: number };
  onClick: () => void;
  hasUnread?: boolean;
}

const CommentBubble: React.FC<CommentBubbleProps> = ({
  elementId,
  position,
  onClick,
  hasUnread = false
}) => {
  const comments = useCollaborationStore(state => 
    state.comments.filter(c => c.elementId === elementId)
  );
  
  const commentCount = comments.length;
  
  return (
    <div
      className={`comment-bubble ${hasUnread ? 'has-unread' : ''}`}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000
      }}
      onClick={onClick}
    >
      <div className="comment-bubble-icon">
        <i className="bi bi-chat-dots-fill"></i>
        {commentCount > 0 && (
          <span className="comment-count">{commentCount}</span>
        )}
      </div>
    </div>
  );
};

interface CommentThreadProps {
  elementId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  elementId,
  position,
  onClose
}) => {
  const {
    comments,
    currentUser,
    addComment,
    replyToComment,
    deleteComment
  } = useCollaborationStore();
  
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const elementComments = comments.filter(c => c.elementId === elementId);
  
  // Marcar comentários como lidos quando abrir o thread
  useEffect(() => {
    // TODO: Implementar markCommentAsRead na store
    // elementComments.forEach(comment => {
    //   if (!comment.readBy.includes(currentUser?.id || '')) {
    //     markCommentAsRead(comment.id, currentUser?.id || '');
    //   }
    // });
  }, [elementComments, currentUser]);
  
  const handleAddComment = () => {
    if (!newComment.trim() || !currentUser) return;
    
    addComment({
      elementId,
      content: newComment.trim(),
      author: currentUser
    });
    
    setNewComment('');
  };
  
  const handleReply = (commentId: string) => {
    if (!replyText.trim() || !currentUser) return;
    
    replyToComment(commentId, replyText.trim());
    
    setReplyText('');
    setReplyingTo(null);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      action();
    }
  };
  
  const renderComment = (comment: Comment, level = 0) => {
    const isOwner = comment.author.id === currentUser?.id;
    const canDelete = isOwner || currentUser?.permissions === 'owner';
    
    return (
      <div key={comment.id} className={`comment-item level-${level}`}>
        <div className="comment-header">
          <div className="comment-author">
            <img
              src={comment.author.avatar || `https://ui-avatars.com/api/?name=${comment.author.name}&background=random`}
              alt={comment.author.name}
              className="comment-avatar"
            />
            <span className="comment-name">{comment.author.name}</span>
            <span className="comment-role badge badge-secondary">
              {comment.author.permissions}
            </span>
          </div>
          <div className="comment-meta">
            <span className="comment-time">
              {new Date(comment.createdAt).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {canDelete && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => deleteComment(comment.id)}
                title="Excluir comentário"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        </div>
        
        <div className="comment-content">
          {comment.content}
        </div>
        
        <div className="comment-actions">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setReplyingTo(comment.id)}
          >
            <i className="bi bi-reply"></i> Responder
          </button>
        </div>
        
        {replyingTo === comment.id && (
          <div className="reply-form">
            <textarea
              ref={inputRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escreva sua resposta..."
              className="form-control"
              rows={2}
              onKeyPress={(e) => handleKeyPress(e, () => handleReply(comment.id))}
            />
            <div className="reply-actions">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleReply(comment.id)}
                disabled={!replyText.trim()}
              >
                Responder
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply: Comment) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div
      className="comment-thread"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1001
      }}
    >
      <div className="comment-thread-header">
        <h6 className="mb-0">
          <i className="bi bi-chat-dots me-2"></i>
          Comentários
        </h6>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={onClose}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
      
      <div className="comment-thread-content">
        {elementComments.length === 0 ? (
          <div className="no-comments">
            <i className="bi bi-chat-dots text-muted"></i>
            <p className="text-muted mb-0">Nenhum comentário ainda</p>
          </div>
        ) : (
          <div className="comments-list">
            {elementComments.map(comment => renderComment(comment))}
          </div>
        )}
        
        <div className="new-comment-form">
          <div className="form-group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              className="form-control"
              rows={3}
              onKeyPress={(e) => handleKeyPress(e, handleAddComment)}
            />
          </div>
          <div className="form-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <i className="bi bi-send me-1"></i>
              Comentar
            </button>
            <small className="text-muted">
              Ctrl+Enter para enviar rapidamente
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentSystemProps {
  elements: Array<{ id: string; bounds: DOMRect }>;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({ elements }) => {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [threadPosition, setThreadPosition] = useState({ x: 0, y: 0 });
  const { comments, currentUser } = useCollaborationStore();
  
  if (!currentUser) return null;
  
  const handleBubbleClick = (elementId: string, bubblePosition: { x: number; y: number }) => {
    if (activeThread === elementId) {
      setActiveThread(null);
      return;
    }
    
    setActiveThread(elementId);
    
    // Posicionar thread próximo ao bubble, mas dentro da tela
    const threadWidth = 400;
    const threadHeight = 500;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let x = bubblePosition.x + 20;
    let y = bubblePosition.y;
    
    // Ajustar se sair da tela
    if (x + threadWidth > screenWidth) {
      x = bubblePosition.x - threadWidth - 20;
    }
    
    if (y + threadHeight > screenHeight) {
      y = screenHeight - threadHeight - 20;
    }
    
    if (y < 0) y = 20;
    if (x < 0) x = 20;
    
    setThreadPosition({ x, y });
  };
  
  const elementsWithComments = elements.filter(element => 
    comments.some(comment => comment.elementId === element.id)
  );
  
  return (
    <>
      {/* Comment Bubbles */}
      {elementsWithComments.map(element => {
        const elementComments = comments.filter(c => c.elementId === element.id);
        const hasUnread = elementComments.some(comment =>
          !comment.readBy.includes(currentUser.id)
        );
        
        const bubblePosition = {
          x: element.bounds.right - 10,
          y: element.bounds.top - 10
        };
        
        return (
          <CommentBubble
            key={element.id}
            elementId={element.id}
            position={bubblePosition}
            hasUnread={hasUnread}
            onClick={() => handleBubbleClick(element.id, bubblePosition)}
          />
        );
      })}
      
      {/* Active Comment Thread */}
      {activeThread && (
        <>
          <div
            className="comment-overlay"
            onClick={() => setActiveThread(null)}
          />
          <CommentThread
            elementId={activeThread}
            position={threadPosition}
            onClose={() => setActiveThread(null)}
          />
        </>
      )}
    </>
  );
};

export default CommentSystem;
