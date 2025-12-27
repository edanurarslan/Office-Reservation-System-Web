import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // Logout fonksiyonunu useCallback ile sarmalıyoruz çünkü diğer fonksiyonlar içinde bağımlılık olarak kullanılacak
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authMode');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
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
  }, [logout]);

  // Uygulama başladığında durumu initialize et
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const authMode = localStorage.getItem('authMode');

      if (token && storedUser) {
        try {
          const parsedUser: User = JSON.parse(storedUser);
          setUser(parsedUser);

          if (authMode !== 'demo') {
            await refreshUser();
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout, refreshUser]);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.removeItem('authMode');
      setUser(response.user);

      // Rol bazlı yönlendirme
      const role = response.user.role;
      if (role === 'Admin') {
        navigate('/admin/overview', { replace: true });
      } else if (role === 'Manager') {
        navigate('/manager/dashboard', { replace: true }); // Manager için kendi dashboard
      } else {
        navigate('/employee/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true);
      await apiService.register(data);
      // Kayıt sonrası otomatik giriş
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;