import React, { useMemo, useCallback } from 'react';
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
  Grid,
  useTheme,
  Paper
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// 必要なアイコンのみインポート
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
import StyleIcon from '@mui/icons-material/Style';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// テーマ対応のスタイル定数
const getCardStyles = (theme) => ({
  borderRadius: 3,
  transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
    : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  border: `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.5)'
      : '0 20px 40px rgba(0, 0, 0, 0.15)',
  }
});

const getImageStyles = (theme) => ({
  height: 160,
  overflow: 'hidden',
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
});

// テーマ対応のスタイルコンポーネント
const StyledCard = styled(Card)(({ theme }) => getCardStyles(theme));

const StatusBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  zIndex: 3,
  fontWeight: 'bold',
  fontSize: '0.8rem',
  height: 32,
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.95)
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  color: theme.palette.text.primary,
  opacity: 1,
  visibility: 'visible',
  pointerEvents: 'auto',
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.15)',
  '& .MuiChip-icon': {
    color: 'inherit',
  },
}));

const EditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  zIndex: 3,
  backgroundColor: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.9)
    : 'rgba(255, 255, 255, 0.9)',
  color: theme.palette.text.primary,
  backdropFilter: 'blur(10px)',
  opacity: 1,
  visibility: 'visible',
  pointerEvents: 'auto',
  transition: 'all 0.3s ease',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.15)',
  '&:hover': { 
    backgroundColor: theme.palette.mode === 'dark' 
      ? theme.palette.background.paper
      : 'rgba(255, 255, 255, 1)',
    transform: 'scale(1.1)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 16px rgba(0, 0, 0, 0.4)'
      : '0 6px 16px rgba(0, 0, 0, 0.2)',
  }
}));

// テーマ対応のタグスタイル関数（修正版）
const getChipStyle = (chiptype, theme) => {
  // テーマプリセットに基づいた色の取得
  const getThemeColor = (colorType) => {
    switch (colorType) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'info':
        return theme.palette.info?.main || theme.palette.primary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const colorMap = {
    genre: getThemeColor('primary'),
    contestTag: getThemeColor('secondary'),
    tag: getThemeColor('info')
  };
  
  const color = colorMap[chiptype] || colorMap.genre;
  
  // テーマモードに応じた適切な背景色とテキスト色の計算
  const isDark = theme.palette.mode === 'dark';
  
  // 色の明度を計算して、適切なコントラストを確保
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb = hexToRgb(color);
  const luminance = rgb ? getLuminance(rgb.r, rgb.g, rgb.b) : 0.5;
  
  // 背景色とテキスト色の決定
  const backgroundColor = isDark
    ? alpha(color, 0.25)
    : alpha(color, 0.12);
    
  const textColor = isDark
    ? (luminance > 0.5 ? theme.palette.common.black : color)
    : color;

  const borderColor = isDark
    ? alpha(color, 0.4)
    : alpha(color, 0.3);

  return {
    margin: '2px',
    borderRadius: 12,
    backgroundColor: backgroundColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    fontSize: '0.75rem',
    height: 28,
    fontWeight: 500,
    transition: 'all 0.2s ease',
    '& .MuiChip-icon': {
      color: textColor,
    },
    '&:hover': {
      backgroundColor: color,
      color: isDark 
        ? (luminance > 0.5 ? theme.palette.common.black : theme.palette.common.white)
        : theme.palette.common.white,
      transform: 'translateY(-1px)',
      boxShadow: isDark
        ? `0 4px 12px ${alpha(color, 0.4)}`
        : `0 4px 12px ${alpha(color, 0.3)}`,
      '& .MuiChip-icon': {
        color: isDark 
          ? (luminance > 0.5 ? theme.palette.common.black : theme.palette.common.white)
          : theme.palette.common.white,
      },
    },
  };
};

// メモ化されたタグコンポーネント
const TagChip = React.memo(({ tag, chiptype, icon, onClick }) => {
  const theme = useTheme();
  const style = useMemo(() => getChipStyle(chiptype, theme), [chiptype, theme]);
  
  return (
    <Chip
      icon={icon}
      label={tag}
      size="small"
      onClick={onClick}
      sx={style}
    />
  );
});

// メモ化された統計アイテム（テーマ対応）
const StatItem = React.memo(({ icon, value, label }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      p: 1, 
      borderRadius: 1, 
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.5)
        : alpha(theme.palette.primary.main, 0.04),
      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      transition: 'all 0.2s ease',
      '&:hover': { 
        backgroundColor: theme.palette.mode === 'dark'
          ? alpha(theme.palette.primary.main, 0.1)
          : alpha(theme.palette.primary.main, 0.08),
        transform: 'translateY(-1px)',
      }
    }}>
      {React.cloneElement(icon, {
        sx: { 
          fontSize: 18, 
          color: theme.palette.primary.main,
          ...icon.props.sx 
        }
      })}
      <Box sx={{ ml: 1 }}>
        <Typography variant="h6" sx={{ 
          lineHeight: 1, 
          fontWeight: 'bold',
          color: theme.palette.text.primary
        }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
});

// メモ化されたタグセクション
const TagSection = React.memo(({ title, tags, icon, chiptype, onTagClick, compact, maxTags }) => {
  const theme = useTheme();
  const displayTags = useMemo(() => tags?.slice(0, maxTags) || [], [tags, maxTags]);
  const remainingCount = tags?.length > maxTags ? tags.length - maxTags : 0;
  
  if (!tags?.length) return null;
  
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        {React.cloneElement(icon, {
          sx: { 
            fontSize: 16, 
            color: theme.palette.text.secondary,
            ...icon.props.sx 
          }
        })}
        <Typography variant="caption" fontWeight="medium" color="text.secondary" sx={{ ml: 0.5 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {displayTags.map((tag, index) => (
          <TagChip
            key={`${chiptype}-${index}`}
            tag={tag}
            chiptype={chiptype}
            onClick={(e) => onTagClick(tag, e)}
          />
        ))}
        {remainingCount > 0 && (
          <TagChip
            tag={`+${remainingCount}`}
            chiptype={chiptype}
          />
        )}
      </Box>
    </Box>
  );
});

// 日付フォーマット関数（メモ化）
const formatDate = (dateString) => {
  if (!dateString || isNaN(Date.parse(dateString))) return dateString;
  
  const date = new Date(dateString);
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
  
  let formatted = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  
  if (hasTime) {
    formatted += ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  
  return formatted;
};

// ステータス設定（テーマ対応）
const getStatusColor = (status, theme) => {
  const isDark = theme.palette.mode === 'dark';
  
  switch (status) {
    case '募集中': 
      return isDark ? 'success' : 'success';
    case '開催予定': 
      return isDark ? 'info' : 'info';
    case '募集一時停止中': 
      return isDark ? 'warning' : 'warning';
    case '募集終了': 
      return isDark ? 'default' : 'default';
    default: 
      return 'primary';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case '募集中': return <EmojiEventsIcon fontSize="small" />;
    case '開催予定': return <ScheduleIcon fontSize="small" />;
    case '募集一時停止中': return <InfoIcon fontSize="small" />;
    case '募集終了': return <AccessTimeIcon fontSize="small" />;
    default: return <EmojiEventsIcon fontSize="small" />;
  }
};

/**
 * テーマ対応コンテストカード
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
  
  // すべてのHooksを条件分岐の前に呼び出す
  const statusColor = useMemo(() => 
    contest ? getStatusColor(contest.status, theme) : 'primary', 
    [contest?.status, theme]
  );
  
  const statusIcon = useMemo(() => 
    contest ? getStatusIcon(contest.status) : <EmojiEventsIcon fontSize="small" />, 
    [contest?.status]
  );
  
  const totalTags = useMemo(() => 
    contest ? (contest.genres?.length || 0) + (contest.contestTags?.length || 0) + (contest.tags?.length || 0) : 0,
    [contest?.genres?.length, contest?.contestTags?.length, contest?.tags?.length]
  );
  
  const entriesCount = useMemo(() => contest?.entries?.length || 0, [contest?.entries?.length]);
  
  const maxTags = compact ? 3 : 5;
  const isCreator = currentUserId && contest?.creator === currentUserId;
  
  // テーマ対応のスタイル
  const imageStyles = useMemo(() => getImageStyles(theme), [theme]);
  
  // メモ化されたハンドラー
  const handleViewDetails = useCallback(() => {
    if (!contest) return;
    if (onViewDetails) {
      onViewDetails(contest._id);
    } else {
      navigate(`/contests/${contest._id}`);
    }
  }, [onViewDetails, contest?._id, navigate, contest]);
  
  const handleEdit = useCallback((e) => {
    if (!contest) return;
    e.stopPropagation();
    if (onEdit) {
      onEdit(contest._id);
    } else {
      navigate(`/contest-edit/${contest._id}`);
    }
  }, [onEdit, contest?._id, navigate, contest]);

  const handleGenreClick = useCallback((genre, e) => {
    e.stopPropagation();
    navigate(`/search?mustInclude=${encodeURIComponent(genre)}&type=contests&fields=genres`);
  }, [navigate]);

  const handleContestTagClick = useCallback((tag, e) => {
    e.stopPropagation();
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=posts&fields=contestTags`);
  }, [navigate]);

  const handleTagClick = useCallback((tag, e) => {
    e.stopPropagation();
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=contests&fields=tags`);
  }, [navigate]);
  
  // Early return for null contest (すべてのHooksの後)
  if (!contest) return null;
  
  return (
    <StyledCard sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* ステータスバッジ */}
      <StatusBadge
        icon={statusIcon}
        label={contest.status}
        color={statusColor}
        size="small"
      />
      
      {/* 編集ボタン */}
      {isCreator && (
        <Tooltip title="コンテストを編集する">
          <EditButton size="small" onClick={handleEdit}>
            <EditIcon fontSize="small" />
          </EditButton>
        </Tooltip>
      )}
      
      {/* 画像エリア */}
      <Box 
        onClick={handleViewDetails}
        sx={{ ...imageStyles, cursor: 'pointer' }}
      >
        <CardMedia
          component="img"
          image={contest.iconImage}
          alt={contest.title}
          sx={{
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            '&:hover': { transform: 'scale(1.1)' }
          }}
        />
      </Box>
      
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        {/* タイトル */}
        <Typography 
          variant={compact ? "h6" : "h5"} 
          onClick={handleViewDetails}
          sx={{ 
            fontWeight: 'bold',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: compact ? 28 : 48,
            mb: 1.5,
            cursor: 'pointer',
            color: 'text.primary'
          }}
        >
          {contest.title}
        </Typography>
        
        {/* 説明 */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: compact ? 1 : 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.5
          }}
        >
          {contest.shortDescription}
        </Typography>

        {/* タグセクション */}
        <TagSection
          title="ジャンル"
          tags={contest.genres}
          icon={<LocalLibraryIcon />}
          chiptype="genre"
          onTagClick={handleGenreClick}
          compact={compact}
          maxTags={maxTags}
        />

        <TagSection
          title="コンテストタグ"
          tags={contest.contestTags}
          icon={<StyleIcon />}
          chiptype="contestTag"
          onTagClick={handleContestTagClick}
          compact={compact}
          maxTags={maxTags}
        />

        <TagSection
          title="タグ"
          tags={contest.tags}
          icon={<TagIcon />}
          chiptype="tag"
          onTagClick={handleTagClick}
          compact={compact}
          maxTags={maxTags}
        />
        
        {/* 統計情報 */}
        <Grid container spacing={1.5} sx={{ mt: 1.5, mb: 1.5 }}>
          <Grid item xs={6}>
            <StatItem
              icon={<GroupsIcon />}
              value={entriesCount}
              label="応募"
            />
          </Grid>
          
          <Grid item xs={6}>
            <StatItem
              icon={<TagIcon />}
              value={totalTags}
              label="総タグ数"
            />
          </Grid>
        </Grid>
        
        {/* 日程情報 */}
        {!compact && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 1.5,
              mt: 1.5,
              borderRadius: 2, 
              backgroundColor: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.5)
                : alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <DateRangeIcon sx={{ 
                fontSize: 16, 
                color: theme.palette.primary.main, 
                mr: 1 
              }} />
              <Typography variant="caption" fontWeight="bold" color="text.primary">
                応募期間
              </Typography>
            </Box>
            <Box sx={{ pl: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
                <FiberManualRecordIcon sx={{ 
                  fontSize: 6, 
                  color: theme.palette.success.main, 
                  mr: 1 
                }} />
                <Typography variant="caption" color="text.secondary">
                  開始: {formatDate(contest.applicationStartDate)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FiberManualRecordIcon sx={{ 
                  fontSize: 6, 
                  color: theme.palette.error.main, 
                  mr: 1 
                }} />
                <Typography variant="caption" color="text.secondary">
                  終了: {formatDate(contest.applicationEndDate)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </CardContent>
      
      <Divider />
      
      {/* アクションボタン */}
      <Box sx={{ p: 2.5, pt: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewDetails}
          sx={{
            borderRadius: 2,
            p: 1.2,
            textTransform: 'none',
            fontWeight: 'bold',
            background: theme.palette.mode === 'dark'
              ? `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
              : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: theme.palette.mode === 'dark' 
              ? theme.palette.common.white 
              : theme.palette.common.white,
            '&:hover': {
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
                : `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
              transform: 'translateY(-2px)',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
            }
          }}
        >
          {buttonText}
        </Button>
      </Box>
    </StyledCard>
  );
};

export default React.memo(ContestCard);