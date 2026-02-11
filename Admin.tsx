
import React, { useState, useEffect, useRef } from 'react';
// Fix: Use named imports for react-router-dom to resolve missing named export errors in this environment
import { useNavigate } from 'react-router-dom';
import { StorageService } from './services/storage';
import { DBService } from './services/supabase';
import { UserSession, Ticket, Message } from './types';
import { ChatWindow } from './components/ChatWindow';
import { Search, LogOut, Settings, Image as ImageIcon, ArrowLeft, ChevronRight, Loader2, Check, CheckCheck } from 'lucide-react';
import { DEFAULT_LOGO, FALLBACK_LOGO } from './constants';

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
  const [isLoading, setIsLoading] = useState(true);
  
  const selectedTicketIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketId;
  }, [selectedTicketId]);

  useEffect(() => {
    const fetchData = async () => {
        try {
          const freshTickets = await DBService.getTickets();
          setTickets(freshTickets);
        } catch (e) {
          console.error("Fetch error", e);
        } finally {
          setIsLoading(false);
        }
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
            freshTickets[ticketIndex] = { ...ticket, messages: updatedMessages, lastSeenAdmin: Date.now() };
          }
        }
      }
      setTickets(freshTickets);
    }, 2500); 

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
      const updatedMessages = ticket.messages.map(m => m.sender === 'user' ? { ...m, read: true } : m);
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
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden fixed inset-0">
      {/* Sidebar: Ticket List */}
      <div className={`w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 transition-transform duration-300 ease-out ${selectedTicketId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <div className="bg-[#f0f2f5] px-4 py-3 flex justify-between items-center border-b border-gray-200 h-16 shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-white shadow-sm overflow-hidden p-1.5 flex items-center justify-center">
                <img 
                  src={logo || DEFAULT_LOGO} 
                  className="h-full w-full object-contain" 
                  alt="Logo" 
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }}
                />
             </div>
             <span className="font-bold text-gray-800">Admin</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-black/5 rounded-full text-gray-600 transition-all">
                <Settings size={20} />
            </button>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
        
        {showSettings && (
            <div className="p-4 bg-gray-50 border-b border-gray-200 animate-slide-up">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Logo Configuration</label>
                <div className="flex gap-2 mt-2">
                    <input 
                        className="flex-1 text-sm border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:border-[#008060] bg-white" 
                        placeholder="Image URL" 
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                    />
                    <button 
                        onClick={updateLogo} 
                        className="bg-[#008060] text-white px-4 rounded-xl font-bold hover:bg-[#004c3f] transition-all"
                    >
                        Save
                    </button>
                </div>
            </div>
        )}

        <div className="px-4 py-3 border-b border-gray-50 bg-white">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={16}/>
                </div>
                <input 
                    type="text" 
                    placeholder="Search conversations" 
                    className="w-full bg-[#f0f2f5] pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar md:chat-scroll">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-gray-400">
              <Loader2 className="animate-spin" />
              <p className="text-xs">Loading inbox...</p>
            </div>
          ) : sortedTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-sm">No conversations yet.</p>
            </div>
          ) : (
            sortedTickets.map(ticket => {
               const lastMsg = ticket.messages[ticket.messages.length - 1];
               const unreadCount = ticket.messages.filter(m => m.sender === 'user' && !m.read).length;
               const isSelected = selectedTicketId === ticket.ticketId;
               
               return (
                 <div 
                   key={ticket.ticketId}
                   onClick={() => handleTicketSelect(ticket.ticketId)}
                   className={`px-4 py-3 border-b border-gray-50 cursor-pointer flex gap-3 hover:bg-[#f5f6f6] transition-all relative ${isSelected ? 'bg-[#f0f2f5] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[#008060]' : 'bg-white'}`}
                 >
                   <div className="h-12 w-12 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-700 font-bold text-lg shadow-inner">
                      {ticket.userEmail.charAt(0).toUpperCase()}
                   </div>

                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-bold text-gray-900 truncate text-[15px]">{ticket.userEmail}</span>
                            <span className={`text-[10px] uppercase ${unreadCount > 0 ? 'text-[#25D366] font-bold' : 'text-gray-400'}`}>
                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                            </span>
                       </div>
                       <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500 truncate pr-2 flex items-center gap-1">
                                {lastMsg?.sender === 'admin' && (
                                    <span className={`text-gray-400 ${lastMsg.read ? 'text-blue-500' : ''}`}>
                                      {lastMsg.read ? <CheckCheck size={14}/> : <Check size={14}/>}
                                    </span>
                                )}
                                {lastMsg ? (
                                    lastMsg.type === 'text' ? lastMsg.content : <span className="flex items-center gap-1 italic text-xs"><ImageIcon size={14}/> Image attachment</span>
                                ) : 'Started a conversation'}
                            </div>
                            {unreadCount > 0 && (
                                <span className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
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

      {/* Main Content Area / Chat View */}
      <div className={`flex-1 flex flex-col h-full bg-[#efeae2] absolute inset-0 md:relative md:translate-x-0 transition-transform duration-300 ease-out ${selectedTicketId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {selectedTicket ? (
            <>
              {/* Header with Back Button for Mobile */}
              <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex items-center shadow-sm h-16 shrink-0 z-20">
                  <button 
                    onClick={() => setSelectedTicketId(null)} 
                    className="md:hidden mr-3 p-1 hover:bg-black/5 rounded-full transition-colors"
                  >
                    <ArrowLeft size={24} className="text-gray-600" />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold mr-3 shadow-md">
                      {selectedTicket.userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-sm md:text-base truncate">{selectedTicket.userEmail}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">ID: {selectedTicket.ticketId}</div>
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
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500 bg-[#f8f9fa] border-b-[6px] border-[#25D366]">
                <div className="mb-10 animate-fade-in">
                    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" className="w-40 h-40 opacity-20 grayscale drop-shadow-2xl" alt="Welcome"/>
                </div>
                <h2 className="text-4xl font-light text-gray-700 mb-6">Support Console</h2>
                <div className="max-w-sm text-center space-y-2 opacity-60">
                  <p className="text-sm">Select a contact to view their conversation.</p>
                  <p className="text-xs">End-to-end encrypted messaging secure and fast.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Admin;