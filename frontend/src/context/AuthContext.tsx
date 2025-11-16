import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types';
import apiService from '../utils/services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}


const DEMO_AUTH_EMAIL = 'admin@ofis.com';
const DEMO_AUTH_PASSWORD = 'Admin123!';
const DEMO_USER_EMAIL = 'user@ofis.com';
const DEMO_USER_PASSWORD = 'User123!';
const DEMO_MANAGER_EMAIL = 'manager@ofis.com';
const DEMO_MANAGER_PASSWORD = 'ofis123';

const demoUser: User = {
  id: '11111111-1111-1111-1111-111111111111',
  firstName: 'Admin',
  lastName: 'User',
  email: DEMO_AUTH_EMAIL,
  role: 'Admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const demoNormalUser: User = {
  id: '22222222-2222-2222-2222-222222222222',
  firstName: 'Normal',
  lastName: 'User',
  email: DEMO_USER_EMAIL,
  role: 'Employee',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const demoManagerUser: User = {
  id: '33333333-3333-3333-3333-333333333333',
  firstName: 'Manager',
  lastName: 'User',
  email: DEMO_MANAGER_EMAIL,
  role: 'Manager',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const authMode = localStorage.getItem('authMode');

      if (token && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);

          if (authMode === 'demo') {
            // Demo oturumunda ağ çağrısı yapmadan kullanıcıyı doğrula
            setIsLoading(false);
            return;
          }

          await refreshUser();
        } catch (error) {
          console.error('Error initializing auth:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.removeItem('authMode');
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);

      const isDemoAdmin = credentials.email === DEMO_AUTH_EMAIL && credentials.password === DEMO_AUTH_PASSWORD;
      const isDemoUser = credentials.email === DEMO_USER_EMAIL && credentials.password === DEMO_USER_PASSWORD;
      const isDemoManager = credentials.email === DEMO_MANAGER_EMAIL && credentials.password === DEMO_MANAGER_PASSWORD;

      if (isDemoAdmin) {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('authMode', 'demo');
        setUser(demoUser);
        return;
      }
      if (isDemoUser) {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoNormalUser));
        localStorage.setItem('authMode', 'demo');
        setUser(demoNormalUser);
        return;
      }
      if (isDemoManager) {
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoManagerUser));
        localStorage.setItem('authMode', 'demo');
        setUser(demoManagerUser);
        return;
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      const newUser = await apiService.register(data);
      
      // After registration, automatically log in
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMode');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      if (localStorage.getItem('authMode') === 'demo') {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);
        }
        return;
      }

      const updatedUser = await apiService.getProfile();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
