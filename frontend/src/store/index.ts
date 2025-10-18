// Global state management configuration
// Bu dosyada Zustand, Redux Toolkit, veya Context API store'ları tanımlanabilir

export interface AppState {
  theme: 'light' | 'dark';
  language: 'tr' | 'en';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

// Theme ve UI state'i için store
export const useAppStore = () => {
  // Store implementasyonu gelecek
  return {
    theme: 'light' as const,
    language: 'tr' as const,
    notifications: [] as Notification[],
    setTheme: (theme: 'light' | 'dark') => {},
    setLanguage: (language: 'tr' | 'en') => {},
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => {},
    removeNotification: (id: string) => {},
  };
};