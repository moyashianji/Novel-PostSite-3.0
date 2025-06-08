import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import SeriesCard from './SeriesCard';

const SeriesCarousel = ({ series }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleWheelScroll = (event) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        container.scrollLeft += event.deltaY;

        if (event.deltaY !== 0) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    const container = scrollContainerRef.current;
    container.addEventListener('wheel', handleWheelScroll);

    return () => {
      container.removeEventListener('wheel', handleWheelScroll);
    };
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>シリーズ一覧</Typography>
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          paddingBottom: '10px',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
          },
        }}
      >
        {series.map((s) => (
          <SeriesCard key={s._id} series={s} />
        ))}
      </Box>
    </Box>
  );
};

export default SeriesCarousel;
