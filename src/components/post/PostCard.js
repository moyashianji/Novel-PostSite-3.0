// src/components/post/PostCard.js
import React from 'react';
import { 
  Card, Typography, Avatar, Box, Chip, Stack, 
  Divider, Paper, CardContent, CardActions, Tooltip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SmartToyIcon from '@mui/icons-material/SmartToy'; // AIツール用アイコン
import WarningIcon from '@mui/icons-material/Warning'; // R18警告アイコン
import TextSnippetIcon from '@mui/icons-material/TextSnippet'; // 文字数アイコン
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; // いいねアイコン
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';

const PostCard = ({ post }) => {
  const { _id, title, author, description, content, wordCount, tags, series, aiEvidence, isAdultContent, goodCounter, rankingScore } = post;
  const navigate = useNavigate();

  // 総合スコアの表示コンポーネント（シンプル版）
  const SimpleScoreDisplay = React.memo(({ rankingScore  }) => {
    if (rankingScore&& rankingScore > 0) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="caption" 
            component="span"
            sx={{ color: 'text.secondary' }}
          >
            人気スコア: {Number(rankingScore).toFixed(2)}
          </Typography>
        </Box>
      );
    }});


  return (
    <Card 
      sx={{ 
        marginBottom: 2, 
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'visible',
      }}
      elevation={1}
    >
      {/* R18タグを右上に表示 */}
      {isAdultContent && (
        <Chip 
          label="R18" 
          color="error" 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: -10, 
            right: 10, 
            fontWeight: 'bold',
            zIndex: 2,
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
          }}
        />
      )}

      {/* シリーズ表示 */}
      {series && (
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText', 
            px: 2, 
            py: 0.5,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}
        >
          <PostSeries series={series} />
        </Box>
      )}
      
      <CardContent sx={{ pt: 2, pb: 1 }}>
        {/* タイトルと著者情報 */}
        <PostTitle _id={_id} title={title} />
        <PostAuthor author={author} />
        
        <Divider sx={{ my: 1.5 }} />
        
        {/* 本文と説明 */}
        <PostDescription description={description} />
        <PostContent content={content} />
        
        {/* メタ情報表示（文字数、作品タイプ、いいね数、総合スコア） */}
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1, gap: 2, flexWrap: 'wrap' }}>
          {/* 文字数表示 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextSnippetIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
            <Typography 
              variant="caption" 
              component="span"
              sx={{ color: 'text.secondary' }}
            >
              文字数: {wordCount ? wordCount.toLocaleString() : '0'}
            </Typography>
          </Box>
          
          {/* いいね数表示 */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ThumbUpIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
            <Typography 
              variant="caption" 
              component="span"
              sx={{ color: 'text.secondary' }}
            >
              いいね: {goodCounter ? goodCounter.toLocaleString() : '0'}
            </Typography>
          </Box>

          {/* 作品タイプ表示 */}
          <Chip
            label={series ? "連載作品" : "読み切り作品"}
            size="small"
            color={series ? "primary" : "success"}
            variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />

          {/* 総合スコア表示 - シンプル版 */}
          <SimpleScoreDisplay rankingScore={rankingScore} 
 />
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ p: 2, pt: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* タグ表示 */}
        <PostTags tags={tags} />
        
        {/* AIツール表示 */}
        {aiEvidence && aiEvidence.tools && aiEvidence.tools.length > 0 && (
          <Box sx={{ mt: 1, width: '100%' }}>
            <PostAITools tools={aiEvidence.tools} />
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

const PostSeries = React.memo(({ series }) => {
  if (!series || !series.title) return null;

  const maxLength = 20;
  const truncatedTitle =
    series.title.length > maxLength ? series.title.substring(0, maxLength) + '...' : series.title;

  return (
    <Link to={`/series/${series._id}/works`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <Typography variant="subtitle2" fontWeight="medium">
        {truncatedTitle}
      </Typography>
    </Link>
  );
});

const PostTitle = React.memo(({ _id, title }) => (
  <Link to={`/novel/${_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
    <Typography 
      variant="h5" 
      gutterBottom
      sx={{ 
        fontWeight: 'bold',
        lineHeight: 1.3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}
    >
      {title}
    </Typography>
  </Link>
));

const PostAuthor = React.memo(({ author }) => {
  if (!author) return null;

  return (
    <Box display="flex" alignItems="center" mb={1}>
      <Link to={`/user/${author._id}`}>
        <Avatar 
          src={`${author.icon}`} 
          alt={author.nickname} 
          sx={{ 
            width: 32, 
            height: 32,
            border: '2px solid white',
            boxShadow: '0px 1px 3px rgba(0,0,0,0.1)'
          }} 
        />
      </Link>
      <Link to={`/user/${author._id}`} style={{ textDecoration: 'none', color: 'inherit', marginLeft: '8px' }}>
        <Typography 
          variant="subtitle1"
          sx={{ fontWeight: 500 }}
        >
          {author.nickname}
        </Typography>
      </Link>
    </Box>
  );
});

const PostDescription = React.memo(({ description }) => (
  <Typography 
    variant="body1" 
    color="textSecondary" 
    gutterBottom
    sx={{
      fontWeight: 500,
      mb: 1.5,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical'
    }}
  >
    {description}
  </Typography>
));

const PostContent = React.memo(({ content }) => {
  // --page--マーカーを削除してからコンテンツを切り取る
  const cleanContent = content ? content.replace(/--page--/g, '') : '';
  const safeContent = cleanContent ? cleanContent.slice(0, 100) + '...' : '';

  return (
    <Typography 
      variant="body2" 
      color="textSecondary"
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        mb: 1,
        color: 'text.secondary',
        lineHeight: 1.5
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: safeContent }} />
    </Typography>
  );
});

const PostTags = React.memo(({ tags }) => {
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=posts`);
  };

  // tagsが存在しない場合は空の配列を返す
  if (!tags || !Array.isArray(tags)) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
      {tags.map((tag, index) => (
        <Chip
          key={index}
          label={tag}
          sx={{ 
            mr: 0.5, 
            mb: 0.5,
            borderRadius: '4px',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)'
            }
          }}
          onClick={() => handleTagClick(tag)}
          color="primary"
          size="small"
        />
      ))}
    </Box>
  );
});

// AIツールを表示するコンポーネント
const PostAITools = React.memo(({ tools }) => {
  const navigate = useNavigate();

  const handleToolClick = (tool) => {
    navigate(`/search?aiTool=${encodeURIComponent(tool)}&type=posts`);
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
      <Typography 
        variant="caption" 
        sx={{ 
          mr: 1,
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary'
        }}
      >
        <SmartToyIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
        使用AI:
      </Typography>
      {tools.map((tool, index) => (
        <Chip
          key={index}
          label={tool}
          sx={{ 
            mr: 0.5, 
            mb: 0.5,
            borderRadius: '4px',
            transition: 'all 0.2s',
            '&:hover': {
              boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
              transform: 'translateY(-1px)'
            }
          }}
          onClick={() => handleToolClick(tool)}
          color="secondary"
          size="small"
          variant="outlined"
        />
      ))}
    </Box>
  );
});

export default React.memo(PostCard);