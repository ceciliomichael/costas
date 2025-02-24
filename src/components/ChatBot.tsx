import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaTrash } from 'react-icons/fa';
import { sendChatMessage } from '../services/chatService';
import ReactMarkdown from 'react-markdown';
import '../styles/ChatBot.css';
import { useLocation } from 'react-router-dom';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageHistory, setMessageHistory] = useState<ChatMessage[]>(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const chatbotRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messageHistory));
  }, [messageHistory]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    // Handle clicks outside the chatbot
    const handleClickOutside = (event: MouseEvent) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Handle route changes
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Minimize chatbot on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const clearChat = async () => {
    setMessages([]);
    setMessageHistory([]);
    setError(null);
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatHistory');

    // Show typing indicator immediately
    setIsTyping(true);

    // Wait for 3 seconds before sending new greeting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send new greeting after clearing
    const hiddenGreeting = "Hello";

    try {
      // Update message history with proper typing
      const updatedHistory: ChatMessage[] = [
        { role: 'user', content: hiddenGreeting }
      ];
      setMessageHistory(updatedHistory);

      // Get AI response
      const response = await sendChatMessage(hiddenGreeting, []);
      
      // Add AI response to messages
      const botMessage: Message = { 
        text: response, 
        sender: 'bot', 
        timestamp: Date.now() 
      };
      setMessages([botMessage]);
      
      // Update message history with AI response
      setMessageHistory([
        ...updatedHistory,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggle = async () => {
    setIsOpen(prev => !prev);
    if (!isOpen && messageHistory.length === 0) {
      // Only send greeting if there's no chat history
      const hiddenGreeting = "Hello";
      
      // Show typing indicator
      setIsTyping(true);

      try {
        // Update message history with proper typing
        const updatedHistory: ChatMessage[] = [
          ...messageHistory,
          { role: 'user', content: hiddenGreeting }
        ];
        setMessageHistory(updatedHistory);

        // Get AI response
        const response = await sendChatMessage(hiddenGreeting, messageHistory);
        
        // Add AI response to messages
        const botMessage: Message = { 
          text: response, 
          sender: 'bot', 
          timestamp: Date.now() 
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Update message history with AI response
        setMessageHistory([
          ...updatedHistory,
          { role: 'assistant', content: response }
        ]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        setError('Sorry, I encountered an error. Please try again.');
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message
    const newUserMessage: Message = { 
      text: userMessage, 
      sender: 'user', 
      timestamp: Date.now() 
    };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Update message history with proper typing
      const updatedHistory: ChatMessage[] = [
        ...messageHistory,
        { role: 'user', content: userMessage }
      ];
      setMessageHistory(updatedHistory);

      // Get AI response
      const response = await sendChatMessage(userMessage, messageHistory);
      
      // Add AI response to messages
      const botMessage: Message = { 
        text: response, 
        sender: 'bot', 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Update message history with AI response
      setMessageHistory([
        ...updatedHistory,
        { role: 'assistant', content: response }
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(timestamp))
  };

  // Check if the current page is the main page
  const isMainPage = location.pathname === '/'; // Adjust this based on your main page route

  return (
    <>
      {isMainPage && (
        <div ref={chatbotRef} className={`chatbot-container ${isOpen ? 'open' : ''}`}>
          {isOpen && (
            <div className="chatbot-window">
              <div className="chatbot-header">
                <div className="chatbot-title">
                  <FaRobot className="chatbot-avatar" />
                  <span>Costa AI</span>
                </div>
                <div className="header-actions">
                  <button className="clear-button" onClick={clearChat} title="Clear chat">
                    <FaTrash />
                  </button>
                  <button className="close-button" onClick={() => setIsOpen(false)}>
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.sender === 'bot' ? 'bot' : 'user'}`}
                  >
                    <div className="message-content">
                      {msg.sender === 'bot' ? (
                        <div className="markdown-content">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                    <div className="message-time">{formatTime(msg.timestamp)}</div>
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
            onClick={handleToggle}
          >
            <FaRobot />
          </button>
        </div>
      )}
    </>
  );
};

export default ChatBot;