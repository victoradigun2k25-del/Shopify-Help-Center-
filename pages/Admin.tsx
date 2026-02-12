import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { DBService } from '../services/supabase';
import { UserSession, Ticket, Message } from '../types';
import { ChatWindow } from '../components/ChatWindow';
import { Search, LogOut, Settings, Image as ImageIcon, ArrowLeft, Loader2, Check, CheckCheck } from 'lucide-react';
import { DEFAULT_LOGO, FALLBACK_LOGO } from '../constants';

interface AdminProps {
  user: UserSession;
  setUser: (u: UserSession | null) => void;
  logo: string;
  setLogo: (url: string) => void;
}

export const Admin: React.FC<AdminProps> = ({ user, setUser, logo, setLogo }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
          }
        }
      }
      setTickets(prev => {
        // Prevent flicker: only update if something actually changed
        if (JSON.stringify(prev) === JSON.stringify(freshTickets)) return prev;
        return freshTickets;
      });
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
      id: `local-${Date.now()}`,
      sender: 'admin',
      content: text,
      type,
      timestamp: Date.now(),
      read: false
    };

    // Optimistic Update
    setTickets(prev => prev.map(t => t.ticketId === selectedTicketId ? { ...t, messages: [...t.messages, newMessage] } : t));

    try {
      await DBService.saveMessage(selectedTicketId, newMessage);
      await DBService.updateTicketSeen(selectedTicketId, 'admin');
    } catch (e) {
      console.error("Failed to sync message", e);
    }
  };

  const handleTicketSelect = async (id: string) => {
    setSelectedTicketId(id);
    const ticket = tickets.find(t => t.ticketId === id);
    if (ticket) {
      await DBService.markMessagesRead(id, 'user');
    }
  };

  const filteredTickets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return tickets
      .filter(t => t.userEmail.toLowerCase().includes(query) || t.ticketId.toLowerCase().includes(query))
      .sort((a, b) => {
        const lastA = a.messages[a.messages.length - 1]?.timestamp || a.createdAt;
        const lastB = b.messages[b.messages.length - 1]?.timestamp || b.createdAt;
        return lastB - lastA;
      });
  }, [tickets, searchQuery]);

  const selectedTicket = tickets.find(t => t.ticketId === selectedTicketId);

  return (
    <div className="flex h-screen bg-[#f0f2f5] overflow-hidden fixed inset-0">
      <div className={`w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col shrink-0 z-10 transition-transform duration-300 ease-out ${selectedTicketId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
        <div className="bg-[#f0f2f5] px-4 py-3 flex justify-between items-center border-b border-gray-200 h-16 shrink-0">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-full bg-white shadow-sm overflow-hidden p-1 flex items-center justify-center">
                <img src={logo || DEFAULT_LOGO} className="h-full w-full object-contain" alt="Logo" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }} />
             </div>
             <span className="font-bold text-gray-800 tracking-tight">Admin Console</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-black/5 rounded-full text-gray-600 transition-all"><Settings size={20} /></button>
            <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-full text-red-500 transition-all"><LogOut size={20} /></button>
          </div>
        </div>
        
        {showSettings && (
            <div className="p-4 bg-gray-50 border-b border-gray-200 animate-slide-up">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Logo Provider URL</label>
                <div className="flex gap-2 mt-2">
                    <input className="flex-1 text-sm border border-gray-200 p-2.5 rounded-xl focus:ring-2 focus:ring-shopify-green/20 focus:border-shopify-green outline-none bg-white" placeholder="https://..." value={logoUrlInput} onChange={e => setLogoUrlInput(e.target.value)} />
                    <button onClick={() => { if(logoUrlInput) { StorageService.setLogo(logoUrlInput); setLogo(logoUrlInput); setLogoUrlInput(''); setShowSettings(false); }}} className="bg-shopify-green text-white px-4 rounded-xl font-bold hover:bg-shopify-dark transition-all">Save</button>
                </div>
            </div>
        )}

        <div className="px-4 py-3 border-b border-gray-50 bg-white">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Search size={16}/></div>
                <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#f0f2f5] pl-9 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-shopify-green/10 outline-none transition-all" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar md:chat-scroll">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4 text-gray-300"><Loader2 className="animate-spin" /><p className="text-xs font-bold uppercase tracking-widest">Loading inbox</p></div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400"><p className="text-sm italic">No conversations found.</p></div>
          ) : (
            filteredTickets.map(ticket => {
               const lastMsg = ticket.messages[ticket.messages.length - 1];
               const unreadCount = ticket.messages.filter(m => m.sender === 'user' && !m.read).length;
               const isSelected = selectedTicketId === ticket.ticketId;
               return (
                 <div key={ticket.ticketId} onClick={() => handleTicketSelect(ticket.ticketId)} className={`px-4 py-3 border-b border-gray-50 cursor-pointer flex gap-3 hover:bg-[#f5f6f6] transition-all relative ${isSelected ? 'bg-[#f0f2f5] after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-shopify-green' : 'bg-white'}`}>
                   <div className="h-12 w-12 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-700 font-extrabold text-lg shadow-inner">{ticket.userEmail.charAt(0).toUpperCase()}</div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-bold text-gray-900 truncate text-[15px]">{ticket.userEmail}</span>
                            <span className={`text-[10px] uppercase font-extrabold ${unreadCount > 0 ? 'text-whatsapp-green' : 'text-gray-400'}`}>{lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                       </div>
                       <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-500 truncate pr-2 flex items-center gap-1">
                                {lastMsg?.sender === 'admin' && <span className={lastMsg.read ? 'text-blue-500' : 'text-gray-400'}>{lastMsg.read ? <CheckCheck size={14}/> : <Check size={14}/>}</span>}
                                {lastMsg ? (lastMsg.type === 'text' ? lastMsg.content : <span className="flex items-center gap-1 italic text-xs"><ImageIcon size={14}/> Photo</span>) : 'Active session'}
                            </div>
                            {unreadCount > 0 && <span className="bg-whatsapp-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">{unreadCount}</span>}
                       </div>
                   </div>
                 </div>
               );
            })
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col h-full bg-whatsapp-bg absolute inset-0 md:relative md:translate-x-0 transition-transform duration-300 ease-out ${selectedTicketId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        {selectedTicket ? (
            <>
              <div className="bg-[#f0f2f5] px-4 py-3 border-b border-gray-200 flex items-center shadow-sm h-16 shrink-0 z-20">
                  <button onClick={() => setSelectedTicketId(null)} className="md:hidden mr-3 p-2 hover:bg-black/5 rounded-full transition-colors text-gray-600"><ArrowLeft size={24} /></button>
                  <div className="h-10 w-10 rounded-full bg-shopify-green flex items-center justify-center text-white font-bold mr-3 shadow-md">{selectedTicket.userEmail.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 text-[15px] truncate">{selectedTicket.userEmail}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-extrabold tracking-tighter">Support ID: {selectedTicket.ticketId}</div>
                  </div>
              </div>
              <ChatWindow ticket={selectedTicket} currentUserRole="admin" onSendMessage={handleSendMessage} className="flex-1" />
            </>
        ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-500 bg-[#f8f9fa] border-b-[6px] border-whatsapp-green">
                <div className="mb-10 animate-fade-in opacity-20 grayscale drop-shadow-2xl">
                    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968756.png" className="w-40 h-40" alt="Admin" />
                </div>
                <h2 className="text-4xl font-light text-gray-700 mb-4 tracking-tight">Shopify Admin Support</h2>
                <p className="text-sm text-gray-400 max-w-sm text-center font-medium">Select a contact from the left pane to begin troubleshooting and managing support tickets.</p>
            </div>
        )}
      </div>
    </div>
  );
};
