// src/components/mypage/analytics/WorkAnalytics.js
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  alpha,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Comment as CommentIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// メモ化されたTimeframeButtonコンポーネント
const TimeframeButton = memo(({ value, label, current, onClick, theme }) => (
  <Button
    variant={current === value ? "contained" : "outlined"}
    size="small"
    onClick={useCallback(() => onClick(value), [onClick, value])}
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
));

TimeframeButton.displayName = 'TimeframeButton';

// メモ化されたStatCardコンポーネント
const StatCard = memo(({ icon, title, value, subtitle, color }) => (
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
));

StatCard.displayName = 'StatCard';

// メモ化されたDateSelectorコンポーネント - 改善版
const DateSelector = memo(({ 
  datePreset, 
  selectedDate, 
  onDatePresetChange, 
  onDateChange 
}) => {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: alpha('#2196f3', 0.05),
        border: `1px solid ${alpha('#2196f3', 0.2)}`
      }}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <DateRangeIcon color="primary" />
          <Typography variant="h6" color="primary" fontWeight="bold">
            特定日の詳細分析
          </Typography>
        </Box>
        
        <Box display="flex" flexWrap="wrap" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
            分析する日付を選択:
          </Typography>
          
          {/* プリセット選択ボタン */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {[
              { value: 'today', label: '今日' },
              { value: 'yesterday', label: '昨日' },
              { value: 'week_ago', label: '1週間前' },
              { value: 'month_ago', label: '1ヶ月前' }
            ].map((preset) => (
              <Button
                key={preset.value}
                variant={datePreset === preset.value ? "contained" : "outlined"}
                size="small"
                onClick={() => onDatePresetChange({ target: { value: preset.value } })}
                sx={{
                  minWidth: 70,
                  borderRadius: 6,
                  textTransform: 'none',
                  fontSize: '0.8rem'
                }}
              >
                {preset.label}
              </Button>
            ))}
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            または
          </Typography>
          
          {/* カスタム日付選択 */}
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={onDateChange}
            sx={{ 
              width: 160,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputLabelProps={{
              shrink: true,
            }}
            label="カスタム日付"
          />
        </Box>
        
        <Typography variant="caption" color="text.secondary">
          選択した日付の時間別閲覧データを下部のグラフで確認できます
        </Typography>
      </Box>
    </Paper>
  );
});

DateSelector.displayName = 'DateSelector';

// メモ化されたMainChartコンポーネント（期間別閲覧数推移専用）
const MainChart = memo(({ 
  timeframe, 
  timeSeriesData, 
  title, 
  theme 
}) => {
  const chartContent = useMemo(() => {
    console.log(`📊 MainChart: timeframe=${timeframe}, データ数=${timeSeriesData.length}`);
    
    if (timeSeriesData.length === 0) {
      console.log(`📊 ${timeframe}のデータが空のため、空のメッセージを表示`);
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height={350}>
          <Typography color="text.secondary">
            {timeframe}のデータがありません
          </Typography>
        </Box>
      );
    }

    console.log(`📈 ${timeframe}のグラフを描画:`, timeSeriesData.slice(0, 3));

    return (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={timeSeriesData}>
          <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
            angle={timeframe === 'week' ? -45 : 0}
            textAnchor={timeframe === 'week' ? 'end' : 'middle'}
            height={timeframe === 'week' ? 80 : 60}
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
      </ResponsiveContainer>
    );
  }, [timeframe, timeSeriesData, theme]);

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TimelineIcon color="primary" />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          {title}
        </Typography>
      </Box>
      {chartContent}
    </Paper>
  );
});

MainChart.displayName = 'MainChart';

// メモ化された時間別グラフコンポーネント（独立）
const HourlyChart = memo(({ 
  hourlyChartData, 
  selectedDateFormatted, 
  theme 
}) => {
  const chartContent = useMemo(() => {
    return (
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
    );
  }, [hourlyChartData, theme]);

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AccessTimeIcon color="primary" />
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            {selectedDateFormatted}の時間別閲覧数
          </Typography>
        </Box>
      </Box>
      {chartContent}
    </Paper>
  );
});

HourlyChart.displayName = 'HourlyChart';

