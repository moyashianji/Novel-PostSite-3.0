// src/context/ThemeContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

// 軽量化：テーマプリセットを簡素化
const themePresets = {
  classic: {
    name: 'クラシック',
    light: { primary: '#1976d2', secondary: '#f50057', bg: '#fafafa', paper: '#ffffff', text: '#212121', textSec: '#757575', div: 'rgba(0,0,0,0.12)' },
    dark: { primary: '#90caf9', secondary: '#f48fb1', bg: '#121212', paper: '#1e1e1e', text: '#ffffff', textSec: '#b0b0b0', div: 'rgba(255,255,255,0.12)' }
  },
  warm: {
    name: '温かな読書',
    light: { primary: '#d84315', secondary: '#8d6e63', bg: '#fdf6e3', paper: '#fffef7', text: '#3e2723', textSec: '#6d4c41', div: '#e8d5b7' },
    dark: { primary: '#ff8a65', secondary: '#a1887f', bg: '#2e1a0f', paper: '#3c2415', text: '#f5deb3', textSec: '#ddb892', div: '#4a2c1a' }
  },
  forest: {
    name: '森林',
    light: { primary: '#2e7d32', secondary: '#558b2f', bg: '#f1f8e9', paper: '#ffffff', text: '#1b5e20', textSec: '#388e3c', div: '#c8e6c9' },
    dark: { primary: '#4caf50', secondary: '#8bc34a', bg: '#0d1b0f', paper: '#1a2c1a', text: '#e8f5e8', textSec: '#c8e6c9', div: '#2e5d31' }
  },
  midnight: {
    name: '夜空',
    light: { primary: '#3f51b5', secondary: '#9c27b0', bg: '#f8f9ff', paper: '#ffffff', text: '#1a237e', textSec: '#3949ab', div: '#e3f2fd' },
    dark: { primary: '#7986cb', secondary: '#ba68c8', bg: '#0a0e1a', paper: '#1a1f2e', text: '#e8eaf6', textSec: '#c5cae9', div: '#303f52' }
  },
  sakura: {
    name: '桜',
    light: { primary: '#e91e63', secondary: '#ff4081', bg: '#fce4ec', paper: '#ffffff', text: '#880e4f', textSec: '#ad1457', div: '#f8bbd9' },
    dark: { primary: '#f06292', secondary: '#ff80ab', bg: '#1a0d13', paper: '#2d1b20', text: '#fce4ec', textSec: '#f8bbd9', div: '#4a2c37' }
  }
};

export const CustomThemeProvider = ({ children }) => {
  // Hooksを無条件で呼び出し
  const { isAuthenticated, user } = useAuth();
  
  // デフォルト設定：ログインしていない場合は常にライトモード
  const [themeSettings, setThemeSettings] = useState({
    mode: 'light', // 'light' または 'dark' のみ
    preset: 'classic',
    fontSize: 16,
  });

  // ユーザーがログインした時に設定を読み込み
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadUserThemeSettings = async () => {
        try {
          const response = await fetch('/api/users/theme-settings', {
            credentials: 'include'
          });
          if (response.ok) {
            const userSettings = await response.json();
            setThemeSettings(userSettings || { mode: 'light', preset: 'classic', fontSize: 16 });
          }
        } catch (error) {
          console.error('Failed to load user theme settings:', error);
          setThemeSettings({ mode: 'light', preset: 'classic', fontSize: 16 });
        }
      };
      
      loadUserThemeSettings();
    } else {
      // ログインしていない場合は強制的にライトモード
      setThemeSettings({ mode: 'light', preset: 'classic', fontSize: 16 });
    }
  }, [isAuthenticated, user]);

  const actualMode = useMemo(() => {
    // ログインしていない場合は常にライトモード
    if (!isAuthenticated) {
      return 'light';
    }
    return themeSettings.mode;
  }, [themeSettings.mode, isAuthenticated]);

  // 軽量化：テーマ作成を最適化
  const theme = useMemo(() => {
    const preset = themePresets[themeSettings.preset]?.[actualMode] || themePresets.classic[actualMode];
    
    return createTheme({
      palette: {
        mode: actualMode,
        primary: { main: preset.primary },
        secondary: { main: preset.secondary },
        background: { default: preset.bg, paper: preset.paper },
        text: { primary: preset.text, secondary: preset.textSec },
        divider: preset.div,
      },
      typography: {
        fontSize: themeSettings.fontSize,
        fontFamily: '"Noto Sans JP",sans-serif',
      },
      shape: { borderRadius: 12 },
      components: {
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: actualMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${preset.div}`,
              transition: 'all 0.3s ease',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: { textTransform: 'none', borderRadius: 50, fontWeight: 600 },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundColor: preset.paper,
              color: preset.text,
              borderBottom: `1px solid ${preset.div}`,
              boxShadow: actualMode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            },
          },
        },
      },
    });
  }, [actualMode, themeSettings.preset, themeSettings.fontSize]);

  const updateThemeSettings = useCallback((newSettings) => {
    if (!isAuthenticated) {
      console.warn('Theme settings can only be changed when logged in');
      return;
    }
    
    setThemeSettings(prev => ({ ...prev, ...newSettings }));
  }, [isAuthenticated]);

  const contextValue = useMemo(() => ({
    themeSettings,
    actualMode,
    updateThemeSettings,
    themePresets,
    isAuthenticated,
  }), [themeSettings, actualMode, updateThemeSettings, isAuthenticated]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeSettings = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeSettings must be used within CustomThemeProvider');
  }
  return context;
};