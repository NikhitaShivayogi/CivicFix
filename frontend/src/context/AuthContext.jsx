import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'civicfix-token';

function readStoredToken() {
  const persistentToken = localStorage.getItem(TOKEN_KEY);
  if (persistentToken) {
    sessionStorage.removeItem(TOKEN_KEY);
    return persistentToken;
  }

  const sessionToken = sessionStorage.getItem(TOKEN_KEY) || '';
  if (sessionToken) {
    localStorage.setItem(TOKEN_KEY, sessionToken);
    sessionStorage.removeItem(TOKEN_KEY);
  }
  return sessionToken;
}

axios.defaults.baseURL = API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(readStoredToken);
  const [loading, setLoading] = useState(() => Boolean(readStoredToken()));

  useEffect(() => {
    if (!token) return;

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    axios
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        delete axios.defaults.headers.common.Authorization;
        setToken('');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password, role) => {
    const response = await axios.post('/auth/login', { email, password, role });
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    localStorage.setItem(TOKEN_KEY, nextToken);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(nextToken);
    setUser(nextUser);
    axios.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    return response.data;
  };

  const register = async (payload) => {
    const response = await axios.post('/auth/register', payload);
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    localStorage.setItem(TOKEN_KEY, nextToken);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(nextToken);
    setUser(nextUser);
    axios.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    return response.data;
  };

  const registerAuthority = async (payload) => {
    const response = await axios.post('/auth/authority/request', payload);
    return response.data;
  };

  const updateProfile = async (payload) => {
    const response = await axios.patch('/auth/me', payload);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    setToken('');
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, registerAuthority, updateProfile, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
