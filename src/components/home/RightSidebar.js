import React from 'react';
import { Grid, Stack } from '@mui/material';
import PVRanking from '../ranking/PVRanking';
import Announcements from './Announcements';

const RightSidebar = ({ announcements, loading }) => (
  <Grid item xs={12} md={3} lg={2.5}>
    <Stack spacing={3}>
      <Announcements announcements={announcements} loading={loading} />
      <PVRanking />
    </Stack>
  </Grid>
);

export default React.memo(RightSidebar);