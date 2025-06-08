import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';

// Create the auth context
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on initial load and set user data
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.error('Failed to fetch user data');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Run auth check only once on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Login function
// login関数の修正
const login = useCallback(async (email, password, recaptchaToken) => {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, recaptchaToken }),
    });

    if (response.ok) {
      // ログイン成功後、明示的にユーザー情報を再取得
      const userResponse = await fetch('/api/user/me', {
        credentials: 'include',
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        // ユーザー情報取得に失敗した場合も認証状態は更新
        setIsAuthenticated(true);
        // すぐに再取得を試みる
        setTimeout(() => checkAuthStatus(), 500);
        return { success: true };
      }
    } else {
      const errorData = await response.json();
      return { 
        success: false, 
        message: errorData.message || 'ログインに失敗しました',
        requireCaptcha: errorData.message === 'Too many attempts'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'ネットワークエラー。後でもう一度お試しください' };
  }
}, [checkAuthStatus]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        return true;
      } else {
        console.error('Logout failed');
        return false;
      }
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  }, []);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!isAuthenticated) return;
    console.log('Refreshing user data...');
    try {
      const response = await fetch('/api/user/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [isAuthenticated]);

  // Check auth without changing state (for components that need to verify auth)
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/check-auth', {
        method: 'GET',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('Auth check failed', error);
      return false;
    }
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshUserData,
    checkAuth,
    checkAuthStatus
  }), [
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    refreshUserData,
    checkAuth,
    checkAuthStatus
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context with memoization
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher order component to memoize components that use auth context
export const withAuth = (Component) => {
  const MemoizedComponent = React.memo((props) => {
    const authContext = useAuth();
    return <Component {...props} auth={authContext} />;
  });
  
  // Set display name for better debugging
  MemoizedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return MemoizedComponent;
};

export default AuthContext;