import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('jfx_token'));
  const [username, setUsername] = useState(() => localStorage.getItem('jfx_username'));

  const login = useCallback((newToken, newUsername) => {
    localStorage.setItem('jfx_token', newToken);
    localStorage.setItem('jfx_username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jfx_token');
    localStorage.removeItem('jfx_username');
    setToken(null);
    setUsername(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
