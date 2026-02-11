import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Paperclip, Check, CheckCheck, X, Image as ImageIcon, File as FileIcon, ExternalLink, Maximize2 } from 'lucide-react';
import { Message, Ticket } from '../types';

interface ChatWindowProps {
  ticket: Ticket;
  currentUserRole: 'user' | 'admin';
  onSendMessage: (text: string, type: 'text' | 'image' | 'file') => void;
  onClose?: () => void;
  className?: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  ticket, 
  currentUserRole, 
  onSendMessage, 
  onClose,
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageCount = useRef(ticket.messages.length);

  // Scroll Logic: Only scroll if at bottom or new message is mine
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;

    if (force || isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const newMessageArrived = ticket.messages.length > lastMessageCount.current;
    if (newMessageArrived) {
      const lastMsg = ticket.messages[ticket.messages.length - 1];
      const isMine = lastMsg.sender === currentUserRole;
      scrollToBottom(isMine); // Force scroll if mine, otherwise only if already at bottom
    }
    lastMessageCount.current = ticket.messages.length;
  }, [ticket.messages, currentUserRole, scrollToBottom]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue, 'text');
      setInputValue('');
      setTimeout(() => scrollToBottom(true), 50);
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
      onSendMessage(base64, file.type.startsWith('image/') ? 'image' : 'file');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'image') {
      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-lg" onClick={() => setFullscreenImage(msg.content)}>
          <img src={msg.content} alt="Attachment" className="max-w-full rounded-lg max-h-80 object-cover transition-transform group-hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Maximize2 size={24} className="text-white drop-shadow-md" />
          </div>
        </div>
      );
    }

    if (msg.type === 'file') {
      return (
        <div className="flex items-center gap-3 bg-black/5 p-3 rounded-xl border border-black/5">
          <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600"><FileIcon size={20} /></div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">Document Attachment</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold">Tap to view</p>
          </div>
          <ExternalLink size={14} className="text-gray-400" />
        </div>
      );
    }

    const parts = msg.content.split(URL_REGEX);
    return (
      <div className="space-y-2">
        <p className="text-[15px] text-gray-800 whitespace-pre-wrap leading-relaxed">
          {parts.map((part, i) => part.match(URL_REGEX) ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all" onClick={e => e.stopPropagation()}>{part}</a>
          ) : part)}
        </p>
        {/* Simple Link Preview Simulation */}
        {msg.content.match(URL_REGEX) && (
           <div className="mt-2 border-l-4 border-shopify-green bg-black/5 p-2 rounded-r-lg">
             <p className="text-[10px] font-bold text-shopify-green uppercase">Link Preview</p>
             <p className="text-xs text-gray-600 truncate">{msg.content.match(URL_REGEX)?.[0]}</p>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-whatsapp-bg ${className} relative overflow-hidden h-full`}>
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
      
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 z-10 no-scrollbar md:chat-scroll">
        {ticket.messages.map((msg, idx) => {
          const isMe = msg.sender === currentUserRole;
          const nextMsg = ticket.messages[idx + 1];
          const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`relative px-3 py-2 rounded-2xl shadow-sm max-w-[85%] sm:max-w-[70%] transition-all ${isMe ? 'bg-whatsapp-sent rounded-tr-none' : 'bg-whatsapp-received rounded-tl-none'} ${!isLastInGroup ? 'mb-0.5' : 'mb-2'}`}>
                {renderMessageContent(msg)}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (msg.read ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} className="text-gray-400" />)}
                </div>
                {isLastInGroup && (
                  <div className={`absolute top-0 w-3 h-4 ${isMe ? '-right-2 text-whatsapp-sent' : '-left-2 text-whatsapp-received'}`}>
                    <svg viewBox="0 0 8 13" className="w-full h-full"><path d={isMe ? "M0 0v13l8-13H0z" : "M8 0v13L0 13V0h8z"} fill="currentColor" /></svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="px-3 py-3 bg-[#f0f2f5] border-t border-black/5 z-20 flex items-end gap-2 shrink-0">
        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors shrink-0 mb-0.5">
          <Paperclip size={22} />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx" />
        <div className="flex-1 bg-white rounded-2xl px-4 py-2 shadow-sm min-h-[44px] flex items-center">
          <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyPress} placeholder="Type a message" rows={1} className="flex-1 border-none focus:ring-0 bg-transparent text-gray-800 placeholder-gray-400 resize-none max-h-32 text-[15px] py-1" />
        </div>
        <button onClick={handleSend} disabled={!inputValue.trim()} className="p-3 bg-shopify-green text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 shrink-0 mb-0.5"><Send size={20} /></button>
      </div>

      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in backdrop-blur-md" onClick={() => setFullscreenImage(null)}>
          <div className="flex justify-end p-6"><button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={32} /></button></div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={fullscreenImage} alt="Fullscreen" className="max-w-full max-h-full object-contain animate-scale-in" onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
};
