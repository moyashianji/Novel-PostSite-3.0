// src/components/trending/TrendingSeriesList.js
import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Book as BookIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Autorenew as AutorenewIcon,
} from '@mui/icons-material';
import SeriesCard from '../series/SeriesCard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// スタイル付きコンポーネント（TrendingPostListと同じ）
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

const TrendingInfoCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const ScoreChip = styled(Chip)(({ theme }) => ({
  borderRadius: '4px',
  height: '36px',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  fontWeight: 'bold',
  '& .MuiChip-icon': {
    color: 'inherit',
  }
}));

const TrendingSeriesListItem = ({ series, rank, period }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (!series) return null;
  
  const {
    score,
    periodScores,
    episodeCount,
    isCompleted
  } = series;
  
  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return '24時間';
      case 'week': return '週間';
      case 'month': return '月間';
      case 'year': return '年間';
      case 'cumulative': return '累計';
      default: return '24時間';
    }
  };
  
  // フォロワー増加数を表示用に計算
  const getFollowerChangeText = () => {
    if (period === 'cumulative') return null;
    const change = periodScores?.followerIncrease || 0;
    return change > 0 ? `+${change}` : '0';
  };
  
  const followerChange = getFollowerChangeText();
  
  return (
    <Box sx={{ mb: 3 }}>
      <TrendingInfoCard>
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RankBadge rank={rank}>
              {rank <= 3 ? (
                <EmojiEventsIcon fontSize="small" />
              ) : (
                rank
              )}
            </RankBadge>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Tooltip title="急上昇スコア" placement="top">
                <ScoreChip
                  icon={<AssessmentIcon />}
                  label={`${score?.toFixed(1) || '0'} pts`}
                  size="small"
                />
              </Tooltip>
              
              <Tooltip title={`${getPeriodLabel()}間の順位`}>
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`#${rank}`}
                  size="small"
                  color="primary"
                  variant={rank <= 3 ? "filled" : "outlined"}
                />
              </Tooltip>
              
              <Tooltip title={`エピソード数: ${episodeCount}話`}>
                <Chip
                  icon={<BookIcon />}
                  label={`${episodeCount}話`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Tooltip>

              {periodScores?.episodeAverageScore > 0 && (
                <Tooltip title={`エピソード平均スコア`}>
                  <Chip
                    icon={<AutoAwesomeIcon fontSize="small" />}
                    label={`平均${periodScores.episodeAverageScore.toFixed(1)}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Tooltip>
              )}

              {followerChange && (
                <Tooltip title={`${getPeriodLabel()}間のフォロワー増加数`}>
                  <Chip
                    icon={<PeopleIcon fontSize="small" />}
                    label={followerChange}
                    size="small"
                    color="success"
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
        </CardContent>
      </TrendingInfoCard>
      
      {/* シリーズカードを表示 */}
      <SeriesCard series={series} />
    </Box>
  );
};

// メインのリストコンポーネント
const TrendingSeriesList = ({ trendingSeries, period }) => {
  if (!trendingSeries || trendingSeries.length === 0) {
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
      {trendingSeries.map((series) => (
        <TrendingSeriesListItem
          key={series._id}
          series={series}
          rank={series.rank}
          period={period}
        />
      ))}
    </Box>
  );
};

export default TrendingSeriesList;