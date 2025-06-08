// src/components/total/TotalSeriesList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  EmojiEvents as EmojiEventsIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Book as BookIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Autorenew as AutorenewIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import SeriesCard from '../series/SeriesCard';

// スタイル付きコンポーネント
const RankBadge = styled(Box)(({ theme, rank }) => {
  const getColorByRank = () => {
    switch (rank) {
      case 1: return { bg: 'linear-gradient(45deg, #FFD700, #FFA000)', color: '#7D2C00' };
      case 2: return { bg: 'linear-gradient(45deg, #E0E0E0, #BDBDBD)', color: '#424242' };
      case 3: return { bg: 'linear-gradient(45deg, #CD7F32, #A1672A)', color: '#5D3200' };
      default: return { bg: theme.palette.background.paper, color: theme.palette.text.primary };
    }
  };
  
  const { bg, color } = getColorByRank();
  
  return {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    color: color,
    fontWeight: 'bold',
    fontSize: rank <= 3 ? '1.25rem' : '1rem',
    boxShadow: rank <= 3 ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
  };
});

const TotalInfoCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(to right, #fcfcfc, #f0f8ff)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const ScoreChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  height: '36px',
  backgroundColor: theme.palette.secondary.light,
  color: theme.palette.secondary.contrastText,
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: 'inherit',
  }
}));

const MetricChip = styled(Chip)(({ theme, color = 'primary' }) => ({
  borderRadius: '4px',
  height: '32px',
  marginRight: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  '& .MuiChip-icon': {
    fontSize: '0.875rem',
  }
}));

const TotalSeriesListItem = ({ series, rank }) => {
  const theme = useTheme();
  
  if (!series) return null;
  
  const {
    score,
    metrics,
    episodeCount,
    followerCount,
    isCompleted
  } = series;
  
  return (
    <Box sx={{ mb: 3 }}>
      <TotalInfoCard>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RankBadge rank={rank}>
              {rank <= 3 ? (
                <EmojiEventsIcon fontSize="small" />
              ) : (
                rank
              )}
            </RankBadge>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="人気スコア" placement="top">
                <ScoreChip
                  icon={<StarsIcon />}
                  label={`${score.toFixed(2)} pts`}
                  size="small"
                />
              </Tooltip>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, ml: 1 }}>
                <Tooltip title={`エピソード数: ${episodeCount}話`}>
                  <MetricChip
                    icon={<BookIcon fontSize="small" />}
                    label={`${episodeCount}話`}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                </Tooltip>
                
                <Tooltip title={`フォロワー数: ${followerCount}人`}>
                  <MetricChip
                    icon={<PeopleIcon fontSize="small" />}
                    label={`${followerCount}人`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Tooltip>
                
                {metrics?.followerScore > 0 && (
                  <Tooltip title={`フォロワースコア: ${Math.round(metrics.followerScore)}ポイント`}>
                    <MetricChip
                      icon={<PeopleIcon fontSize="small" />}
                      label={Math.round(metrics.followerScore)}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                
                {metrics?.episodeScore > 0 && (
                  <Tooltip title={`エピソードスコア: ${Math.round(metrics.episodeScore)}ポイント`}>
                    <MetricChip
                      icon={<AssessmentIcon fontSize="small" />}
                      label={Math.round(metrics.episodeScore)}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                
                {/* 完結状態チップ */}
                {isCompleted ? (
                  <Chip
                    icon={<CheckCircleOutlineIcon fontSize="small" />}
                    label="完結済"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    icon={<AutorenewIcon fontSize="small" />}
                    label="連載中"
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </TotalInfoCard>
      
      {/* シリーズカードを表示 */}
      <SeriesCard series={series} />
    </Box>
  );
};

// メインのリストコンポーネント
const TotalSeriesList = ({ totalSeries }) => {
  if (!totalSeries || totalSeries.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          ランキングデータがありません
        </Typography>
        <Typography variant="body2" color="text.secondary">
          しばらく経ってからもう一度確認してください。
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      {totalSeries.map((series) => (
        <TotalSeriesListItem
          key={series._id}
          series={series}
          rank={series.rank}
        />
      ))}
    </Box>
  );
};

export default TotalSeriesList;