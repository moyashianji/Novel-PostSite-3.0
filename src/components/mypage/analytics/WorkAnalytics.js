// src/components/mypage/analytics/WorkAnalytics.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const WorkAnalytics = ({ postId, onClose }) => {
  const theme = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/me/works/${postId}/analytics?timeframe=${timeframe}&date=${selectedDate}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('アナリティクスの取得に失敗しました');
        }
        
        const data = await response.json();
        setAnalytics(data);
        
        if (data.hourlyData) {
          setHourlyData(data.hourlyData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchAnalytics();
    }
  }, [postId, timeframe, selectedDate]);

  const TimeframeButton = ({ value, label, current, onClick }) => (
    <Button
      variant={current === value ? "contained" : "outlined"}
      size="small"
      onClick={() => onClick(value)}
      sx={{
        minWidth: 60,
        borderRadius: 6,
        textTransform: 'none',
        fontWeight: current === value ? 'bold' : 'normal',
        bgcolor: current === value ? theme.palette.primary.main : 'transparent',
        color: current === value ? 'white' : theme.palette.primary.main,
        '&:hover': {
          bgcolor: current === value ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1)
        }
      }}
    >
      {label}
    </Button>
  );

  const getPeriodData = () => {
    if (!analytics || !analytics.timeSeriesData) return [];
    
    const data = analytics.timeSeriesData[timeframe] || [];
    return data.map((item, index) => ({
      name: new Date(item.date || item.startTime).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      }),
      閲覧数: item.views || item.totalViews || 0,
      ユニークユーザー: item.uniqueUsers || 0,
      index
    }));
  };

  const getChartTitle = () => {
    const titles = {
      hour: '時間別閲覧数（24時間）',
      day: '日別閲覧数推移（最近30日）',
      week: '週別閲覧数推移（最近12週）',
      month: '月別閲覧数推移（最近12ヶ月）',
      year: '年別閲覧数推移'
    };
    return titles[timeframe] || titles.day;
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <Card 
      elevation={0}
      sx={{ 
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%'
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: '50%', 
              bgcolor: alpha(color, 0.1),
              mr: 1 
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight="bold" color={color}>
          {value?.toLocaleString() || 0}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose} color="primary">
            <CloseIcon />
          </IconButton>
        </Box>
      </Paper>
    );
  }

  const timeSeriesData = getPeriodData();
  const engagement = analytics?.engagement || {};

  // エンゲージメント率のデータ
  const engagementData = [
    { 
      name: 'いいね率', 
      value: parseFloat(engagement.likeRate) || 0,
      fill: theme.palette.error.main
    },
    { 
      name: 'ブックマーク率', 
      value: parseFloat(engagement.bookmarkRate) || 0,
      fill: theme.palette.warning.main
    },
    { 
      name: 'コメント率', 
      value: parseFloat(engagement.commentRate) || 0,
      fill: theme.palette.success.main
    }
  ];

  // 時間別データの準備
  const hourlyChartData = Array.from({ length: 24 }, (_, hour) => ({
    name: `${hour}時`,
    閲覧数: hourlyData.find(h => h.hour === hour)?.views || 0
  }));

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}
    >
      {/* ヘッダー */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary">
            📊 作品アナリティクス
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {analytics?.postTitle}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          color="primary"
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* 基本統計 */}
      <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
        📈 基本統計
      </Typography>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<VisibilityIcon />}
            title="総閲覧数"
            value={analytics?.basicStats?.totalViews}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<FavoriteIcon />}
            title="いいね数"
            value={analytics?.basicStats?.totalLikes}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<BookmarkIcon />}
            title="ブックマーク"
            value={analytics?.basicStats?.totalBookmarks}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CommentIcon />}
            title="コメント数"
            value={analytics?.basicStats?.totalComments}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* タイムフレーム切り替えボタン */}
      <Box display="flex" justifyContent="center" gap={1} mb={3}>
        <TimeframeButton value="hour" label="時間足" current={timeframe} onClick={setTimeframe} />
        <TimeframeButton value="day" label="日足" current={timeframe} onClick={setTimeframe} />
        <TimeframeButton value="week" label="週足" current={timeframe} onClick={setTimeframe} />
        <TimeframeButton value="month" label="月足" current={timeframe} onClick={setTimeframe} />
        <TimeframeButton value="year" label="年足" current={timeframe} onClick={setTimeframe} />
      </Box>

      {/* グラフセクション */}
      <Grid container spacing={3}>
        {/* メイン時系列グラフ */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
              📅 {getChartTitle()}
            </Typography>
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                {timeframe === 'hour' ? (
                  <BarChart data={hourlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Bar 
                      dataKey="閲覧数" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="閲覧数" 
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ユニークユーザー" 
                      stroke={theme.palette.secondary.main}
                      strokeWidth={3}
                      dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height={350}>
                <Typography color="text.secondary">データがありません</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* エンゲージメント率 */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
              💫 エンゲージメント率
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 8
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 選択日の時間足グラフ */}
        {timeframe !== 'hour' && (
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🕐 選択日の時間別閲覧数
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: 'inline' }}>
                    表示する日:
                  </Typography>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      fontSize: '14px'
                    }}
                  />
                </Box>
              </Box>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Bar 
                    dataKey="閲覧数" 
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* フッター情報 */}
      <Box mt={3} pt={2} borderTop={1} borderColor="divider">
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              icon={<ScheduleIcon />}
              label={`公開日: ${new Date(analytics?.basicStats?.publishedAt).toLocaleDateString('ja-JP')}`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<TrendingUpIcon />}
              label={`エンゲージメント: ${(
                (parseFloat(engagement.likeRate) + parseFloat(engagement.bookmarkRate) + parseFloat(engagement.commentRate)) / 3
              ).toFixed(1)}%`}
              color="primary"
              size="small"
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WorkAnalytics;