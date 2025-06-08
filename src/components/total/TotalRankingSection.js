// src/components/total/TotalRankingSection.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container, 
  Divider,
  Pagination,
  CircularProgress,
  Paper,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Stars as StarsIcon,
  MenuBook as MenuBookIcon,
  Collections as CollectionsIcon
} from '@mui/icons-material';
import TotalPostList from './TotalPostList';
import TotalSeriesList from './TotalSeriesList';

// スタイル付きコンポーネント
const SectionWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  overflow: 'hidden',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '60px',
    height: '4px',
    backgroundColor: theme.palette.secondary.main,
    borderRadius: '2px',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 600,
  },
}));

const PaginationWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(4),
}));

const TotalRankingSection = () => {
  const [tabValue, setTabValue] = useState(0);
  const [postData, setPostData] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postPage, setPostPage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
  const [postPages, setPostPages] = useState(1);
  const [seriesPages, setSeriesPages] = useState(1);
  
  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // 作品のページネーション
  const handlePostPageChange = (event, value) => {
    setPostPage(value);
  };
  
  // シリーズのページネーション
  const handleSeriesPageChange = (event, value) => {
    setSeriesPage(value);
  };
  
  // 作品の総合ランキングを取得
  const fetchPostRanking = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/total/posts?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }
      
      const data = await response.json();
      setPostData(data.posts);
      setPostPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching post ranking:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // シリーズの総合ランキングを取得
  const fetchSeriesRanking = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/total/series?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('ランキングの取得に失敗しました');
      }
      
      const data = await response.json();
      setSeriesData(data.series);
      setSeriesPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching series ranking:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // タブ変更時のデータ取得
  useEffect(() => {
    if (tabValue === 0) {
      fetchPostRanking(postPage);
    } else {
      fetchSeriesRanking(seriesPage);
    }
  }, [tabValue]);
  
  // 作品ページ変更時のデータ取得
  useEffect(() => {
    if (tabValue === 0) {
      fetchPostRanking(postPage);
    }
  }, [postPage]);
  
  // シリーズページ変更時のデータ取得
  useEffect(() => {
    if (tabValue === 1) {
      fetchSeriesRanking(seriesPage);
    }
  }, [seriesPage]);
  
  return (
    <SectionWrapper>
      <SectionTitle variant="h4" gutterBottom>
        <StarsIcon sx={{ mr: 1, color: 'secondary.main' }} />
        総合ランキング
      </SectionTitle>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        ユニークユーザー数、コメント数、本棚追加数、いいね数を元に算出した総合的な評価ポイントによるランキングです。
        シリーズの場合は、含まれている作品の評価ポイント平均とシリーズフォロワー数をもとに評価されます。
      </Typography>
      
      <StyledTabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="secondary"
        indicatorColor="secondary"
      >
        <Tab 
          icon={<MenuBookIcon />} 
          label="作品" 
          iconPosition="start"
          sx={{ flexDirection: 'row' }}
        />
        <Tab 
          icon={<CollectionsIcon />} 
          label="シリーズ" 
          iconPosition="start"
          sx={{ flexDirection: 'row' }}
        />
      </StyledTabs>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Box>
          {tabValue === 0 ? (
            <>
              <TotalPostList totalPosts={postData} />
              
              {postPages > 1 && (
                <PaginationWrapper>
                  <Pagination 
                    count={postPages}
                    page={postPage}
                    onChange={handlePostPageChange}
                    color="secondary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </PaginationWrapper>
              )}
            </>
          ) : (
            <>
              <TotalSeriesList totalSeries={seriesData} />
              
              {seriesPages > 1 && (
                <PaginationWrapper>
                  <Pagination 
                    count={seriesPages}
                    page={seriesPage}
                    onChange={handleSeriesPageChange}
                    color="secondary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </PaginationWrapper>
              )}
            </>
          )}
        </Box>
      )}
    </SectionWrapper>
  );
};

export default TotalRankingSection;