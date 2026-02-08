
import React, { useState, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import Category from './Category';
import Article from './Article';
import Admin from './Admin';
import TicketChatPage from './TicketChatPage';
import { Layout } from './components/Layout';
import { StorageService } from './services/storage';
import { DBService } from './services/supabase';
import { UserSession } from './types';
import { DEFAULT_LOGO } from './constants';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);

  useEffect(() => {
    const init = async () => {
        // 1. Check Admin Local Session
        const adminSession = StorageService.getAdminSession();
        if (adminSession) {
            setUser(adminSession);
        } else {
            // 2. Check for Manual User Session first
            const manualSession = StorageService.getUserSession();
            if (manualSession) {
                setUser(manualSession);
            } else {
                // 3. Fallback to Supabase Auth
                const sbUser = await DBService.getCurrentUser();
                if (sbUser && sbUser.email) {
                    const session: UserSession = {
                        email: sbUser.email,
                        role: 'user',
                        isAuthenticated: true
                    };
                    StorageService.setUserSession(session);
                    setUser(session);
                }
            }
        }

        // Load Logo
        const storedLogo = StorageService.getLogo();
        if(storedLogo) {
            setLogo(storedLogo);
        }

        setLoading(false);
    };

    init();

    // Listen for Auth Changes
    const { data: { subscription } } = DBService.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
             const userSession: UserSession = {
                 email: session.user.email,
                 role: 'user',
                 isAuthenticated: true
             };
             StorageService.setUserSession(userSession);
             setUser(userSession);
             setLoading(false);
        } else if (event === 'SIGNED_OUT') {
             StorageService.clearUserSession();
             setUser(null);
        }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f6f6f7] text-gray-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading Help Center...
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace /> : <Login setUser={setUser} logo={logo} />
          } 
        />

        <Route
          path="/admin"
          element={
            user && user.role === 'admin' ? (
              <Admin user={user} setUser={setUser} logo={logo} setLogo={setLogo} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/*"
          element={
            user ? (
              <Layout user={user} setUser={setUser} logo={logo}>
                <Routes>
                  <Route path="/" element={<Home user={user} />} />
                  <Route path="/category/:id" element={<Category />} />
                  <Route path="/article/:id" element={<Article />} />
                  <Route path="/ticket/:ticketId" element={<TicketChatPage user={user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
