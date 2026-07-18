import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '../../services/auth/auth.service';

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auto-login using saved Sanctum token
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      authService.getCurrentUser()
        .then((data) => {
          if (data.success) {
            if (data.user.role !== 'admin' && data.user.role !== 'supervisor') {
              localStorage.removeItem("auth_token");
              setIsAuthenticated(false);
              setCurrentUser(null);
              return;
            }
            setIsAuthenticated(true);
            const mappedUser = {
              id: data.user.id,
              name: data.user.name,
              name_ar: data.user.name_ar,
              name_en: data.user.name_en,
              username: data.user.username,
              role: data.user.role,
              photo: data.user.photo_url || "أ ع",
              email: null,
              permissions: data.user.permissions || {},
            };
            setCurrentUser(mappedUser);
          } else {
            localStorage.removeItem("auth_token");
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        })
        .catch((err) => {
          console.error("API Auto-Login error:", err);
          setIsAuthenticated(false);
          setCurrentUser(null);
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password, role) => {
    const data = await authService.login(username, password, role);

    if (data.success) {
      if (data.user.role !== 'admin' && data.user.role !== 'supervisor') {
        throw new Error('Unauthorized');
      }
      localStorage.setItem('auth_token', data.token);
      setIsAuthenticated(true);
      
      const mappedUser = {
        id: data.user.id,
        name: data.user.name,
        name_ar: data.user.name_ar,
        name_en: data.user.name_en,
        username: data.user.username,
        role: data.user.role,
        photo: data.user.photo_url || "أ ع",
        email: null,
        permissions: data.user.permissions || {},
      };
      setCurrentUser(mappedUser);
      return mappedUser;
    } else {
      throw new Error(data.message || 'Invalid credentials');
    }
  }, []);

  const logout = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        await authService.logout();
      } catch (err) {
        console.error("API Logout error:", err);
      }
    }
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setCurrentUser(null);
  }, []);

  const authContextValue = useMemo(() => ({
    isAuthenticated,
    currentUser,
    isAuthLoading,
    login,
    logout,
    setIsAuthenticated,
    setCurrentUser
  }), [isAuthenticated, currentUser, isAuthLoading, login, logout]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};
