import React, { useState, useEffect } from 'react';
import { AutoStories as AutoStoriesIcon } from '@mui/icons-material';
import SeriesGridSection from './SeriesGridSection';

const NewSeriesSection = ({ navigate }) => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewSeries = async () => {
      setLoading(true);
      try {
        // Fetch series with at least one post
        const response = await fetch('/api/search?type=series&size=10&sort=createdAt');
        const data = await response.json();
        
        // Filter series that have at least one post
        const seriesWithPosts = data.results.filter(series => 
          series.posts && series.posts.length > 0
        );
        
        setSeries(seriesWithPosts.slice(0, 8)); // Limit to 4 items for 2x2 grid
      } catch (error) {
        console.error('Error fetching new series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewSeries();
  }, []);

  return (
    <SeriesGridSection 
      title="新シリーズ"
      series={series}
      loading={loading}
      navigate={navigate}
      icon={AutoStoriesIcon}
      color="primary"
      viewAllPath="/search?type=series&sort=createdAt"
      emptyMessage="新着シリーズはありません。"
    />
  );
};

export default React.memo(NewSeriesSection);