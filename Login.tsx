
import React, { useState, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom to resolve missing named export errors in this environment
import * as ReactRouterDOM from 'react-router-dom';
import { StorageService } from './services/storage';
import { DBService } from './services/supabase';
import { UserSession } from './types';
import { DEFAULT_LOGO, FALLBACK_LOGO } from './constants';
import { ArrowRight, Mail, KeyRound, Lock, ShieldCheck, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

const { useNavigate } = ReactRouterDOM;

interface LoginProps {
  setUser: (u: UserSession) => void;
  logo: string;
}

const Login: React.FC<LoginProps> = ({ setUser, logo }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const navigate = useNavigate();
  const [adminClicks, setAdminClicks] = useState(0);

  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const isPreVerified = await DBService.checkEmailHistory(cleanEmail);

      if (isPreVerified) {
        setStep(4);
        setTimeout(() => {
          const userSession: UserSession = {
            email: cleanEmail,
            role: 'user',
            isAuthenticated: true
          };
          StorageService.setUserSession(userSession);
          setUser(userSession);
          navigate('/');
        }, 1200);
        return;
      }

      await DBService.sendOtp(cleanEmail);
      setStep(2);
      setCountdown(30);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError('');
    try {
        await DBService.sendOtp(email);
        setCountdown(30);
        setCanResend(false);
    } catch (err: any) {
        setError(err.message || "Failed to resend code.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const session = await DBService.verifyOtp(email, code);
      if (session && session.user && session.user.email) {
          const userSession: UserSession = {
              email: session.user.email,
              role: 'user',
              isAuthenticated: true
          };
          StorageService.setUserSession(userSession);
          setUser(userSession);
          navigate('/');
      } else {
          setError('Invalid code.');
      }
    } catch (err: any) {
        setError('Invalid or expired code.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleAdminTrigger = () => {
    if (step === 3) return;
    const newClicks = adminClicks + 1;
    setAdminClicks(newClicks);
    if (newClicks >= 5) {
      setStep(3);
      setError('');
      setAdminClicks(0);
    }
  };

  const handlePasskeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === 'Adiv2k25@gmail.txtfonts') {
      const session: UserSession = {
        email: 'admin@helpcenter.com',
        role: 'admin',
        isAuthenticated: true
      };
      StorageService.setAdminSession(session);
      setUser(session);
      navigate('/admin');
    } else {
      setError('Invalid passkey.');
      setPasskey('');
    }
  };

  const displayLogo = logo && logo.includes('share.google') ? DEFAULT_LOGO : (logo || DEFAULT_LOGO);

  return (
    <div className="min-h-screen bg-[#f6f6f7] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1)] p-8 sm:p-12 relative overflow-hidden">
        {step === 4 && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
             <div className="bg-emerald-100 p-4 rounded-full mb-6 text-emerald-600 scale-110">
                <CheckCircle2 size={56} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
             <p className="text-gray-500 mb-8">We've verified your email before. Fast-tracking your login...</p>
             <div className="flex items-center gap-2 text-emerald-600 font-semibold">
               <Loader2 size={24} className="animate-spin" />
               Entering Help Center...
             </div>
          </div>
        )}

        <div className="flex flex-col items-center text-center mb-8">
           <img 
            src={displayLogo} 
            alt="Logo" 
            className="h-16 w-auto mb-3 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_LOGO; }}
          />
          <h1 className="text-2xl font-bold text-[#202223]">Help Center</h1>
          <p className="text-gray-500 mt-2 text-[15px]">
            {step === 1 ? 'Log in to continue to support' : step === 2 ? 'Check your email for the code' : step === 3 ? 'Admin Access Verification' : ''}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg flex items-start">
            <span className="font-medium mr-1 text-red-800">Error:</span> {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#202223]">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 text-[#202223] bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-[#008060] outline-none transition-all placeholder-gray-400"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                />
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-[#008060] hover:bg-[#004c3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008060] transition-colors disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
             <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#202223]">Verification Code</label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full px-4 py-3 text-[#202223] bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-[#008060] outline-none transition-all placeholder-gray-400 tracking-widest text-center"
                  placeholder="123456"
                  required
                  autoFocus
                  disabled={isLoading}
                />
                 <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <KeyRound size={20} className="text-gray-400" />
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Sent to <span className="font-medium">{email}</span></span>
                    <button type="button" onClick={() => setStep(1)} className="text-xs font-medium text-[#008060] hover:underline">Change email</button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-[#008060] hover:bg-[#004c3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008060] transition-colors disabled:opacity-70"
            >
               {isLoading ? <Loader2 className="animate-spin" /> : <><span className="mr-2">Verify & Login</span> <ArrowRight size={18} /></>}
            </button>

            <div className="text-center">
                <button 
                    type="button" 
                    onClick={handleResendCode}
                    disabled={!canResend || isLoading}
                    className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center mx-auto gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> 
                    {canResend ? "Resend Code" : `Resend code in ${countdown}s`}
                </button>
            </div>
          </form>
        )}

        {step === 3 && (
            <form onSubmit={handlePasskeySubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#202223]">Enter Admin Passkey</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={passkey}
                            onChange={(e) => setPasskey(e.target.value)}
                            className="block w-full px-4 py-3 text-[#202223] bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008060] focus:border-[#008060] outline-none transition-all placeholder-gray-400"
                            placeholder="Enter passkey"
                            required
                            autoFocus
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <ShieldCheck size={20} className="text-gray-400" />
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-[#008060] hover:bg-[#004c3f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008060] transition-colors"
                >
                    Verify Access <ArrowRight size={18} className="ml-2" />
                </button>
            </form>
        )}
      </div>

      {step !== 3 && step !== 4 && (
        <div 
            onClick={handleAdminTrigger}
            className="fixed bottom-4 right-4 w-10 h-10 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors z-50 group"
        >
            <Lock size={16} className="text-gray-400 group-hover:text-gray-600" />
        </div>
      )}
    </div>
  );
};

export default Login;
