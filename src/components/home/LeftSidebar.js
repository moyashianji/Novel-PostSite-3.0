import React from 'react';
import { Grid, Stack } from '@mui/material';
import PopularTags from '../ranking/PopularTags';
import UpcomingContestsCard from './UpcomingContestsCard';

const LeftSidebar = ({ contests, loading, navigate }) => {
  const handleViewContest = (id) => {
    navigate(`/contests/${id}`);
  };

  return (
    <Grid item xs={12} md={3} lg={2.5}>
      <Stack spacing={3}>
        <PopularTags />
        <UpcomingContestsCard 
          contests={contests} 
          handleViewContest={handleViewContest} 
          loading={loading} 
          navigate={navigate}
        />
      </Stack>
    </Grid>
  );
};

export default React.memo(LeftSidebar);