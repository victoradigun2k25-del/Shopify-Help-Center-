import { UserSession } from '../types';

const STORAGE_KEYS = {
  ADMIN_SESSION: 'hc_admin_session',
  USER_SESSION: 'hc_user_session', // New key for persistent user sessions
  APP_LOGO: 'hc_app_logo'
};

export const StorageService = {
  // Admin Session (Passkey based)
  getAdminSession: (): UserSession | null => {
    const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return data ? JSON.parse(data) : null;
  },

  setAdminSession: (session: UserSession) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
  },

  clearAdminSession: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  },

  // Manual User Session (For pre-verified users)
  getUserSession: (): UserSession | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    return data ? JSON.parse(data) : null;
  },

  setUserSession: (session: UserSession) => {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
  },

  clearUserSession: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
  },

  // Global Config
  setLogo: (url: string) => {
    localStorage.setItem(STORAGE_KEYS.APP_LOGO, url);
  },

  getLogo: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.APP_LOGO);
  }
};
