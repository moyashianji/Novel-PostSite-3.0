import React from "react";
import { 
  Card, Typography, Avatar, Box, Chip, CardContent, 
  Divider, Badge, Stack, CardActionArea, Tooltip 
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/system";
import BookIcon from "@mui/icons-material/Book";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// スタイル付きコンポーネント
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 8,
  overflow: "visible",
  position: "relative",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  height: "100%",
  display: "flex",
  flexDirection: "column"
}));

const SeriesCard = ({ series }) => {
  if (!series) {
    return null;
  }

  const { 
    _id, 
    title = "無題", 
    description = "説明なし", 
    author = {}, 
    tags = [], 
    posts = [], 
    isAdultContent, 
    isOriginal, 
    aiGenerated,
    isCompleted = false,
    followerCount = 0,  // フォロワー数
    trendingScores = {},  // トレンディングスコア
    rankingScore = 0  // 人気スコアを追加

  } = series;

  return (
    <StyledCard elevation={2}>
      {/* 成人向けコンテンツの場合の警告表示 */}
      {isAdultContent && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "error.main",
            color: "error.contrastText",
            padding: "4px 8px",
            borderBottomRightRadius: 8,
            zIndex: 1,
            fontWeight: "bold",
            fontSize: "0.75rem"
          }}
        >
          R18
        </Box>
      )}

      <CardContent sx={{ p: 3, pb: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <SeriesTitle _id={_id} title={title} />
        <SeriesAuthor author={author} />
        
        <Divider sx={{ my: 1.5 }} />
        
        {/* 説明文と属性（オリジナル/AI生成）*/}
        <Box sx={{ mb: 2, flexGrow: 1 }}>
          <SeriesDescription description={description} />
          
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            {isOriginal && (
              <Chip 
                label="オリジナル" 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ borderRadius: "4px" }} 
              />
            )}
            
            {/* 完結状態を表示 */}
            {isCompleted ? (
              <Chip 
                icon={<CheckCircleOutlineIcon sx={{ fontSize: '1rem' }} />}
                label="完結済" 
                size="small" 
                color="success" 
                variant="outlined"
                sx={{ borderRadius: "4px" }} 
              />
            ) : (
              <Chip 
                icon={<HourglassEmptyIcon sx={{ fontSize: '1rem' }} />}
                label="連載中" 
                size="small" 
                color="info" 
                variant="outlined"
                sx={{ borderRadius: "4px" }} 
              />
            )}
          </Stack>
        </Box>
        
        {/* 統計情報エリア */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <BookIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <SeriesWorksCount posts={posts} />
          </Box>

          {/* フォロワー数を表示 */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PeopleIcon color="action" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              フォロワー: {followerCount}人
            </Typography>
          </Box>
          {/* 人気スコアを表示 */}
          <ScoreDisplay 
            rankingScore={rankingScore} 
          />
        </Box>
      </CardContent>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <SeriesTags tags={tags} />
      </Box>
    </StyledCard>
  );
};

// シリーズタイトル（クリックで遷移）
const SeriesTitle = React.memo(({ _id, title }) => (
  <Link to={_id ? `/series/${_id}/works` : "#"} style={{ textDecoration: "none", color: "inherit" }}>
    <Typography 
      variant="h5" 
      gutterBottom
      sx={{ 
        fontWeight: "bold", 
        lineHeight: 1.3,
        height: "2.6em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical"
      }}
    >
      {title}
    </Typography>
  </Link>
));
  // 人気スコアの表示コンポーネント
  const ScoreDisplay = React.memo(({ rankingScore }) => {
    if (rankingScore && rankingScore > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StarIcon sx={{ fontSize: '0.875rem', mr: 0.5, color: 'text.secondary' }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            人気スコア: {Number(rankingScore).toFixed(2)}
          </Typography>
        </Box>
      );
    }
    
    return null;
  });

// 作者情報
const SeriesAuthor = React.memo(({ author }) => {
  if (!author || !author._id) {
    return <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>不明な作者</Typography>;
  }

  return (
    <Box display="flex" alignItems="center" mb={1}>
      <Link to={`/user/${author._id}`}>
        <Avatar 
          src={author.icon || "/default-avatar.png"} 
          alt={author.nickname || "不明"} 
          sx={{ 
            width: 32, 
            height: 32,
            border: "2px solid white",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }} 
        />
      </Link>
      <Link to={`/user/${author._id}`} style={{ textDecoration: "none", color: "inherit", marginLeft: "8px" }}>
        <Typography 
          variant="subtitle1"
          sx={{ fontWeight: 500 }}
        >
          {author.nickname || "不明"}
        </Typography>
      </Link>
    </Box>
  );
});

// シリーズ説明（3行制限）
const SeriesDescription = React.memo(({ description }) => (
  <Typography 
    variant="body2" 
    color="textSecondary"
    sx={{
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      lineHeight: 1.5,
      minHeight: "4.5em"
    }}
  >
    {description || "説明はありません"}
  </Typography>
));

// シリーズの最新エピソード数
const SeriesWorksCount = React.memo(({ posts }) => {
  const latestEpisode = posts && posts.length > 0
    ? Math.max(...posts.map(post => post.episodeNumber || 0))
    : 0;
  
  const totalWorks = posts?.length || 0;

  return (
    <Typography 
      variant="body2" 
      sx={{ 
        color: "text.secondary",
        fontWeight: 500
      }}
    >
      {totalWorks}話 (最新: {latestEpisode}話)
    </Typography>
  );
});

// シリーズタグ - シリーズ用の検索に修正
const SeriesTags = React.memo(({ tags }) => {
  const navigate = useNavigate();

  if (!tags || tags.length === 0) {
    return <Typography variant="caption" color="textSecondary">タグなし</Typography>;
  }

  const handleTagClick = (tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=series`);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          size="small"
          sx={{ 
            mr: 0.5, 
            mb: 0.5, 
            borderRadius: "4px",
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              transform: "translateY(-1px)"
            }
          }}
          onClick={() => handleTagClick(tag)}
          color="primary"
          variant="outlined"
        />
      ))}
    </Box>
  );
});

export default React.memo(SeriesCard);