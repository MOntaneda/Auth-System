import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intentamos rehidratar sesión desde el token guardado
 
    // Rehidratar sesión al recargar la página
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Intentamos refrescar directamente. Si la cookie es válida, nos dará el token y el usuario
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
      } catch {
        // Si falla, es porque no hay sesión activa o expiró
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);


  
  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);


 const register = useCallback(async (username, email, password, turnstileToken) => {
    const { data } = await api.post('/auth/register', { 
      username, 
      email, 
      password, 
      turnstileToken // <-- Se envía al backend
    });
    localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* noop */ }
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};