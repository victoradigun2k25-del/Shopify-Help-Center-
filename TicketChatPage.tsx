
import React, { useState, useEffect } from 'react';
// Fix: Use named imports for react-router-dom to resolve missing named export errors in this environment
import { useParams, Link } from 'react-router-dom';
import { DBService } from './services/supabase';
import { Ticket, Message, UserSession } from './types';
import { ChatWindow } from './components/ChatWindow';
import { ArrowLeft, Loader2, MessageCircle } from 'lucide-react';

interface TicketChatPageProps {
  user: UserSession;
}

const TicketChatPage: React.FC<TicketChatPageProps> = ({ user }) => {
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

    setTicket({
      ...ticket,
      messages: [...ticket.messages, newMessage]
    });

    await DBService.saveMessage(ticketId, newMessage);
    await DBService.updateTicketSeen(ticketId, 'user');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading your conversation...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full inline-block mb-6">
          <MessageCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversation Not Available</h1>
        <p className="text-gray-600 mb-8">{error || "The ticket you're looking for doesn't exist or you don't have access."}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:underline">
          <ArrowLeft size={18} /> Back to Help Center
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
             <Link to="/" className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-600 transition-colors shadow-sm">
                <ArrowLeft size={20} />
             </Link>
             <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Support Ticket: #{ticketId}</h1>
                <p className="text-sm text-gray-500">Subject: Order Assistance & General Support</p>
             </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE CONVERSATION
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[700px] flex flex-col">
          <ChatWindow 
            ticket={ticket}
            currentUserRole="user"
            onSendMessage={handleSendMessage}
            className="flex-1"
          />
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-xl text-center text-xs text-gray-500">
           Please note: Support representatives will never ask for your password or credit card details via chat.
        </div>
      </div>
    </div>
  );
};

export default TicketChatPage;