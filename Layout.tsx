
import React from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { StorageService } from '../services/storage';
import { DBService } from '../services/supabase';
import { UserSession } from '../types';
import { DEFAULT_LOGO, FALLBACK_LOGO } from '../constants';
import { TicketSystem } from './TicketSystem';

const { useLocation, Link, useNavigate } = ReactRouterDOM;

interface LayoutProps {
  children: React.ReactNode;
  user: UserSession | null;
  setUser: (u: UserSession | null) => void;
  logo: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, setUser, logo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname === '/admin';
  const isTicketPage = location.pathname.startsWith('/ticket/');

  const handleLogout = async () => {
    if (user?.role === 'admin') {
      StorageService.clearAdminSession();
    } else {
      StorageService.clearUserSession();
      await DBService.signOut();
    }
    setUser(null);
    navigate('/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f7]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/">
              <img 
                src={logo || DEFAULT_LOGO} 
                alt="Help Center" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_LOGO;
                }}
              />
            </Link>
            <span className="hidden sm:inline-block text-gray-400 mx-2">|</span>
            <Link to="/" className="text-xl font-semibold text-gray-800 hover:text-shopify-green transition-colors">
              Help Center
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                 <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                 >
                   <LogOut size={16} />
                   Logout
                 </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" className="hover:text-shopify-green">Terms of Service</a>
            <a href="#" className="hover:text-shopify-green">Privacy Policy</a>
            <a href="#" className="hover:text-shopify-green">Sitemap</a>
          </div>
          <p>&copy; {new Date().getFullYear()} Help Center Replica. All rights reserved.</p>
        </div>
      </footer>

      {/* Only show the floating ticket system if the user is NOT already on a ticket chat page */}
      {user && !isTicketPage && <TicketSystem userEmail={user.email} />}
    </div>
  );
};
