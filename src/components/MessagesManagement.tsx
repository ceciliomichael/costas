import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaSpinner } from 'react-icons/fa';
import '../styles/MessagesManagement.css';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const MessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://costasbackend.ultrawavelet.me/api/contact/messages');
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch(`https://costasbackend.ultrawavelet.me/api/contact/messages/${id}/read`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
      
      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === id ? { ...msg, isRead: true } : msg
        )
      );
      
      // Update selected message if it's the one being marked as read
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      setError('Failed to mark message as read. Please try again later.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch(`https://costasbackend.ultrawavelet.me/api/contact/messages/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      // Remove from local state
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== id));
      
      // Clear selected message if it's the one being deleted
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      
      // Clear delete confirmation
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message. Please try again later.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="messages-loading">
        <FaSpinner className="spinner" />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-management">
      <h2>Contact Messages</h2>
      
      {error && <div className="messages-error">{error}</div>}
      
      <div className="messages-container">
        <div className="messages-list">
          <h3>
            Messages ({messages.length})
            <button 
              className="refresh-button" 
              onClick={fetchMessages}
              title="Refresh messages"
            >
              {loading ? <FaSpinner className="spinner" /> : '↻'}
            </button>
          </h3>
          
          {messages.length === 0 ? (
            <div className="no-messages">No messages found</div>
          ) : (
            <ul>
              {messages.map(message => (
                <li 
                  key={message._id} 
                  className={`message-item ${message.isRead ? 'read' : 'unread'} ${selectedMessage?._id === message._id ? 'selected' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="message-icon">
                    {message.isRead ? <FaEnvelopeOpen /> : <FaEnvelope />}
                  </div>
                  <div className="message-preview">
                    <div className="message-header">
                      <span className="message-sender">{message.name}</span>
                      <span className="message-date">{formatDate(message.createdAt)}</span>
                    </div>
                    <div className="message-subject">{message.subject}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="message-detail-header">
                <h3>{selectedMessage.subject}</h3>
                <div className="message-actions">
                  {!selectedMessage.isRead && (
                    <button 
                      className="action-button read-button"
                      onClick={() => handleMarkAsRead(selectedMessage._id)}
                      title="Mark as read"
                    >
                      <FaEnvelopeOpen />
                    </button>
                  )}
                  
                  {deleteConfirm === selectedMessage._id ? (
                    <div className="delete-confirm">
                      <span>Confirm delete?</span>
                      <button 
                        className="confirm-yes"
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                      >
                        Yes
                      </button>
                      <button 
                        className="confirm-no"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="action-button delete-button"
                      onClick={() => setDeleteConfirm(selectedMessage._id)}
                      title="Delete message"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="message-detail-info">
                <div className="message-sender-info">
                  <strong>From:</strong> {selectedMessage.name} ({selectedMessage.email})
                </div>
                <div className="message-date-info">
                  <strong>Date:</strong> {formatDate(selectedMessage.createdAt)}
                </div>
              </div>
              
              <div className="message-content">
                {selectedMessage.message}
              </div>
            </>
          ) : (
            <div className="no-message-selected">
              <FaEnvelope className="big-icon" />
              <p>Select a message to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesManagement; 