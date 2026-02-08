import { createClient } from '@supabase/supabase-js';
import { Ticket, Message } from '../types';

const SUPABASE_URL = 'https://qjhhzrhxrdylyyoounyn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqaGh6cmh4cmR5bHl5b291bnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjU1OTIsImV4cCI6MjA4NjA0MTU5Mn0.saN6VfBtKhVTL59AwH80zIKog8PHrh1eTzo4d7vcu2Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const DBService = {
  // Auth
  sendOtp: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ 
      email: email.toLowerCase(),
      options: {
        shouldCreateUser: true
      }
    });
    if (error) throw error;
  },

  verifyOtp: async (email: string, token: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanToken = token.trim();

    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
       const { data: retryData, error: retryError } = await supabase.auth.verifyOtp({
         email: cleanEmail,
         token: cleanToken,
         type: 'signup',
       });
       if (!retryError) return retryData.session;
       
       if (retryError) {
          const { data: magicData, error: magicError } = await supabase.auth.verifyOtp({
             email: cleanEmail,
             token: cleanToken,
             type: 'magiclink'
          });
          if (!magicError) return magicData.session;
       }
       throw error;
    }

    return data.session;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Check if this email has any existing tickets (meaning they are already verified)
  checkEmailHistory: async (email: string): Promise<boolean> => {
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', email.toLowerCase().trim());
    
    if (error) return false;
    return (count || 0) > 0;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  // Tickets
  getTickets: async (): Promise<Ticket[]> => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`*, messages (*)`)
      .order('last_seen_user', { ascending: false });

    if (error) return [];
    if (!data) return [];

    return data.map((t: any) => ({
      ticketId: t.ticket_id,
      userEmail: t.user_email,
      lastSeenUser: t.last_seen_user,
      lastSeenAdmin: t.last_seen_admin,
      createdAt: t.created_at,
      messages: Array.isArray(t.messages) 
        ? t.messages.sort((a: any, b: any) => a.timestamp - b.timestamp)
        : []
    }));
  },

  getTicketById: async (ticketId: string): Promise<Ticket | null> => {
    const { data, error } = await supabase
      .from('tickets')
      .select(`*, messages (*)`)
      .eq('ticket_id', ticketId)
      .single();

    if (error || !data) return null;

    return {
      ticketId: data.ticket_id,
      userEmail: data.user_email,
      last_seen_user: data.last_seen_user,
      last_seen_admin: data.last_seen_admin,
      createdAt: data.created_at,
      messages: Array.isArray(data.messages) 
        ? data.messages.sort((a: any, b: any) => a.timestamp - b.timestamp)
        : []
    } as any;
  },

  createTicket: async (ticket: Ticket) => {
    const { error: tError } = await supabase.from('tickets').insert({
      ticket_id: ticket.ticketId,
      user_email: ticket.userEmail,
      last_seen_user: ticket.lastSeenUser,
      last_seen_admin: ticket.lastSeenAdmin,
      created_at: ticket.createdAt
    });
    if (tError) return;
    if (ticket.messages.length > 0) {
      await DBService.saveMessage(ticket.ticketId, ticket.messages[0]);
    }
  },

  saveMessage: async (ticketId: string, message: Message) => {
    await supabase.from('messages').insert({
      id: message.id,
      ticket_id: ticketId,
      sender: message.sender,
      content: message.content,
      type: message.type,
      timestamp: message.timestamp,
      read: message.read
    });
  },
  
  updateTicketSeen: async (ticketId: string, role: 'user' | 'admin') => {
      const field = role === 'user' ? 'last_seen_user' : 'last_seen_admin';
      await supabase.from('tickets').update({ [field]: Date.now() }).eq('ticket_id', ticketId);
  },

  markMessagesRead: async (ticketId: string, senderRoleToMarkRead: 'user' | 'admin') => {
    await supabase.from('messages').update({ read: true }).eq('ticket_id', ticketId).eq('sender', senderRoleToMarkRead);
  }
};