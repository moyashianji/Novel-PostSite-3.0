// src/components/layout/header/RankingButton.js
import React from 'react';
import { Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// デスクトップ用のランキングボタン
const DesktopRankingButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  borderRadius: 50,
  padding: theme.spacing(1, 2.5),
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: theme.palette.common.white,
  fontWeight: 'bold',
  marginLeft: theme.spacing(1.5),
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
  },
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(0.75),
  }
}));

// モバイル用のランキングボタン（アイコンのみ）
const MobileRankingButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginLeft: theme.spacing(1),
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
}));

const RankingButton = ({ isMobile = false }) => {
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile || isMobileScreen) {
    return (
      <MobileRankingButton
        component={Link}
        to="/trending"
        aria-label="急上昇ランキング"
      >
        <TrendingUpIcon />
      </MobileRankingButton>
    );
  }

  return (
    <DesktopRankingButton
      startIcon={<TrendingUpIcon />}
      component={Link}
      to="/trending"
    >
      急上昇
    </DesktopRankingButton>
  );
};

export default RankingButton;