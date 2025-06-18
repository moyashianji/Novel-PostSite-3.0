// src/components/user/StatsPanel.js
import React from 'react';
import {
  Typography, Box, Grid, Chip, Paper, useTheme
} from '@mui/material';
import { alpha, styled } from '@mui/system';

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  position: 'relative',
  display: 'inline-block',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -4,
    left: 0,
    width: 40,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2
  }
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.background.paper, 0.7),
  minWidth: 80
}));

const StatsPanel = ({ workStats, followerCount, works, allTags }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
          <SectionTitle variant="h6">
            作品統計
          </SectionTitle>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {workStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    総作品数
                  </Typography>
                </StatsBox>
              </Grid>
              <Grid item xs={6}>
                <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {workStats.series}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    シリーズ数
                  </Typography>
                </StatsBox>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
          <SectionTitle variant="h6">
            インタラクション統計
          </SectionTitle>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {workStats.totalViews.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    総閲覧数
                  </Typography>
                </StatsBox>
              </Grid>
              <Grid item xs={6}>
                <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {workStats.totalLikes.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    総いいね数
                  </Typography>
                </StatsBox>
              </Grid>
              <Grid item xs={6}>
                <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {followerCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    フォロワー数
                  </Typography>
                </StatsBox>
              </Grid>
              <Grid item xs={6}>
                <StatsBox sx={{ p: 2, mb: 2, width: '100%' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {works.length > 0 ? Math.round(workStats.totalViews / works.length) : 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    作品平均閲覧数
                  </Typography>
                </StatsBox>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
          <SectionTitle variant="h6">
            タグの傾向
          </SectionTitle>
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {allTags.map(tag => {
              const count = works.filter(work => work.tags?.includes(tag)).length;
              const percentage = Math.round((count / works.length) * 100);
              
              return (
                <Chip
                  key={tag}
                  label={`${tag} (${count})`}
                  sx={{
                    fontSize: `${Math.max(0.8, Math.min(1.2, 0.8 + percentage / 100))}rem`,
                    fontWeight: percentage > 30 ? 'bold' : 'normal',
                    backgroundColor: alpha(theme.palette.primary.main, percentage / 200)
                  }}
                />
              );
            })}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StatsPanel;