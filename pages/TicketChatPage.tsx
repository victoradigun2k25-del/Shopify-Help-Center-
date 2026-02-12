
import React, { useState, useEffect } from 'react';
// Fix: Use named imports for react-router-dom to resolve missing named export errors in this environment
import { useParams, Link } from 'react-router-dom';
import { DBService } from '../services/supabase';
import { Ticket, Message, UserSession } from '../types';
import { ChatWindow } from '../components/ChatWindow';
import { ArrowLeft, Loader2, MessageCircle, MoreVertical } from 'lucide-react';

interface TicketChatPageProps {
  user: UserSession;
}

export const TicketChatPage: React.FC<TicketChatPageProps> = ({ user }) => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticketId) return;

    const fetchTicket = async () => {
      try {
        const data = await DBService.getTicketById(ticketId);
        if (data) {
          if (data.userEmail !== user.email) {
            setError("You do not have permission to view this ticket.");
          } else {
            setTicket(data);
            await DBService.markMessagesRead(ticketId, 'admin');
          }
        } else {
          setError("Ticket not found.");
        }
      } catch (err) {
        setError("Failed to load ticket.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();

    const interval = setInterval(async () => {
      const fresh = await DBService.getTicketById(ticketId);
      if (fresh) {
        setTicket(fresh);
        if (fresh.messages.some(m => m.sender === 'admin' && !m.read)) {
          await DBService.markMessagesRead(ticketId, 'admin');
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [ticketId, user.email]);

  const handleSendMessage = async (text: string, type: 'text' | 'image' | 'file') => {
    if (!ticket || !ticketId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      type,
      timestamp: Date.now(),
      read: false
    };

    // Instant local update (Real-time feel)
    setTicket({
      ...ticket,
      messages: [...ticket.messages, newMessage]
    });

    await DBService.saveMessage(ticketId, newMessage);
    await DBService.updateTicketSeen(ticketId, 'user');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="animate-spin text-shopify-green mb-4" size={48} />
        <p className="text-gray-400 font-medium animate-pulse">Connecting to support server...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 mt-20 text-center animate-slide-up">
        <div className="bg-red-50 text-red-400 p-8 rounded-full inline-block mb-8 shadow-xl">
          <MessageCircle size={64} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chat Unavailable</h1>
        <p className="text-gray-500 mb-10 text-lg leading-relaxed">{error || "This conversation session has expired or moved."}</p>
        <Link to="/" className="inline-flex items-center gap-3 bg-shopify-green text-white px-8 py-4 rounded-2xl font-bold hover:bg-shopify-dark transition-all shadow-lg shadow-shopify-green/20">
          <ArrowLeft size={20} /> Back to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#efeae2] animate-fade-in overflow-hidden">
      {/* Header bar - WhatsApp Mobile Style */}
      <div className="bg-[#f0f2f5] px-4 py-2 border-b border-black/5 flex items-center gap-3 shadow-sm z-30 shrink-0">
         <Link to="/" className="p-2 hover:bg-black/5 rounded-full text-gray-600 transition-colors">
            <ArrowLeft size={24} />
         </Link>
         
         <div className="w-10 h-10 rounded-full bg-shopify-green flex items-center justify-center text-white font-bold shadow-md">
            S
         </div>
         
         <div className="flex-1 min-w-0">
            <h1 className="text-sm md:text-base font-bold text-gray-900 truncate">Shopify Admin Support</h1>
            <div className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Online & Active</span>
            </div>
         </div>

         <div className="flex items-center gap-1">
           <div className="hidden sm:block text-[10px] font-bold text-gray-400 px-2 py-1 bg-black/5 rounded">TID: {ticketId}</div>
           <button className="p-2 hover:bg-black/5 rounded-full text-gray-400">
             <MoreVertical size={20} />
           </button>
         </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 relative">
        <ChatWindow 
          ticket={ticket}
          currentUserRole="user"
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Mobile safety padding */}
      <div className="h-[env(safe-area-inset-bottom)] bg-white shrink-0"></div>
    </div>
  );
};