const WorkAnalytics = ({ postId, onClose }) => {
  const theme = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [hourlyData, setHourlyData] = useState([]);
  const [datePreset, setDatePreset] = useState('today'); // 日付プリセット用

  // useCallbackでメモ化された関数群
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 期間別データ取得開始: timeframe=${timeframe}`);
      
      // 時間足の場合は過去24時間のデータを要求
      let url = `/api/users/me/works/${postId}/analytics?timeframe=${timeframe}`;
      if (timeframe === 'hour') {
        // 過去24時間のデータを取得するためのフラグを追加
        url += '&last24hours=true';
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('アナリティクスの取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('📊 受信した期間別データ:', data);
      console.log('📈 timeSeriesData:', data.timeSeriesData);
      
      setAnalytics(data);
    } catch (err) {
      console.error('❌ 期間別データ取得エラー:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId, timeframe]);

  // 時間別データ専用の取得関数
  const fetchHourlyData = useCallback(async () => {
    try {
      console.log(`🕐 時間別データ取得開始: date=${selectedDate}`);
      
      const response = await fetch(`/api/users/me/works/${postId}/analytics?timeframe=hour&date=${selectedDate}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('時間別データの取得に失敗しました');
      }
      
      const data = await response.json();
      console.log('🕐 受信した時間別データ:', data.hourlyData);
      
      if (data.hourlyData) {
        setHourlyData(data.hourlyData);
      }
    } catch (err) {
      console.error('❌ 時間別データ取得エラー:', err);
    }
  }, [postId, selectedDate]);

  // 期間別データの取得（timeframe変更時のみ）
  useEffect(() => {
    if (postId) {
      fetchAnalytics();
    }
  }, [postId, fetchAnalytics]);

  // 時間別データの取得（selectedDate変更時のみ）
  useEffect(() => {
    if (postId) {
      fetchHourlyData();
    }
  }, [postId, fetchHourlyData]);

  // メモ化されたハンドラー関数
  const handleTimeframeChange = useCallback((newTimeframe) => {
    setTimeframe(newTimeframe);
  }, []);

  const handleDatePresetChange = useCallback((event) => {
    const preset = event.target.value;
    setDatePreset(preset);
    const today = new Date();
    let newDate;
    
    switch (preset) {
      case 'today':
        newDate = today;
        break;
      case 'yesterday':
        newDate = new Date(today);
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week_ago':
        newDate = new Date(today);
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month_ago':
        newDate = new Date(today);
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      default:
        newDate = today;
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  }, []);

  const handleDateChange = useCallback((event) => {
    setSelectedDate(event.target.value);
    setDatePreset('custom');
  }, []);

  // useMemoで計算結果をメモ化
  const timeSeriesData = useMemo(() => {
    if (!analytics || !analytics.timeSeriesData) {
      console.log('📊 analytics または timeSeriesData が存在しません');
      return [];
    }
    
    let data = analytics.timeSeriesData[timeframe] || [];
    
    // 時間足の場合は過去24時間のデータに制限
    if (timeframe === 'hour') {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      data = data.filter(item => {
        const itemDate = new Date(item.date || item.startTime);
        return itemDate >= twentyFourHoursAgo && itemDate <= now;
      });
      
      // 時間順にソート
      data.sort((a, b) => new Date(a.date || a.startTime) - new Date(b.date || b.startTime));
    }
    
    console.log(`📊 ${timeframe}のデータ:`, data.length, '件');
    
    if (data.length === 0) {
      console.log(`⚠️ ${timeframe}のデータが空です`);
      return [];
    }
    
    return data.map((item, index) => {
      let name;
      const date = new Date(item.date || item.startTime);
      
      // 時間足ごとに適切な表示形式を設定
      switch (timeframe) {
        case 'hour':
          // 過去24時間の場合は「MM/DD HH時」形式
          name = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}時`;
          break;
        case 'day':
          name = `${date.getMonth() + 1}/${date.getDate()}`;
          break;
        case 'week':
          const weekEnd = new Date(date);
          weekEnd.setDate(weekEnd.getDate() + 6);
          name = `${date.getMonth() + 1}/${date.getDate()}~${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
          break;
        case 'month':
          name = `${date.getFullYear()}年${date.getMonth() + 1}月`;
          break;
        case 'year':
          name = `${date.getFullYear()}年`;
          break;
        default:
          name = date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric'
          });
      }
      
      const result = {
        name,
        閲覧数: item.views || item.totalViews || 0,
        ユニークユーザー: item.uniqueUsers || 0,
        index
      };
      
      console.log(`📈 ${timeframe}[${index}]:`, result);
      return result;
    });
  }, [analytics, timeframe]);

  const chartTitle = useMemo(() => {
    const titles = {
      hour: '過去24時間の閲覧数推移',
      day: '日別閲覧数推移（最近30日）',
      week: '週別閲覧数推移（最近12週）',
      month: '月別閲覧数推移（最近12ヶ月）',
      year: '年別閲覧数推移'
    };
    return titles[timeframe] || titles.day;
  }, [timeframe]);

  const engagementData = useMemo(() => {
    const engagement = analytics?.engagement || {};
    return [
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
  }, [analytics, theme.palette]);

  const hourlyChartData = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => ({
      name: `${hour}時`,
      閲覧数: hourlyData.find(h => h.hour === hour)?.views || 0
    }));
  }, [hourlyData]);

  const basicStats = useMemo(() => {
    return analytics?.basicStats || {};
  }, [analytics]);

  const totalEngagement = useMemo(() => {
    const engagement = analytics?.engagement || {};
    return (
      (parseFloat(engagement.likeRate) + parseFloat(engagement.bookmarkRate) + parseFloat(engagement.commentRate)) / 3
    ).toFixed(1);
  }, [analytics]);

  const formattedPublishedDate = useMemo(() => {
    return basicStats.publishedAt ? new Date(basicStats.publishedAt).toLocaleDateString('ja-JP') : '';
  }, [basicStats.publishedAt]);

  const selectedDateFormatted = useMemo(() => {
    return new Date(selectedDate).toLocaleDateString('ja-JP');
  }, [selectedDate]);

  // メモ化されたローディング状態
  const loadingContent = useMemo(() => (
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
  ), [theme]);

  // メモ化されたエラー状態
  const errorContent = useMemo(() => (
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
  ), [error, onClose]);

  // 早期リターン
  if (loading) return loadingContent;
  if (error) return errorContent;

  
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
        <Box display="flex" alignItems="center" gap={1}>
          <AnalyticsIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary">
              作品アナリティクス
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {analytics?.postTitle}
            </Typography>
          </Box>
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
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          基本統計
        </Typography>
      </Box>
      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<VisibilityIcon />}
            title="総閲覧数"
            value={basicStats.totalViews}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<FavoriteIcon />}
            title="いいね数"
            value={basicStats.totalLikes}
            color={theme.palette.error.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<BookmarkIcon />}
            title="ブックマーク"
            value={basicStats.totalBookmarks}
            color={theme.palette.warning.main}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon={<CommentIcon />}
            title="コメント数"
            value={basicStats.totalComments}
            color={theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* タイムフレーム切り替えボタン */}
      <Box display="flex" justifyContent="center" gap={1} mb={3}>
        <TimeframeButton value="hour" label="時間足" current={timeframe} onClick={handleTimeframeChange} theme={theme} />
        <TimeframeButton value="day" label="日足" current={timeframe} onClick={handleTimeframeChange} theme={theme} />
        <TimeframeButton value="week" label="週足" current={timeframe} onClick={handleTimeframeChange} theme={theme} />
        <TimeframeButton value="month" label="月足" current={timeframe} onClick={handleTimeframeChange} theme={theme} />
        <TimeframeButton value="year" label="年足" current={timeframe} onClick={handleTimeframeChange} theme={theme} />
      </Box>

      {/* 期間別閲覧数推移グラフ */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainChart
            timeframe={timeframe}
            timeSeriesData={timeSeriesData}
            title={chartTitle}
            theme={theme}
          />
        </Grid>
      </Grid>

      {/* 特定日の詳細分析（時間別グラフの上に移動） */}
      <Box mt={4}>
        <DateSelector
          timeframe="day" // 常に表示
          datePreset={datePreset}
          selectedDate={selectedDate}
          onDatePresetChange={handleDatePresetChange}
          onDateChange={handleDateChange}
        />

        {/* 時間別閲覧数グラフ */}
        <HourlyChart
          hourlyChartData={hourlyChartData}
          selectedDateFormatted={selectedDateFormatted}
          theme={theme}
        />
      </Box>

      {/* フッター情報 */}
      <Box mt={3} pt={2} borderTop={1} borderColor="divider">
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Chip
              icon={<ScheduleIcon />}
              label={`公開日: ${formattedPublishedDate}`}
              variant="outlined"
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

export default memo(WorkAnalytics);