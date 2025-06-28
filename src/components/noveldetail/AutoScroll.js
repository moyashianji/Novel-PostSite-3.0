// AutoScroll.js
import React, { useRef, useState } from 'react';
import { Box, Button, TextField, Slider, Typography, Paper, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SpeedIcon from '@mui/icons-material/Speed';

const ScrollContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.4)'
    : theme.shadows[1],
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(to right, ${theme.palette.background.default}, ${theme.palette.background.paper})`
    : 'linear-gradient(to right, #f8f9fa, #ffffff)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 30px rgba(0, 0, 0, 0.5)'
      : '0 8px 25px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  }
}));

const ScrollControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const SpeedControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginTop: theme.spacing(2),
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  '& .MuiSlider-track': {
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
      : `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  },
  '& .MuiSlider-thumb': {
    backgroundColor: theme.palette.primary.main,
    border: theme.palette.mode === 'dark'
      ? `2px solid ${theme.palette.background.paper}`
      : '2px solid #fff',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 8px rgba(0, 0, 0, 0.4)'
      : '0 2px 6px rgba(0, 0, 0, 0.2)',
    '&:hover': {
      boxShadow: theme.palette.mode === 'dark'
        ? '0 6px 12px rgba(0, 0, 0, 0.5)'
        : '0 4px 10px rgba(0, 0, 0, 0.3)',
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: theme.palette.mode === 'dark'
      ? theme.palette.action.disabled
      : theme.palette.grey[300],
  },
  '& .MuiSlider-valueLabel': {
    backgroundColor: theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.grey[700],
    color: theme.palette.mode === 'dark'
      ? theme.palette.text.primary
      : theme.palette.common.white,
    '&:before': {
      borderTopColor: theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.grey[700],
    },
  },
}));

const ActionButton = styled(Button)(({ theme, variant }) => ({
  flex: 1,
  borderRadius: 25,
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  boxShadow: variant === 'contained'
    ? theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.4)'
      : '0 4px 12px rgba(0, 0, 0, 0.15)'
    : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained'
      ? theme.palette.mode === 'dark'
        ? '0 6px 16px rgba(0, 0, 0, 0.5)'
        : '0 6px 16px rgba(0, 0, 0, 0.2)'
      : theme.palette.mode === 'dark'
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  '&:disabled': {
    transform: 'none',
    boxShadow: 'none',
    opacity: 0.6,
  },
}));

const AutoScroll = ({ scrollSpeed, setScrollSpeed }) => {
  const scrollIntervalRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const theme = useTheme();
  const minSpeed = 1;
  const maxSpeed = 100;
  const API_URL = process.env.REACT_APP_API_URL;

  // 速度の表示を反転させる（値が小さいほど速くなるため）
  const displaySpeed = maxSpeed - scrollSpeed + minSpeed;

  const handleScroll = () => {
    // スクロールを開始
    handleStopScroll(); // 既存のインターバルをクリア
    
    scrollIntervalRef.current = setInterval(() => {
      window.scrollBy(0, 1); // 1ピクセルずつ下にスクロール
    }, scrollSpeed);
    
    setIsScrolling(true);
  };

  const handleStopScroll = () => {
    // スクロールを停止
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setIsScrolling(false);
  };

  const handleSpeedChange = (event, newValue) => {
    // スライダーの値を反転して設定（大きい値ほど遅くなる）
    setScrollSpeed(maxSpeed - newValue + minSpeed);
  };

  React.useEffect(() => {
    const handleStopOnInteraction = () => {
      handleStopScroll(); // キーボードやマウスの操作があったらスクロール停止
    };

    window.addEventListener('keydown', handleStopOnInteraction);
    window.addEventListener('mousedown', handleStopOnInteraction);
    window.addEventListener('touchstart', handleStopOnInteraction);

    return () => {
      window.removeEventListener('keydown', handleStopOnInteraction);
      window.removeEventListener('mousedown', handleStopOnInteraction);
      window.removeEventListener('touchstart', handleStopOnInteraction);
      handleStopScroll(); // クリーンアップ時にスクロールを停止
    };
  }, []);

  return (
    <ScrollContainer>
      <Typography 
        variant="h6" 
        gutterBottom 
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        <SpeedIcon sx={{ marginRight: 1, color: 'primary.main' }} />
        自動スクロール
      </Typography>
      
      <SpeedControls>
        <Box sx={{ width: '100%', mr: 2 }}>
          <Typography 
            id="speed-slider" 
            gutterBottom 
            variant="body2" 
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            スクロール速度
          </Typography>
          <StyledSlider
            aria-labelledby="speed-slider"
            value={displaySpeed}
            min={minSpeed}
            max={maxSpeed}
            onChange={handleSpeedChange}
            valueLabelDisplay="auto"
            valueLabelFormat={(x) => `${Math.round((x / maxSpeed) * 100)}%`}
            color="primary"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              ゆっくり
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              速い
            </Typography>
          </Box>
        </Box>
      </SpeedControls>
      
      <ScrollControls sx={{ mt: 2 }}>
        <ActionButton
          variant={isScrolling ? "outlined" : "contained"}
          color="primary"
          onClick={handleScroll}
          disabled={isScrolling}
          startIcon={<PlayArrowIcon />}
        >
          スクロール開始
        </ActionButton>
        
        <ActionButton
          variant={isScrolling ? "contained" : "outlined"}
          color="secondary"
          onClick={handleStopScroll}
          disabled={!isScrolling}
          startIcon={<StopIcon />}
        >
          スクロール停止
        </ActionButton>
      </ScrollControls>
    </ScrollContainer>
  );
};

export default AutoScroll;