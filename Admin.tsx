
import React, { useState, useEffect, useRef } from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { StorageService } from './services/storage';
import { DBService } from './services/supabase';
import { UserSession, Ticket, Message } from './types';
import { ChatWindow } from './components/ChatWindow';
import { Search, LogOut, Settings, Image as ImageIcon } from 'lucide-react';
import { DEFAULT_LOGO, FALLBACK_LOGO } from './constants';

const { useNavigate } = ReactRouterDOM;

interface AdminProps {
  user: UserSession;
  setUser: (u: UserSession | null) => void;
  logo: string;
  setLogo: (url: string) => void;
}

const Admin: React.FC<AdminProps> = ({ user, setUser, logo, setLogo }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const selectedTicketIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketId;
  }, [selectedTicketId]);

  useEffect(() => {
    const fetchData = async () => {
        const freshTickets = await DBService.getTickets();
        setTickets(freshTickets);
    };
    fetchData();

    const interval = setInterval(async () => {
      const freshTickets = await DBService.getTickets();
      
      const currentId = selectedTicketIdRef.current;
      if (currentId) {
        const ticketIndex = freshTickets.findIndex(t => t.ticketId === currentId);
        if (ticketIndex !== -1) {
          const ticket = freshTickets[ticketIndex];
          const hasUnread = ticket.messages.some(m => m.sender === 'user' && !m.read);
          
          if (hasUnread) {
            await DBService.markMessagesRead(currentId, 'user');
            const updatedMessages = ticket.messages.map(m => 
              m.sender === 'user' ? { ...m, read: true } : m
            );
            freshTickets[ticketIndex] = { 
                ...ticket, 
                messages: updatedMessages,
                lastSeenAdmin: Date.now() 
            };
          }
        }
      }

      setTickets(freshTickets);
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    StorageService.clearAdminSession();
    setUser(null);
    navigate('/login');
  };

  const handleSendMessage = async (text: string, type: 'text' | 'image' | 'file') => {
    if (!selectedTicketId) return;
    const ticket = tickets.find(t => t.ticketId === selectedTicketId);
    if (!ticket) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'admin',
      content: text,
      type,
      timestamp: Date.now(),
      read: false
    };

    const updatedTicket = {
      ...ticket,
      messages: [...ticket.messages, newMessage],
      lastSeenAdmin: Date.now()
    };
    setTickets(prev => prev.map(t => t.ticketId === updatedTicket.ticketId ? updatedTicket : t));

    await DBService.saveMessage(ticket.ticketId, newMessage);
    await DBService.updateTicketSeen(ticket.ticketId, 'admin');
  };

  const handleTicketSelect = async (id: string) => {
    setSelectedTicketId(id);
    
    const ticket = tickets.find(t => t.ticketId === id);
    if (ticket) {
      await DBService.markMessagesRead(id, 'user');
      
      const updatedMessages = ticket.messages.map(m => 
        m.sender === 'user' ? { ...m, read: true } : m
      );
      const updatedTicket = { ...ticket, messages: updatedMessages, lastSeenAdmin: Date.now() };
      setTickets(prev => prev.map(t => t.ticketId === id ? updatedTicket : t));
    }
  };

  const updateLogo = () => {
    if(logoUrlInput) {
        StorageService.setLogo(logoUrlInput);
        setLogo(logoUrlInput);
        setLogoUrlInput('');
        setShowSettings(false);
    }
  };

  const selectedTicket = tickets.find(t => t.ticketId === selectedTicketId);

  const sortedTickets = [...tickets].sort((a, b) => {
    const lastA = a.messages[a.messages.length - 1]?.timestamp || a.createdAt;
    const lastB = b.messages[b.messages.length - 1]?.timestamp || b.createdAt;
    return lastB - lastA;
  });

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
      <div className="w-[350px] md:w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-10">
        <div className="bg-[#f0f2f5] p-3 flex justify-between items-center border-b border-gray-200 h-16 shrink-0">
          <div className="flex items-center gap-2">
             <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
                <img 
                src={logo || DEFAULT_LOGO} 
                className="h-full w-full object-cover" 
                alt="Logo" 
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }}
                />
             </div>
          </div>
          <div className="flex gap-4 text-gray-600">
            <button onClick={() => setShowSettings(!showSettings)} title="Settings" className="hover:text-gray-800 transition-colors">
                <Settings size={20} />
            </button>
            <button onClick={handleLogout} title="Logout" className="hover:text-red-600 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        {showSettings && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <label className="text-xs font-bold text-gray-500 uppercase">Update Site Logo URL</label>
                <div className="flex gap-2 mt-2">
                    <input 
                        className="flex-1 text-sm border border-gray-300 p-2 rounded focus:outline-none focus:border-[#008060]" 
                        placeholder="https://example.com/logo.png" 
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                    />
                    <button 
                        onClick={updateLogo} 
                        className="bg-[#008060] text-white text-xs px-3 rounded font-medium hover:bg-[#004c3f]"
                    >
                        Save
                    </button>
                </div>
            </div>
        )}

        <div className="p-2 border-b border-gray-100 bg-white">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18}/>
                </div>
                <input 
                    type="text" 
                    placeholder="Search or start new chat" 
                    className="w-full bg-[#f0f2f5] pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sortedTickets.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No active tickets found.</div>
          ) : (
            sortedTickets.map(ticket => {
               const lastMsg = ticket.messages[ticket.messages.length - 1];
               const unreadCount = ticket.messages.filter(m => m.sender === 'user' && !m.read).length;
               const isSelected = selectedTicketId === ticket.ticketId;
               
               return (
                 <div 
                   key={ticket.ticketId}
                   onClick={() => handleTicketSelect(ticket.ticketId)}
                   className={`p-3 border-b border-gray-100 cursor-pointer flex gap-3 hover:bg-[#f5f6f6] transition-colors ${isSelected ? 'bg-[#f0f2f5]' : 'bg-white'}`}
                 >
                   <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-lg">
                      {ticket.userEmail.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="flex justify-between items-baseline mb-1">
                            <span className="font-medium text-gray-900 truncate text-[15px]">{ticket.userEmail}</span>
                            <span className={`text-xs ${unreadCount > 0 ? 'text-[#25D366] font-medium' : 'text-gray-400'}`}>
                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                       </div>
                       <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500 truncate pr-2 flex items-center gap-1">
                                {lastMsg?.sender === 'admin' && (
                                    <span className="text-gray-400">✓✓</span>
                                )}
                                {lastMsg ? (
                                    lastMsg.type === 'text' ? lastMsg.content : <span className="flex items-center gap-1"><ImageIcon size={14}/> Photo</span>
                                ) : 'No messages'}
                            </div>
                            {unreadCount > 0 && (
                                <span className="bg-[#25D366] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                                    {unreadCount}
                                </span>
                            )}
                       </div>
                   </div>
                 </div>
               );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full bg-[#efeae2] relative">
        {selectedTicket ? (
            <>
              <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex items-center shadow-sm h-16 shrink-0 z-20">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold mr-3">
                      {selectedTicket.userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <div className="font-semibold text-gray-800 text-sm md:text-base">{selectedTicket.userEmail}</div>
                      <div className="text-xs text-gray-500">Ticket ID: {selectedTicket.ticketId}</div>
                  </div>
              </div>
              
              <ChatWindow 
                ticket={selectedTicket}
                currentUserRole="admin"
                onSendMessage={handleSendMessage}
                className="flex-1"
              />
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-b-[6px] border-[#25D366]">
                <div className="mb-8">
                    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" className="w-32 h-32 opacity-20 grayscale" alt="Welcome"/>
                </div>
                <h2 className="text-3xl font-light text-[#41525d] mb-4">Help Center Admin</h2>
                <p className="text-sm text-gray-500">Send and receive messages without keeping your phone online.</p>
                <p className="text-sm text-gray-500 mt-1">Use Help Center on up to 4 linked devices and 1 phone.</p>
                <div className="mt-12 flex items-center gap-2 text-xs text-gray-400">
                    <Settings size={12}/> End-to-end encrypted
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
