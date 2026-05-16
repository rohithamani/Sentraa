import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  profile: {
    gender?: string;
    ageGroup?: string;
    studyStream?: string;
    workType?: string;
    shift?: string;
    healthConditions?: string[];
  };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (userData: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  profile: {
    gender?: string;
    ageGroup?: string;
    studyStream?: string;
    workType?: string;
    shift?: string;
    healthConditions?: string[];
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored token on app startup
    const storedToken = localStorage.getItem('sentraa_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token might be invalid, remove it
        localStorage.removeItem('sentraa_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('sentraa_token');
      setToken(null);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      // First try the regular login endpoint
      let response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data = await response.json();

      // If MongoDB is not available, try the temporary login endpoint
      if (!data.success && data.error === 'DATABASE_UNAVAILABLE') {
        console.log('MongoDB not available, using temporary storage...');
        response = await fetch(`${API_BASE_URL}/auth/login-temp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        data = await response.json();
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('sentraa_token', data.token);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      // First try the regular signup endpoint
      let response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      let data = await response.json();

      // If MongoDB is not available, try the temporary signup endpoint
      if (!data.success && data.error === 'DATABASE_UNAVAILABLE') {
        console.log('MongoDB not available, using temporary storage...');
        response = await fetch(`${API_BASE_URL}/auth/signup-temp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        data = await response.json();
      }

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('sentraa_token', data.token);
        
        // Show additional message if using temporary storage
        const message = data.note 
          ? `${data.message}\n\n⚠️ Note: ${data.note}`
          : data.message;
          
        return { success: true, message };
      } else {
        const errorMessage = data.errors 
          ? data.errors.map((err: any) => err.msg).join(', ')
          : data.message || 'Signup failed';
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sentraa_token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};