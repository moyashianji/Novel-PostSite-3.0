import React from 'react';
import { 
  Grid, 
  Box, 
  CircularProgress, 
  Alert, 
  Paper, 
  Typography 
} from '@mui/material';
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import PostCard from "../../post/PostCard";
import SeriesCard from "../../series/SeriesCard";
import UserCard from "../../user/UserCard";

const SearchResultsContent = ({ 
  loading,
  error,
  paginatedData,
  fetchingMore,
  tab,
  ageFilter,
  totalCount,
  followedUsers,
  onFollowToggle
}) => {
  if (loading && !paginatedData.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // 検索結果がない場合
  if (totalCount === 0 && !loading) {
    return (
      <Paper sx={{ p: 3, my: 2, textAlign: 'center' }}>
        <InfoOutlinedIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
        <Typography variant="h6" color="textSecondary">
          検索結果が見つかりませんでした
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {ageFilter !== 'all' 
            ? '別の年齢制限フィルターを試してみてください' 
            : '別のキーワードで試してみてください'}
        </Typography>
      </Paper>
    );
  }

  if (tab === "posts") {
    return (
      <Grid container spacing={3}>
        {paginatedData.map((post) => (
          <Grid item xs={12} sm={6} md={4} key={post._id}>
            <PostCard post={post} />
          </Grid>
        ))}
        {fetchingMore && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          </Grid>
        )}
      </Grid>
    );
  } else if (tab === "series") {
    return (
      <Grid container spacing={3}>
        {paginatedData.map((series) => (
          <Grid item xs={12} sm={6} md={4} key={series._id}>
            <SeriesCard series={series} />
          </Grid>
        ))}
        {fetchingMore && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          </Grid>
        )}
      </Grid>
    );
  } else { // ユーザータブ
    return (
      <Grid container spacing={3}>
        {paginatedData.map((user) => (
          <Grid item xs={12} key={user._id}>
            <UserCard 
              user={user}
              isFollowing={followedUsers.has(user._id)}
              onFollowToggle={onFollowToggle}
              showFollowButton={true}
              showWorks={Boolean(user.recentWorks?.length)}
            />
          </Grid>
        ))}
        {fetchingMore && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          </Grid>
        )}
      </Grid>
    );
  }
};

export default SearchResultsContent;