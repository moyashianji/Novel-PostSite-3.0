// src/components/user/SeriesPanel.js
import React from 'react';
import { Grid, Alert } from '@mui/material';
import SeriesCard from '../series/SeriesCard';

const SeriesPanel = ({ series }) => {
  return (
    <>
      {series.length === 0 ? (
        <Alert severity="info">
          このユーザーはまだシリーズを作成していません。
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {series.map((seriesItem) => (
            <Grid item xs={12} sm={6} key={seriesItem._id}>
              <SeriesCard series={seriesItem} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default SeriesPanel;