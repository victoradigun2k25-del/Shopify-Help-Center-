import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, MessageSquare, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { DBService } from '../services/supabase';

interface TicketSystemProps {
  userEmail: string;
}

export const TicketSystem: React.FC<TicketSystemProps> = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'prompt' | 'input'>('prompt');
  const [ticketIdInput, setTicketIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep('prompt');
    };
    window.addEventListener('open-support-popup', handleOpen);
    return () => window.removeEventListener('open-support-popup', handleOpen);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setStep('prompt');
    setTicketIdInput('');
  };

  const handleStartWithId = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = ticketIdInput.trim();
    if (!tid) return;
    setIsLoading(true);

    try {
        let ticket = await DBService.getTicketById(tid);
        if (!ticket) {
            ticket = {
                ticketId: tid,
                userEmail: userEmail,
                messages: [{
                    id: Date.now().toString(),
                    content: 'Hello! How can we help you today?',
                    sender: 'admin',
                    type: 'text',
                    timestamp: Date.now(),
                    read: false
                }],
                lastSeenUser: Date.now(),
                lastSeenAdmin: Date.now(),
                createdAt: Date.now()
            };
            await DBService.createTicket(ticket);
        } else if (ticket.userEmail !== userEmail) {
            alert("This Ticket ID is assigned to another user.");
            setIsLoading(false);
            return;
        }
        setIsOpen(false);
        navigate(`/ticket/${tid}`);
    } catch (error) {
        console.error("Failed to start chat", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[45]">
        <button 
          onClick={toggleChat}
          className={`h-14 px-6 rounded-full bg-white border border-gray-100 text-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 group ${isOpen ? 'ring-2 ring-shopify-green ring-offset-2' : ''}`}
        >
          <div className="relative">
            <MessageSquare size={20} className="text-shopify-green" />
            <div className="absolute top-[3px] left-[5px] w-1.5 h-1.5 bg-shopify-green rounded-full opacity-40 animate-pulse"></div>
          </div>
          <span className="font-bold text-[15px] whitespace-nowrap">Chat with an admin</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm bg-black/40" onClick={toggleChat}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-scale-in relative flex flex-col max-h-[90vh]">
            <button onClick={toggleChat} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"><X size={24} /></button>

            {step === 'prompt' ? (
               <div className="p-8 md:p-10 flex flex-col items-center text-center">
                 <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                   <MessageSquare size={40} className="text-shopify-green" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3 text-gray-900">Live Support</h3>
                 <p className="text-gray-500 mb-8 leading-relaxed">Enter your Ticket ID to continue a conversation, or start a new one.</p>
                 <button onClick={() => setStep('input')} className="bg-shopify-green text-white h-14 px-8 rounded-2xl font-bold hover:bg-shopify-dark transition-all w-full flex items-center justify-center gap-2 shadow-lg shadow-shopify-green/20">
                   Continue with Ticket ID <ArrowRight size={20} />
                 </button>
               </div>
            ) : (
              <div className="flex flex-col">
                <div className="bg-shopify-green p-6 text-white text-center font-bold text-xl">Verification</div>
                <div className="p-8">
                  <form onSubmit={handleStartWithId} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1"><KeyRound size={12}/> Ticket Code</label>
                      <input type="text" value={ticketIdInput} onChange={e => setTicketIdInput(e.target.value)} placeholder="e.g. T-9999" className="w-full border-2 border-gray-100 rounded-2xl p-4 text-lg font-bold focus:border-shopify-green focus:ring-4 focus:ring-shopify-green/5 outline-none bg-gray-50 transition-all placeholder:text-gray-300" required autoFocus disabled={isLoading} />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full h-14 bg-shopify-green text-white rounded-2xl font-bold hover:bg-shopify-dark transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-shopify-green/20">
                      {isLoading ? <Loader2 className="animate-spin" size={24}/> : <>Access Conversation <Send size={18} /></>}
                    </button>
                    <button type="button" onClick={() => setStep('prompt')} className="w-full py-2 text-sm font-bold text-gray-400 hover:text-shopify-green transition-colors">Go Back</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
