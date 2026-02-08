
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Check, CheckCheck, X, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { Message, Ticket } from '../types';

interface ChatWindowProps {
  ticket: Ticket;
  currentUserRole: 'user' | 'admin';
  onSendMessage: (text: string, type: 'text' | 'image' | 'file') => void;
  onClose?: () => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  ticket, 
  currentUserRole, 
  onSendMessage, 
  onClose,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket.messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, 'text');
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      // In a real app, we'd upload to a server and send the URL. 
      // Here we send base64 data directly for the mock.
      onSendMessage(base64, type); 
    };
    reader.readAsDataURL(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col bg-[#E5DDD5] ${className} relative overflow-hidden`}>
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Header (Only show in Floating Mode, otherwise handled by parent) */}
      {onClose && (
        <div className="bg-[#008060] p-4 text-white flex justify-between items-center shadow-md z-10">
          <div className="flex flex-col">
            <span className="font-bold">Support Chat</span>
            <span className="text-xs opacity-80">Ticket: #{ticket.ticketId}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0 chat-scroll">
        {ticket.messages.map((msg) => {
          const isMe = msg.sender === currentUserRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] rounded-lg p-2 shadow-sm relative ${
                  isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}
              >
                {/* Content Render */}
                {msg.type === 'text' && <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.content}</p>}
                
                {msg.type === 'image' && (
                  <div className="mb-1">
                    <img src={msg.content} alt="Attachment" className="max-w-full rounded-md max-h-48 object-cover" />
                  </div>
                )}
                
                {msg.type === 'file' && (
                   <div className="flex items-center gap-2 bg-gray-100 p-2 rounded mb-1">
                     <FileIcon size={20} className="text-gray-500" />
                     <span className="text-sm truncate max-w-[150px] text-blue-600 underline cursor-pointer">Document</span>
                   </div>
                )}

                {/* Meta: Time & Read Receipt */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck size={14} className="text-blue-500" />
                      ) : (
                        <Check size={14} className="text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white z-10 flex items-center gap-2 shadow-inner">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Paperclip size={20} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
        />
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message"
          style={{ colorScheme: 'light' }}
          className="flex-1 border-none focus:ring-0 bg-white text-gray-800 placeholder-gray-400 px-2 py-2"
        />
        
        <button 
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="p-2 bg-[#008060] text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
