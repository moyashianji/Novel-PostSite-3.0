import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardMedia, 
  CardContent, 
  Divider, 
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Grid,
  useTheme
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

// Import icons
import EditIcon from '@mui/icons-material/Edit';
import DateRangeIcon from '@mui/icons-material/DateRange';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import TagIcon from '@mui/icons-material/Tag';
import ScheduleIcon from '@mui/icons-material/Schedule';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * 汎用的なコンテストカードコンポーネント
 * @param {object} contest - コンテストオブジェクト
 * @param {string} currentUserId - 現在のユーザーID（コンテスト作成者かどうかを判定するため）
 * @param {function} onViewDetails - 詳細ボタンがクリックされたときのハンドラ（任意）
 * @param {function} onEdit - 編集ボタンがクリックされたときのハンドラ（任意）
 * @param {string} buttonText - 詳細ボタンのテキスト（デフォルト: "詳細を見る"）
 * @param {boolean} compact - コンパクト表示モード（デフォルト: false）
 */
const ContestCard = ({ 
  contest, 
  currentUserId, 
  onViewDetails, 
  onEdit, 
  buttonText = "詳細を見る",
  compact = false
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // コンテストが存在しない場合
  if (!contest) return null;
  
  // 日付フォーマット関数
  const formatDate = (dateString) => {
    // 日付として解析できるか確認
    if (dateString && !isNaN(Date.parse(dateString))) {
      const date = new Date(dateString);
      
      // 時間と分の情報が設定されているか確認（00:00以外の時間が設定されている場合）
      const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
      
      // 基本的な日付フォーマット
      let formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      
      // 時間と分の情報も追加
      if (hasTime) {
        // 時間と分をゼロパディングする
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        formattedDate += ` ${hours}:${minutes}`;
      }
      
      return formattedDate;
    }
    // 解析できない場合はそのまま返す
    return dateString;
  };

  // タブのカラースキーマを取得する関数
  const getStatusColorScheme = (status) => {
    switch (status) {
      case '募集中':
        return {
          bgcolor: theme.palette.success.main,
          lightBg: theme.palette.success.light,
          color: 'success',
          icon: <EmojiEventsIcon fontSize="small" />
        };
      case '開催予定':
        return {
          bgcolor: theme.palette.info.main,
          lightBg: theme.palette.info.light,
          color: 'info',
          icon: <ScheduleIcon fontSize="small" />
        };
      case '募集一時停止中':
        return {
          bgcolor: theme.palette.warning.main,
          lightBg: theme.palette.warning.light,
          color: 'warning',
          icon: <InfoIcon fontSize="small" />
        };
      case '募集終了':
        return {
          bgcolor: theme.palette.grey[600],
          lightBg: theme.palette.grey[200],
          color: 'default',
          icon: <AccessTimeIcon fontSize="small" />
        };
      default:
        return {
          bgcolor: theme.palette.primary.main,
          lightBg: theme.palette.primary.light,
          color: 'primary',
          icon: <EmojiEventsIcon fontSize="small" />
        };
    }
  };
  
  // 詳細を表示する関数
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(contest._id);
    } else {
      navigate(`/contests/${contest._id}`);
    }
  };
  
  // 編集する関数
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(contest._id);
    } else {
      navigate(`/contest-edit/${contest._id}`);
    }
  };
  
  // コンパクトモード用のスタイル調整
  const imageHeight = compact ? 120 : 160;
  const cardContentPadding = compact ? 1.5 : 2;
  const titleLines = compact ? 1 : 2;
  const descriptionLines = compact ? 2 : 3;
  
  return (
    <Card
      elevation={1}
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 3,
        }
      }}
    >
      {/* Status badge */}
      <Chip
        icon={getStatusColorScheme(contest.status).icon}
        label={contest.status}
        color={getStatusColorScheme(contest.status).color}
        size="small"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 2,
          fontWeight: 'bold',
          fontSize: '0.75rem'
        }}
      />
      
      {/* Edit button for contest creator */}
      {currentUserId && contest.creator === currentUserId && (
        <Tooltip title="コンテストを編集する">
          <IconButton
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': { 
                bgcolor: 'white'
              }
            }}
            onClick={handleEdit}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {/* Card Image */}
      <Link 
        to={`/contests/${contest._id}`} 
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <Box sx={{ position: 'relative', height: imageHeight, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            image={`${contest.iconImage}`}
            alt={contest.title}
            sx={{
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Link>
      
      <CardContent sx={{ p: cardContentPadding, flexGrow: 1 }}>
        {/* Title */}
        <Link 
          to={`/contests/${contest._id}`} 
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Typography 
            variant={compact ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: titleLines,
              WebkitBoxOrient: 'vertical',
              minHeight: compact ? 24 : 50
            }}
          >
            {contest.title}
          </Typography>
        </Link>
        
        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: descriptionLines,
            WebkitBoxOrient: 'vertical',
            minHeight: compact ? 40 : 60,
            lineHeight: 1.5
          }}
        >
          {contest.shortDescription}
        </Typography>

        {/* Genres */}
        {contest.genres && contest.genres.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ gap: 0.5 }}>
              {contest.genres.slice(0, compact ? 2 : 3).map((genre, index) => (
                <Chip
                  key={index}
                  icon={<TagIcon fontSize="small" />}
                  label={genre}
                  size="small"
                  sx={{ 
                    height: 24, 
                    fontSize: '0.75rem',
                    '& .MuiChip-icon': { 
                      fontSize: 16,
                      marginLeft: '4px'
                    }
                  }}
                />
              ))}
              {contest.genres.length > (compact ? 2 : 3) && (
                <Chip
                  label={`+${contest.genres.length - (compact ? 2 : 3)}`}
                  size="small"
                  sx={{ height: 24, fontSize: '0.75rem' }}
                />
              )}
            </Stack>
          </Box>
        )}
        
        <Divider sx={{ mb: 2 }} />
        
        {/* Stats */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupsIcon 
                sx={{ fontSize: 18, color: 'primary.main', mr: 0.5, opacity: 0.8 }} 
              />
              <Typography variant="body2" fontWeight="medium">
                {contest.entries ? contest.entries.length : 0} 応募
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalLibraryIcon 
                sx={{ fontSize: 18, color: 'primary.main', mr: 0.5, opacity: 0.8 }} 
              />
              <Typography variant="body2" fontWeight="medium">
                {contest.genres ? contest.genres.length : 0} ジャンル
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {/* Dates */}
        {!compact && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
              <DateRangeIcon 
                fontSize="small" 
                sx={{ color: 'text.secondary', mr: 1, mt: 0.3, fontSize: 18 }} 
              />
              <Box>
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  応募期間
                </Typography>
                <Typography variant="body2">
                  {formatDate(contest.applicationStartDate)} 〜 <br/>
                  {formatDate(contest.applicationEndDate)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      {/* Button */}
      <Box sx={{ p: compact ? 1.5 : 2, pt: compact ? 1 : 1 }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewDetails}
          sx={{
            borderRadius: 2,
            py: compact ? 0.5 : 0.8,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </Card>
  );
};

export default React.memo(ContestCard);