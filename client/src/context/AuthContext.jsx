import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getMeApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    return t && t !== 'undefined' && t !== 'null' ? t : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const res = await getMeApi();
          const u = res.data?.data;
          if (u) {
            setUser({
              ...u,
              firstName: u.firstName || u.first_name,
              lastName: u.lastName || u.last_name
            });
          } else {
            throw new Error('No user data');
          }
        } catch (error) {
          console.error("Auth init error:", error);
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await loginApi({ email: email.trim(), password });
      const authData = res.data?.data;
      if (!authData || !authData.token) {
        throw new Error(res.data?.error || 'Invalid credentials');
      }
      const u = {
        ...authData.user,
        firstName: authData.user.firstName || authData.user.first_name,
        lastName: authData.user.lastName || authData.user.last_name
      };
      setToken(authData.token);
      localStorage.setItem('token', authData.token);
      setUser(u);
      return { success: true, role: u.role };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
      console.error('Login error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const register = async (data) => {
    try {
      const res = await registerApi(data);
      const authData = res.data?.data;
      if (!authData || !authData.token) {
        throw new Error(res.data?.error || 'Registration failed');
      }
      const u = {
        ...authData.user,
        firstName: authData.user.firstName || authData.user.first_name,
        lastName: authData.user.lastName || authData.user.last_name
      };
      setToken(authData.token);
      localStorage.setItem('token', authData.token);
      setUser(u);
      return { success: true, role: u.role };
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';
      console.error('Registration error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
