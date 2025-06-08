import React, { useState, useEffect } from 'react';
import { Update as UpdateIcon } from '@mui/icons-material';
import SeriesGridSection from './SeriesGridSection';

const UpdatedSeriesSection = ({ navigate }) => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdatedSeries = async () => {
      setLoading(true);
      try {
        // Fetch series sorted by updatedAt date
        const response = await fetch('/api/search?type=series&size=10&sort=updatedAt');
        const data = await response.json();
        
        // Filter series that have at least one post
        const seriesWithPosts = data.results.filter(series => 
          series.posts && series.posts.length > 0
        );
        
        setSeries(seriesWithPosts.slice(0, 8)); // Limit to 4 items for 2x2 grid
      } catch (error) {
        console.error('Error fetching updated series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdatedSeries();
  }, []);

  return (
    <SeriesGridSection 
      title="更新されたシリーズ"
      series={series}
      loading={loading}
      navigate={navigate}
      icon={UpdateIcon}
      color="primary"
      viewAllPath="/search?type=series&sort=updatedAt"
      emptyMessage="最近更新されたシリーズはありません。"
    />
  );
};

export default React.memo(UpdatedSeriesSection);