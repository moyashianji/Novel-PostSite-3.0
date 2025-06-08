import React from 'react';
import { 
  Grid, 
  Paper, 
  Box, 
  Typography, 
  Chip, 
  Pagination, 
  Stack 
} from '@mui/material';
import { 
  NewReleases as NewReleasesIcon 
} from '@mui/icons-material';
import PostCard from '../post/PostCard';
import Contests from './Contests';
import TagContainers from './TagContainers';
import NewPostsSkeleton from './Skeletons/NewPostsSkeleton';
import NewSeriesSection from './NewSeriesSection';
import UpdatedSeriesSection from './UpdatedSeriesSection';

const MainContent = ({
  posts,
  totalPages,
  currentPage,
  handleChangePage,
  contests,
  tagContainers,
  handleAddTagContainer,
  handleDeleteTagContainer,
  handleTagSubmit,
  handleTagPageChange,
  handleTextChange,
  text,
  auth,
  navigate,
  loading
}) => {
  return (
    <Grid item xs={12} md={6} lg={7}>
      <Stack spacing={4}>
        {/* コンテストセクション */}
        <Contests 
          contests={contests} 
          handleViewContest={(id) => navigate(`/contests/${id}`)} 
          navigate={navigate} 
          loading={loading} 
        />
        
        {/* 新着作品セクション */}
        <Paper 
          elevation={2} 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NewReleasesIcon sx={{ mr: 1.5 }} />
              <Typography variant="h5" fontWeight="bold">
                新着作品
              </Typography>
            </Box>

          </Box>
          
          <Box sx={{ p: 3 }}>
            {loading ? (
              <NewPostsSkeleton />
            ) : (
              posts.length > 0 ? (
                <Grid container spacing={2}>
                  {posts.map(post => (
                    <Grid item xs={12} sm={6} key={post._id}>
                      <PostCard post={post} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 5, 
                    bgcolor: 'rgba(0,0,0,0.02)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1">まだ投稿がありません。</Typography>
                </Box>
              )
            )}
            
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 'bold',
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* 新シリーズセクション */}
        <NewSeriesSection navigate={navigate} />
        
        {/* 更新されたシリーズセクション */}
        <UpdatedSeriesSection navigate={navigate} />
        
        {/* タグコンテナセクション */}
        <TagContainers
          tagContainers={tagContainers}
          handleDeleteTagContainer={handleDeleteTagContainer}
          handleTagSubmit={handleTagSubmit}
          handleTagPageChange={handleTagPageChange}
          handleTextChange={handleTextChange}
          handleAddTagContainer={handleAddTagContainer}
          text={text}
          auth={auth}
          navigate={navigate}
          loading={loading}
        />
      </Stack>
    </Grid>
  );
};

export default React.memo(MainContent);