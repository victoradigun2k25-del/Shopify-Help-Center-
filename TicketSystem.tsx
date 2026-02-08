
import React, { useState } from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { Send, X, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { DBService } from '../services/supabase';
import { Ticket } from '../types';

const { useNavigate } = ReactRouterDOM;

interface TicketSystemProps {
  userEmail: string;
}

export const TicketSystem: React.FC<TicketSystemProps> = ({ userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'prompt' | 'input'>('prompt');
  const [ticketIdInput, setTicketIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Floating button logic
  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
      setStep('prompt');
    } else {
      setIsOpen(true);
      setStep('prompt');
    }
  };

  const handleStartWithId = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = ticketIdInput.trim();
    if (!tid) return;
    setIsLoading(true);

    try {
        let ticket = await DBService.getTicketById(tid);

        if (!ticket) {
            // Create new ticket if it doesn't exist
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
        } else {
             // Validate ownership
             if (ticket.userEmail !== userEmail) {
                alert("Ticket ID belongs to another user.");
                setIsLoading(false);
                return;
             }
        }

        // Instead of opening a popup, navigate to the full page
        setIsOpen(false);
        navigate(`/ticket/${tid}`);
    } catch (error) {
        console.error("Failed to start chat", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[40px] right-[40px] z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-2xl overflow-hidden w-[350px] sm:w-[380px] h-[400px] border border-gray-200 flex flex-col transition-all duration-300 ease-out origin-bottom-right">
          {step === 'prompt' && (
             <div className="p-6 flex flex-col h-full justify-center items-center text-center bg-gray-50">
               <div className="bg-emerald-100 p-3 rounded-full mb-4">
                 <MessageSquare size={32} className="text-shopify-green" />
               </div>
               <h3 className="text-xl font-semibold mb-2 text-gray-800">Support Chat</h3>
               <p className="text-gray-500 mb-6 text-sm">Enter your Ticket ID to continue a conversation or start a new one.</p>
               <button 
                onClick={() => setStep('input')}
                className="bg-[#008060] text-white py-2 px-6 rounded-lg font-medium hover:bg-[#004c3f] transition-colors w-full"
               >
                 Enter Ticket ID
               </button>
             </div>
          )}

          {step === 'input' && (
            <div className="flex flex-col h-full">
              <div className="bg-[#008060] p-4 text-white flex justify-between items-center">
                 <h3 className="font-bold">Enter Ticket Details</h3>
                 <button onClick={toggleChat}><X size={20}/></button>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <form onSubmit={handleStartWithId} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ticket ID</label>
                    <input 
                      type="text" 
                      value={ticketIdInput}
                      onChange={(e) => setTicketIdInput(e.target.value)}
                      placeholder="e.g. T-1001"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#008060] outline-none bg-white text-gray-800"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#008060] text-white py-3 rounded-lg font-medium hover:bg-[#004c3f] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="animate-spin"/> : <>Open Conversation <ArrowRight size={18} /></>}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    New conversations are created automatically.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Launcher Button - Redesigned as requested */}
      <button 
        onClick={toggleChat}
        className={`h-12 px-5 rounded-full bg-white border border-gray-200 text-gray-800 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center gap-3 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-200 group ${isOpen ? 'ring-2 ring-shopify-green ring-offset-2' : ''}`}
      >
        <div className="relative">
          <MessageSquare size={18} className="text-gray-600 group-hover:text-shopify-green" />
          {/* Subtle user-inside-message hint */}
          <div className="absolute top-[3px] left-[5px] w-1.5 h-1.5 bg-gray-600 group-hover:bg-shopify-green rounded-full opacity-40"></div>
        </div>
        <span className="font-medium text-[15px] whitespace-nowrap">Chat with an admin</span>
        {isOpen ? <X size={16} className="text-gray-400 ml-1" /> : <Send size={14} className="text-gray-400 ml-1 opacity-60 group-hover:translate-x-0.5 transition-transform" />}
      </button>
    </div>
  );
};
