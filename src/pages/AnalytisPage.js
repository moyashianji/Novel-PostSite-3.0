import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { Box, Typography, CircularProgress } from '@mui/material';

const AnalyticsPage = () => {
  const { id } = useParams(); // URLパラメータから作品IDを取得
  const [analyticsData, setAnalyticsData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [xAxisRange, setXAxisRange] = useState(null); // 表示範囲の管理
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/${id}/analytics`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();

        if (data.length === 1) {
          const firstTimestamp = new Date(data[0].timestamp);
          const fiveMinutesBefore = new Date(firstTimestamp.getTime() - 5 * 60 * 1000);
          const zeroPoint = {
            timestamp: fiveMinutesBefore.toISOString(),
            count: 0,
          };
          const fullData = [zeroPoint, ...data];
          setAnalyticsData(fullData);

          // デフォルトの拡大範囲を最初の10分間に設定
          const min = new Date(zeroPoint.timestamp).getTime();
          const max = new Date(data[0].timestamp).getTime() + 5 * 60 * 1000;
          setXAxisRange({ min, max });
          setVisibleData(fullData.filter((entry) => entry.timestamp >= min && entry.timestamp <= max));
        } else {
          setAnalyticsData(data);

          // デフォルトの拡大範囲を最初の30分間に設定
          const min = new Date(data[0].timestamp).getTime();
          const max = min + 30 * 60 * 1000; // 30分間
          setXAxisRange({ min, max });
          setVisibleData(data.filter((entry) => new Date(entry.timestamp).getTime() >= min && new Date(entry.timestamp).getTime() <= max));
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [id]);

  const handleZoomOrPan = (chartContext, { xaxis }) => {
    const { min, max } = xaxis;

    const filteredData = analyticsData.filter(
      (entry) => new Date(entry.timestamp).getTime() >= min && new Date(entry.timestamp).getTime() <= max
    );

    setVisibleData(filteredData);
    setXAxisRange({ min, max });
  };

  const chartData = {
    series: [
      {
        name: 'Views',
        data: visibleData.map((entry) => ({
          x: new Date(entry.timestamp).toLocaleString(),
          y: entry.count,
        })),
      },
    ],
  };

  const chartOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: true,
        tools: {
          download: true,
          zoom: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      },
      events: {
        selection: handleZoomOrPan,
        zoomed: handleZoomOrPan,
        scrolled: handleZoomOrPan,
      },
    },
    xaxis: {
      type: 'datetime',
      title: { text: 'Time (5-minute intervals)' },
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
      min: xAxisRange?.min, // 初期の最小値
      max: xAxisRange?.max, // 初期の最大値
    },
    yaxis: {
      title: { text: 'View Count' },
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 'bold',
        },
      },
    },
    stroke: {
      curve: 'smooth',
    },
    markers: {
      size: 5,
    },
    tooltip: {
      x: {
        format: 'yyyy-MM-dd HH:mm:ss',
      },
    },
    grid: {
      borderColor: '#f1f1f1',
    },
    legend: {
      show: true,
      position: 'top',
    },
    dataLabels: {
      enabled: false,
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Analytics for Post ID: {id}
      </Typography>
      {analyticsData.length > 0 ? (
        <Chart options={chartOptions} series={chartData.series} type="line" height={400} />
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
          No analytics data available.
        </Typography>
      )}
    </Box>
  );
};

export default AnalyticsPage;
