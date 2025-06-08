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
  boxShadow: theme.shadows[1],
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: 'linear-gradient(to right, #f8f9fa, #ffffff)',
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
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SpeedIcon sx={{ marginRight: 1 }} />
        自動スクロール
      </Typography>
      
      <SpeedControls>
        <Box sx={{ width: '100%', mr: 2 }}>
          <Typography id="speed-slider" gutterBottom variant="body2" color="textSecondary">
            スクロール速度
          </Typography>
          <Slider
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
            <Typography variant="caption" color="textSecondary">ゆっくり</Typography>
            <Typography variant="caption" color="textSecondary">速い</Typography>
          </Box>
        </Box>
      </SpeedControls>
      
      <ScrollControls sx={{ mt: 2 }}>
        <Button
          variant={isScrolling ? "outlined" : "contained"}
          color="primary"
          onClick={handleScroll}
          disabled={isScrolling}
          startIcon={<PlayArrowIcon />}
          sx={{ flex: 1 }}
        >
          スクロール開始
        </Button>
        
        <Button
          variant={isScrolling ? "contained" : "outlined"}
          color="secondary"
          onClick={handleStopScroll}
          disabled={!isScrolling}
          startIcon={<StopIcon />}
          sx={{ flex: 1 }}
        >
          スクロール停止
        </Button>
      </ScrollControls>
    </ScrollContainer>
  );
};

export default AutoScroll;