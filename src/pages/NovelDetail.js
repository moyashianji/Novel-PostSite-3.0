import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Fade,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import NovelContent from '../components/noveldetail/NovelContent';
import CommentSection from '../components/comment/CommentSection';
import AuthorInfo from '../components/noveldetail/AuthorInfo';
import SeriesSelector from '../components/noveldetail/SeriesSelector';
import { formatDate } from '../utils/dateUtils';

const NovelDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const contentRef = useRef(null);
  const bookmarkProcessedRef = useRef(false);

  // 状態管理
  const [post, setPost] = useState(null);
  const [goodCount, setGoodCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [bookshelfCount, setBookshelfCount] = useState(0);
  const [postDate, setPostDate] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [isBookmarkMode, setIsBookmarkMode] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isInBookshelf, setIsInBookshelf] = useState(false);
  const [allSeriesData, setAllSeriesData] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(id);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [textFragment, setTextFragment] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // スナックバーを閉じる
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // スナックバーを表示する関数
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // しおりからの遷移を処理する
  useEffect(() => {
    // すでに処理済みならスキップ
    if (bookmarkProcessedRef.current) return;

    // location.stateにしおりデータがあるか確認
    if (location.state?.fromBookmark) {
      console.log('しおりからの遷移を検出:', location.state);

      // テキストフラグメントを処理
      if (location.state.textFragment) {
        console.log('テキストフラグメントを設定:', location.state.textFragment);
        setTextFragment(location.state.textFragment);
      }

      // ページ番号を設定
      if (location.state.pageNumber) {
        console.log('ページ番号を設定:', location.state.pageNumber);
        setCurrentPage(parseInt(location.state.pageNumber) || 1);
      }

      // 処理済みフラグを設定
      bookmarkProcessedRef.current = true;

      // location.stateを完全にクリア
      window.history.replaceState(null, document.title, window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchPost = async () => {
      try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'GET',
        credentials: 'include', // 認証情報を含める
        headers: {
          'Content-Type': 'application/json',
        }
      });
        if (!response.ok) {
          throw new Error(`小説の取得に失敗しました。ステータス: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          // しおりからの遷移の場合、ハイライト処理をしてから保存
          if (location.state?.fromBookmark && location.state.textFragment) {
            // HTMLコンテンツを処理するための要素を作成
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = data.content;

            // テキストフラグメントを検索してハイライト
            const paragraphs = tempDiv.querySelectorAll('p');
            let found = false;

            for (let i = 0; i < paragraphs.length; i++) {
              const paragraph = paragraphs[i];
              if (paragraph.textContent.includes(location.state.textFragment)) {
                const textFragment = location.state.textFragment;
                const safeTextFragment = textFragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const originalHTML = paragraph.innerHTML;
                const highlightedHTML = originalHTML.replace(
                  new RegExp(safeTextFragment, 'g'),
                  `<span id="highlighted-bookmark" style="background-color: yellow; padding: 2px 0;">${textFragment}</span>`
                );
                paragraph.innerHTML = highlightedHTML;
                found = true;
                console.log(`テキストフラグメント「${textFragment}」をハイライトしました`);
                break;
              }
            }

            if (!found) {
              console.log(`テキストフラグメント「${location.state.textFragment}」が見つかりませんでした`);
            }

            // 処理後のコンテンツを更新
            data.content = tempDiv.innerHTML;
          }

          setPost(data);
          setGoodCount(data.goodCounter);
          setViewCount(data.viewCounter);
          setBookshelfCount(data.bookShelfCounter);
          setPostDate(formatDate(data.createdAt));

          // シリーズ情報の取得
          await fetchSeriesData(data);

          // ビューカウントの更新
await fetch(`/api/views/${id}/view`, { 
  method: 'POST',
  credentials: 'include' // これを追加して認証Cookieを送信
});
          // ユーザー認証状態の確認
          try {
            const [likeResponse, bookshelfResponse, followResponse] = await Promise.all([
              fetch(`/api/posts/${id}/isLiked`, { credentials: 'include' }),
              fetch(`/api/posts/${id}/isInBookshelf`, { credentials: 'include' }),
              fetch(`/api/users/${data.author._id}/is-following`, { credentials: 'include' })
            ]);

            const likeData = await likeResponse.json();
            const bookshelfData = await bookshelfResponse.json();
            const followData = await followResponse.json();

            setHasLiked(likeData.hasLiked);
            setIsInBookshelf(bookshelfData.isInBookshelf);
            setIsFollowing(followData.isFollowing);

          } catch (authError) {
            console.error('認証状態の取得に失敗しました:', authError);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('小説の取得に失敗しました:', error);
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // 複数シリーズ情報を取得
    const fetchSeriesData = async (postData) => {
      if (!postData.series || !postData.series.length) return;

      // postData.seriesが配列でない場合は配列に変換（後方互換性のため）
      const seriesArray = Array.isArray(postData.series) ? postData.series : [postData.series];

      try {
        const seriesDataPromises = seriesArray.map(async (seriesId) => {
          const [seriesPostsResponse, seriesTitleResponse] = await Promise.all([
            fetch(`/api/series/${seriesId}/posts`),
            fetch(`/api/series/${seriesId}/title`)
          ]);

          if (!seriesPostsResponse.ok || !seriesTitleResponse.ok) {
            throw new Error(`シリーズID ${seriesId} の情報取得に失敗しました`);
          }

          const seriesPosts = await seriesPostsResponse.json();
          const seriesTitle = await seriesTitleResponse.json();

          return {
            seriesId,
            seriesTitle,
            seriesPosts
          };
        });

        const seriesDataResults = await Promise.all(seriesDataPromises);

        if (isMounted) {
          setAllSeriesData(seriesDataResults);
        }
      } catch (error) {
        console.error('シリーズデータの取得に失敗しました:', error);
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  const handleGoodClick = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}/good`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGoodCount(data.goodCounter);
        setHasLiked(data.hasLiked);
        showSnackbar(data.hasLiked ? 'いいねしました！' : 'いいねを取り消しました');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || 'いいねに失敗しました。', 'error');
      }
    } catch (error) {
      console.error('いいね機能でエラーが発生しました:', error);
      showSnackbar('いいねに失敗しました。', 'error');
    }
  }, [id]);

  const handleBookshelfClick = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}/bookshelf`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBookshelfCount(data.bookShelfCounter);
        setIsInBookshelf(data.isInBookshelf);
        showSnackbar(data.isInBookshelf ? '本棚に追加しました！' : '本棚から削除しました');
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.message || '本棚登録に失敗しました。', 'error');
      }
    } catch (error) {
      console.error('本棚登録でエラーが発生しました:', error);
      showSnackbar('本棚登録に失敗しました。', 'error');
    }
  }, [id]);

  const handleBookmarkClick = useCallback(() => {
    setIsBookmarkMode(!isBookmarkMode);
    if (!isBookmarkMode) {
      showSnackbar('しおりを設定するには、本文内の任意の場所をクリックしてください', 'info');
    }
  }, [isBookmarkMode]);

  const handleTextClick = useCallback(async (event, bookmarkInfo) => {
    if (isBookmarkMode) {
      try {
        // テキストフラグメントが存在し、5文字以上であることを再確認
        if (!bookmarkInfo.textFragment || bookmarkInfo.textFragment.length < 5) {
          showSnackbar('テキストが短すぎます。5文字以上の行を選択してください。', 'warning');
          return;
        }

        const response = await fetch(`/api/me/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            novelId: id,
            position: bookmarkInfo.position,
            pageNumber: bookmarkInfo.pageNumber,
            textFragment: bookmarkInfo.textFragment
          }),
        });

        if (response.ok) {
          showSnackbar('しおりを設定しました！');
        } else {
          showSnackbar('しおりの設定に失敗しました。', 'error');
        }
      } catch (error) {
        console.error('しおりの設定に失敗しました:', error);
        showSnackbar('しおりの設定に失敗しました。', 'error');
      } finally {
        setIsBookmarkMode(false);
      }
    }
  }, [id, isBookmarkMode]);

  const handleFollowToggle = useCallback(async () => {
    if (!post) return;

    try {
      const url = isFollowing
        ? `/api/users/unfollow/${post.author._id}`
        : `/api/users/follow/${post.author._id}`;
      const method = isFollowing ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          showSnackbar('ログインが必要です', 'warning');
          navigate('/login');
          return;
        }
        throw new Error('フォロー状態の更新に失敗しました');
      }

      setIsFollowing(!isFollowing);
      showSnackbar(isFollowing ? 'フォローを解除しました' : '作者をフォローしました！');
    } catch (error) {
      console.error('フォロー処理中にエラーが発生しました:', error);
      showSnackbar('フォロー状態の更新に失敗しました', 'error');
    }
  }, [post, isFollowing, navigate]);

  const handleSeriesChange = useCallback((event) => {
    const newPostId = event.target.value;
    setSelectedPostId(newPostId);
    navigate(`/novel/${newPostId}`);
  }, [navigate]);

  const handleTagClick = useCallback((tag) => {
    navigate(`/search?mustInclude=${encodeURIComponent(tag)}&type=posts`);
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh'
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          小説を読み込んでいます...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        textAlign: 'center',
        p: 3
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          エラーが発生しました
        </Typography>
        <Typography variant="body1" paragraph>
          {error}
        </Typography>
        <Typography variant="body2">
          ページを更新するか、しばらく経ってからもう一度お試しください。
        </Typography>
      </Box>
    );
  }

  if (!post) return null;

  // シリーズデータの準備
  const hasSeriesData = allSeriesData.length > 0;

  // 旧形式との互換性のためのデータ変換（単一シリーズの場合）
  const legacySeriesData = hasSeriesData && allSeriesData.length === 1 
  ? { 
      seriesTitle: allSeriesData[0].seriesTitle, 
      seriesPosts: allSeriesData[0].seriesPosts,
      seriesId: allSeriesData[0].seriesId // seriesIdを明示的に追加
    } 
  : null;

  return (
    <Fade in={!loading} timeout={500}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, position: 'relative' }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Grid container spacing={4}>
          {/* メインコンテンツ（小説と章節選択） */}
          <Grid item xs={12} md={9}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                background: theme.palette.background.paper,
                mb: 4
              }}
              ref={contentRef}
            >
              <NovelContent
                post={post}
                viewCount={viewCount}
                goodCount={goodCount}
                bookshelfCount={bookshelfCount}
                hasLiked={hasLiked}
                isBookmarkMode={isBookmarkMode}
                scrollSpeed={scrollSpeed}
                setScrollSpeed={setScrollSpeed}
                handleGoodClick={handleGoodClick}
                handleBookshelfClick={handleBookshelfClick}
                handleBookmarkClick={handleBookmarkClick}
                handleTextClick={handleTextClick}
                handleTagClick={handleTagClick}
                isInBookshelf={isInBookshelf}
                postDate={postDate}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                textFragment={textFragment}
                showSnackbar={showSnackbar}
                // シリーズナビゲーション用の新しいProps
                seriesData={hasSeriesData ? (allSeriesData.length === 1 ? legacySeriesData : allSeriesData) : null}
                currentPostId={id}
              />
            </Paper>

            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                background: theme.palette.background.paper
              }}
            >
              <CommentSection postId={id} />
            </Paper>
          </Grid>

          {/* サイドバー（作者情報とシリーズ） */}
          <Grid item xs={12} md={3}>
            <Box sx={{ top: 20 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2,
                  background: theme.palette.background.paper
                }}
              >
                <AuthorInfo
                  author={post.author}
                  isFollowing={isFollowing}
                  handleFollowToggle={handleFollowToggle}
                />
              </Paper>

              {hasSeriesData && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: theme.palette.background.paper,
                    mb: { xs: 3, md: 0 }
                  }}
                >
                  <SeriesSelector
                    seriesData={allSeriesData.length === 1 ? legacySeriesData : allSeriesData}
                    selectedPostId={selectedPostId}
                    handleSeriesChange={handleSeriesChange}
                  />
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
};

export default NovelDetail;