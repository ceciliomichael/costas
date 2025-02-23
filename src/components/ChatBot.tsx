import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { sendChatMessage } from '../services/chatService';
import '../styles/ChatBot.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm Costa, your virtual assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Update message history with proper typing
      const updatedHistory: ChatMessage[] = [
        ...messageHistory,
        { role: 'user' as const, content: userMessage }
      ];
      setMessageHistory(updatedHistory);

      // Get AI response
      const response = await sendChatMessage(userMessage, messageHistory);
      
      // Add AI response to messages
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
      
      // Update message history with AI response
      setMessageHistory([
        ...updatedHistory,
        { role: 'assistant' as const, content: response }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FaRobot className="chatbot-avatar" />
              <span>Costa AI Assistant</span>
            </div>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.sender === 'bot' ? 'bot' : 'user'}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="message bot typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            {error && (
              <div className="message bot error">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <button
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaRobot />
      </button>
    </div>
  );
};

export default ChatBot;