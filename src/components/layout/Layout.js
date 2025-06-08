import React, { useState, useEffect, useContext } from "react";
import { Box, CircularProgress } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Footer from './footer/Footer';
import Header from './header/Header';
import { SearchContext } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { searchParams } = useContext(SearchContext);
  const [searchQuery, setSearchQuery] = useState(searchParams.mustInclude || "");
  const { isAuthenticated, user, logout, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  // Update search query when URL parameters change
  useEffect(() => {
    setSearchQuery(searchParams.mustInclude || "");
  }, [location.search, searchParams.mustInclude]);

  // ログイン状態とユーザー情報を同期
  useEffect(() => {
    // 認証済みだがユーザー情報がない場合はユーザー情報を再取得
    if (isAuthenticated && !user) {
      setLoading(true);
      refreshUserData().finally(() => {
        setLoading(false);
      });
    }
  }, [isAuthenticated, user, refreshUserData]);

  return (
    <div>
      {loading ? (
        <Box sx={{ position: 'fixed', top: 0, right: 0, p: 1, zIndex: 9999 }}>
          <CircularProgress size={24} color="primary" />
        </Box>
      ) : null}
      <Header 
        auth={isAuthenticated} 
        handleLogout={logout} 
        user={user} 
      />
      <Box component="main" sx={{ paddingTop: 8 }}>
        {children}
      </Box>
      <Footer />
    </div>
  );
};

export default Layout;