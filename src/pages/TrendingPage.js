// src/pages/TrendingPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Pagination, 
  useTheme, 
  useMediaQuery,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  CalendarMonth as CalendarMonthIcon,
  CalendarToday as CalendarTodayIcon,
  ShowChart as ShowChartIcon,
  Stars as StarsIcon
} from '@mui/icons-material';
import TrendingPostList from '../components/trending/TrendingPostList';
import TrendingSeriesList from '../components/trending/TrendingSeriesList';
import TotalRankingSection from '../components/total/TotalRankingSection';
import FilterTabs from '../components/trending/FilterTabs';
import FilterSkeleton from '../components/trending/FilterSkeleton';

const periodTabs = [
  { value: 'day', label: '24時間', icon: <TodayIcon /> },
  { value: 'week', label: '週間', icon: <DateRangeIcon /> },
  { value: 'month', label: '月間', icon: <CalendarMonthIcon /> },
  { value: 'year', label: '年間', icon: <CalendarTodayIcon /> },
  { value: 'cumulative', label: '累計', icon: <ShowChartIcon /> },
];

const TrendingPage = () => {
  // 基本状態
  const [period, setPeriod] = useState('day');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20); // 取得件数を増加
  const [trendingData, setTrendingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState(0); // 0: 作品, 1: シリーズ
  const [rankingType, setRankingType] = useState(0); // 0: 急上昇, 1: 総合
  
  // フィルター状態
  const [ageFilter, setAgeFilter] = useState('all'); // すべて/全年齢/R18
  const [selectedContentType, setSelectedContentType] = useState('all'); // すべて/読み切り/連載作品
  const [seriesStatus, setSeriesStatus] = useState('all'); // すべて/連載中/完結済
  const [selectedGenre, setSelectedGenre] = useState('すべて');
  const [genres, setGenres] = useState(['すべて']);
  
  // 通知状態
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ジャンルリストの取得
  useEffect(() => {
    const getGenres = async () => {
      try {
        const response = await fetch('/api/trending/genres');
        if (!response.ok) {
          console.error('Error fetching genres: API response not OK');
          return;
        }
        
        const data = await response.json();
        
        if (data.genres && Array.isArray(data.genres) && data.genres.length > 0) {
          setGenres(data.genres);
        } else {
          // バックアッププラン - APIがデータを返さない場合のデフォルト値
          setGenres([
            'すべて', '異世界', '恋愛', 'ラブコメ', '歴史', '時代物', 'ローファンタジー',
            'ハイファンタジー', 'SF', 'ファンタジー', 'ミステリー', 'サスペンス', 'ホラー'
          ]);
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        // エラー時のデフォルト値
        setGenres([
          'すべて', '異世界', '恋愛', 'ラブコメ', '歴史', '時代物', 'ローファンタジー',
          'ハイファンタジー', 'SF', 'ファンタジー', 'ミステリー', 'サスペンス', 'ホラー'
        ]);
      }
    };
    
    getGenres();
  }, []);
  
  // トレンディングデータの取得
  const fetchTrendingData = useCallback(async (
    selectedPeriod = period, 
    selectedPage = page, 
    selectedType = contentType,
    selectedAgeFilter = ageFilter,
    selectedContentTypeFilter = selectedContentType,
    selectedSeriesStatus = seriesStatus,
    selectedGenreFilter = selectedGenre
  ) => {
    if (rankingType !== 0) return; // 急上昇ランキングの場合のみデータ取得
    
    setLoading(true);
    setError(null);
    
    try {
      let url;
      // 共通クエリパラメータ
      let queryParams = `page=${selectedPage}&limit=${limit}&genre=${encodeURIComponent(selectedGenreFilter)}&ageFilter=${selectedAgeFilter}`;
      
      if (selectedType === 0) {
        // 作品の場合
        queryParams += `&contentType=${selectedContentTypeFilter}`;
        
        if (selectedPeriod === 'cumulative') {
          url = `/api/trending/cumulative?${queryParams}`;
        } else {
          url = `/api/trending/${selectedPeriod}?${queryParams}`;
        }
      } else {
        // シリーズの場合 - 年齢制限も含む
        queryParams += `&status=${selectedSeriesStatus}`;
        url = `/api/trending/series/${selectedPeriod}?${queryParams}`;
      }
      
      console.log(`Fetching data from: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }
      
      const data = await response.json();
      setTrendingData(data);
      
      // 検索結果が0件の場合の通知
      if ((data.posts && data.posts.length === 0) || (data.series && data.series.length === 0)) {
        setNotification({
          open: true,
          message: '選択されたフィルター条件に一致する作品が見つかりませんでした。フィルター条件を変更してください。',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error fetching trending data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [period, page, contentType, rankingType, limit, ageFilter, selectedContentType, seriesStatus, selectedGenre]);
  
  // フィルター変更時のデータ再取得
  useEffect(() => {
    if (rankingType === 0) {
      fetchTrendingData(period, page, contentType, ageFilter, selectedContentType, seriesStatus, selectedGenre);
    }
  }, [period, page, contentType, fetchTrendingData, ageFilter, selectedContentType, seriesStatus, selectedGenre, rankingType]);
  
  // ランキングタイプ切り替え
  const handleRankingTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setRankingType(newValue);
      // 急上昇ランキングに切り替えた場合はデータを再取得
      if (newValue === 0) {
        fetchTrendingData();
      }
    }
  };
  
  // 期間切り替え
  const handlePeriodChange = (event, newPeriod) => {
    setPeriod(newPeriod);
    setPage(1);
  };
  
  // ページ切り替え
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // コンテンツタイプ（作品/シリーズ）切り替え
  const handleContentTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setContentType(newValue);
      setPage(1);
    }
  };
  
  // フィルター変更ハンドラー
  const handleAgeFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setAgeFilter(newValue);
      setPage(1);
      fetchTrendingData(period, 1, contentType, newValue, selectedContentType, seriesStatus, selectedGenre);
    }
  };

  const handleContentTypeFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedContentType(newValue);
      setPage(1);
      fetchTrendingData(period, 1, contentType, ageFilter, newValue, seriesStatus, selectedGenre);
    }
  };

  const handleSeriesStatusChange = (event, newValue) => {
    if (newValue !== null) {
      setSeriesStatus(newValue);
      setPage(1);
      fetchTrendingData(period, 1, contentType, ageFilter, selectedContentType, newValue, selectedGenre);
    }
  };

  const handleGenreChange = (event, newValue) => {
    if (newValue !== null) {
      setSelectedGenre(newValue);
      setPage(1);
      fetchTrendingData(period, 1, contentType, ageFilter, selectedContentType, seriesStatus, newValue);
    }
  };
  
  // 通知を閉じる
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  // 期間に応じた説明文を取得
  const getPeriodDescription = () => {
    const dataType = contentType === 0 ? '作品' : 'シリーズ';
    switch (period) {
      case 'day': return `過去24時間で最も人気が急上昇中の${dataType}`;
      case 'week': return `過去1週間で最も人気が急上昇中の${dataType}`;
      case 'month': return `過去1ヶ月で最も人気が急上昇中の${dataType}`;
      case 'year': return `過去1年で最も人気が急上昇中の${dataType}`;
      case 'cumulative': return `総合スコアによる累計${dataType}ランキング`;
      default: return `人気急上昇中の${dataType}をチェックしよう`;
    }
  };
  
  // ランキングタイプに応じた説明文
  const getRankingDescription = () => {
    if (rankingType === 0) {
      return getPeriodDescription();
    } else {
      return 'ユニークユーザー数、コメント数、本棚追加数、いいね数を元に算出した総合的な評価ポイントによるランキング';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 1
        }}>
          <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
          ランキング
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {getRankingDescription()}
        </Typography>
      </Box>
      
      {/* ランキングタイプ切り替えタブ */}
      <Paper elevation={2} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={rankingType}
          onChange={handleRankingTypeChange}
          variant="fullWidth"
          centered
          sx={{
            backgroundColor: theme.palette.background.paper,
            '& .MuiTab-root': {
              py: 2,
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              fontWeight: 'bold',
            },
          }}
        >
          <Tab 
            label="急上昇ランキング" 
            icon={<TrendingUpIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label="総合ランキング" 
            icon={<StarsIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>
      
      {rankingType === 0 ? (
        // 急上昇ランキング表示
        <>
          <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={period}
              onChange={handlePeriodChange}
              variant={isMobile ? "scrollable" : "fullWidth"}
              scrollButtons={isMobile ? "auto" : false}
              centered={!isMobile}
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  fontWeight: 'medium',
                },
              }}
            >
              {periodTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </Box>
          
          {/* 作品/シリーズ切り替えタブ */}
          <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={contentType}
              onChange={handleContentTypeChange}
              variant="fullWidth"
              centered
              sx={{
                '& .MuiTab-root': {
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  fontWeight: 'medium',
                },
              }}
            >
              <Tab label="作品" />
              <Tab label="シリーズ" />
            </Tabs>
          </Box>
          
          {/* フィルタータブ */}
          {loading && !trendingData ? (
            <FilterSkeleton />
          ) : (
            <FilterTabs
              contentType={contentType}
              ageFilter={ageFilter}
              selectedContentType={selectedContentType}
              seriesStatus={seriesStatus}
              selectedGenre={selectedGenre}
              genres={genres}
              onAgeFilterChange={handleAgeFilterChange}
              onContentTypeChange={handleContentTypeFilterChange}
              onSeriesStatusChange={handleSeriesStatusChange}
              onGenreChange={handleGenreChange}
            />
          )}
          
          {loading && !trendingData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="error" gutterBottom>
                {error}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                しばらく経ってからもう一度お試しください。
              </Typography>
            </Box>
          ) : contentType === 0 ? (
            // 作品ランキング表示
            <>
              <TrendingPostList trendingPosts={trendingData?.posts || []} period={period} />
              
              {trendingData && trendingData.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={trendingData.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            // シリーズランキング表示
            <>
              <TrendingSeriesList trendingSeries={trendingData?.series || []} period={period} />
              
              {trendingData && trendingData.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={trendingData.totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "small" : "medium"}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </>
      ) : (
        // 総合ランキング表示
        <TotalRankingSection />
      )}
      
      {/* 通知 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TrendingPage;