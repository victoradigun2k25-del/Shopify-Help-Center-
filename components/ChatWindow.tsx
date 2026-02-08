import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Check, CheckCheck, X, File as FileIcon } from 'lucide-react';
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
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [ticket.messages]);

  /** Turn plain text into clickable links */
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    const urlRegex = /((https?:\/\/|www\.)[^\s]+)/gi;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        let href = part;
        if (!href.startsWith('http')) href = 'https://' + href;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  /** Send text message */
  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim(), 'text');
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /** Upload files/images */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      onSendMessage(base64, type);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex flex-col bg-[#E5DDD5] relative overflow-hidden ${className}`}>
      {/* Optional Header */}
      {onClose && (
        <div className="bg-[#008060] p-4 text-white flex justify-between items-center shadow-md z-10">
          <div>
            <span className="font-bold block leading-tight">Support Chat</span>
            <span className="text-xs opacity-80">Ticket: #{ticket.ticketId}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-700 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://i.imgur.com/DZx7Mgc.png')] bg-cover">
        {ticket.messages.map((msg) => {
          const isMe = msg.sender === currentUserRole;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`msg-bubble ${
                  isMe ? 'msg-user' : 'msg-admin'
                } shadow-sm relative`}
              >
                {/* Render text with clickable links */}
                {msg.type === 'text' && (
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {renderTextWithLinks(msg.content)}
                  </p>
                )}

                {/* Render image with click-to-view */}
                {msg.type === 'image' && (
                  <img
                    src={msg.content}
                    alt="Attachment"
                    onClick={() => window.open(msg.content, '_blank')}
                    className="rounded-md mt-1 max-w-full h-auto cursor-pointer"
                  />
                )}

                {/* Render file attachment */}
                {msg.type === 'file' && (
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded mt-1 cursor-pointer">
                    <FileIcon size={20} className="text-gray-500" />
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline break-all"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {/* Timestamp & Read Receipts */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] text-gray-500">{formatTime(msg.timestamp)}</span>
                  {isMe && (
                    <span>
                      {msg.read ? (
                        <CheckCheck size={13} className="text-blue-500" />
                      ) : (
                        <Check size={13} className="text-gray-400" />
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

      {/* Input Bar */}
      <div className="chat-input-bar">
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
          className="flex-1 border-none focus:ring-0 bg-white text-gray-800 placeholder-gray-400 px-2 py-2 rounded-md"
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
