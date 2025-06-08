import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Pagination, 
  Button, 
  IconButton,
  Fade,
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import CakeIcon from '@mui/icons-material/Cake';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import Auth context

const ContentContainer = styled(Paper)(({ theme, isbookmarkmode }) => ({
  position: 'relative',
  backgroundColor: isbookmarkmode === 'true' ? 'rgba(63, 81, 181, 0.05)' : theme.palette.background.paper,
  padding: theme.spacing(3, 4),
  cursor: isbookmarkmode === 'true' ? 'pointer' : 'default',
  borderRadius: 16,
  boxShadow: isbookmarkmode === 'true' ? '0 0 0 2px rgba(63, 81, 181, 0.3)' : 'none',
  transition: 'all 0.2s ease',
  marginBottom: theme.spacing(4),
  '&:hover': {
    backgroundColor: isbookmarkmode === 'true' ? 'rgba(63, 81, 181, 0.1)' : theme.palette.background.paper,
    boxShadow: isbookmarkmode === 'true' ? '0 0 0 3px rgba(63, 81, 181, 0.5), 0 6px 16px rgba(0, 0, 0, 0.05)' : 'none',
  },
}));

const RestrictionContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: 16,
  backgroundColor: 'rgba(250, 250, 250, 0.95)',
  marginBottom: theme.spacing(4),
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[3],
}));

const NovelText = styled(Typography)(({ theme }) => ({
  fontSize: '1.05rem',
  lineHeight: 1.9,
  letterSpacing: '0.01em',
  color: theme.palette.text.primary,
  
  '& p': {
    marginBottom: theme.spacing(2.5),
    textAlign: 'justify',
  },
  
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 8,
    margin: theme.spacing(2, 0),
  },
  
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    fontWeight: 700,
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(2),
}));

const PageNavigation = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
}));

const PageIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0.5, 2),
  borderRadius: 20,
  boxShadow: theme.shadows[1],
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
}));

const Content = memo(({ 
  content, 
  isBookmarkMode, 
  handleTextClick,
  handleBookmarkError,
  currentPage,
  setCurrentPage,
  textFragment,
  post // コンテンツがR18かどうかをチェックするためのprop
}) => { 
  const [pages, setPages] = useState([]);
  const [fadeIn, setFadeIn] = useState(true);
  const [displayedContent, setDisplayedContent] = useState('');
  const contentRef = useRef(null);
  const contentInitializedRef = useRef(false);
  const scrolledToHighlightRef = useRef(false);
  // コンポーネントのマウント状態を追跡
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  // 認証状態を取得
  const { isAuthenticated, user, loading } = useAuth();
  
  // 初回レンダリング後にフラグを更新
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
    }
  }, [isInitialMount]);
  
  // ユーザーが18歳以上かどうかをチェック
  const isOver18 = useCallback(() => {
    if (!user || !user.dob) return false;
    
    try {
      const birthDate = new Date(user.dob);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // 今年の誕生日がまだ来ていない場合は1年引く
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      console.log('年齢計算:', age, '歳');
      return age >= 18;
    } catch (error) {
      console.error('年齢計算エラー:', error);
      return false;
    }
  }, [user]);
  
  // R18ステータスとユーザーの年齢に基づいてコンテンツが表示可能かどうかをチェック
  const canViewContent = useCallback(() => {
    // R18コンテンツでなければ誰でも閲覧可能
    if (!post || !post.isAdultContent) return true;
    
    // 認証情報の読み込み中は一時的にコンテンツを表示
    if (loading) return true;
    
    // R18コンテンツの場合、ユーザーは認証済みで誕生日が設定されていて18歳以上である必要がある
    return isAuthenticated && user?.dob && isOver18();
  }, [post, isAuthenticated, user, isOver18, loading]);

  // HTMLからテキストだけを抽出する関数
  const extractTextFromHtml = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // ページ分割ロジック - コンポーネントのマウント時に一度だけ実行
  useEffect(() => {
    if (!content || contentInitializedRef.current) return;
    
    console.log("Content.js: 初期ページ分割を実行します");

    // ページの分割処理
    const pageMarker = '--page--';
    const contentPages = content.split(pageMarker).map(page => page.trim());
    const filteredPages = contentPages.filter(page => page.length > 0);
    
    // 空の場合は空の文字列を1ページとして設定
    const finalPages = filteredPages.length > 0 ? filteredPages : [''];
    setPages(finalPages);
    
    // ページ範囲の確認
    let validPage = currentPage;
    if (currentPage > finalPages.length) {
      validPage = 1;
      setCurrentPage(1);
    }
    
    // 現在のページの内容を設定
    setDisplayedContent(finalPages[validPage - 1] || '');
    
    // 初期化完了フラグを設定
    contentInitializedRef.current = true;
    
    console.log(`Content.js: ページ分割完了 - 合計${finalPages.length}ページ, 現在のページ: ${validPage}`);
    
  }, [content, currentPage, setCurrentPage]);

  // 現在のページが変わったときに表示内容を更新
  useEffect(() => {
    // まだ初期化されていない場合はスキップ
    if (!contentInitializedRef.current) return;
    
    console.log(`Content.js: ページ状態更新 - 現在のページ: ${currentPage}, 全ページ数: ${pages.length}`);
    
    if (pages.length > 0 && currentPage > 0 && currentPage <= pages.length) {
      // ページ内容を更新
      const newContent = pages[currentPage - 1] || '';
      
      // フェードアウト -> コンテンツ更新 -> フェードイン
      setFadeIn(false);
      
      setTimeout(() => {
        setDisplayedContent(newContent);
        console.log(`ページ${currentPage}の内容を更新しました`);
        
        // ハイライト要素のスクロール処理をリセット
        scrolledToHighlightRef.current = false;
        
        setTimeout(() => {
          setFadeIn(true);
        }, 50);
      }, 150);
    }
  }, [currentPage, pages]);

  // ハイライト要素にスクロールする
  useEffect(() => {
    if (fadeIn && !scrolledToHighlightRef.current) {
      // ページの表示が完了するのを少し待ってからスクロール処理
      const timer = setTimeout(() => {
        if (contentRef.current) {
          // ハイライト要素を探す
          const highlightedElement = contentRef.current.querySelector('#highlighted-bookmark');
          
          if (highlightedElement) {
            console.log('ハイライト要素を見つけました、スクロールします');
            
            // 要素の位置を計算し、中央にスクロール
            highlightedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
            
            // スクロール済みフラグを設定
            scrolledToHighlightRef.current = true;
          }
        }
      }, 300); // ページの表示が完了し、DOM要素が更新されるのを待つ
      
      return () => clearTimeout(timer);
    }
  }, [fadeIn, displayedContent]);

  // ページ変更ハンドラ
  const handlePageChange = useCallback((event, newPage) => {
    if (newPage === currentPage || newPage <= 0 || newPage > pages.length) return;
    
    console.log(`ページ切り替え: ${currentPage} -> ${newPage}`);
    setCurrentPage(newPage);
    
    // スクロール位置をリセット
    window.scrollTo({
      top: contentRef.current?.offsetTop - 100 || 0,
      behavior: 'smooth'
    });
  }, [currentPage, pages.length, setCurrentPage]);

  // 次のページへ
  const goToNextPage = useCallback(() => {
    if (currentPage < pages.length) {
      handlePageChange(null, currentPage + 1);
    }
  }, [currentPage, pages.length, handlePageChange]);

  // 前のページへ
  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(null, currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

// しおり機能のコンテンツクリックハンドラ
const handleContentClick = useCallback((event) => {
  if (!isBookmarkMode) return;

  // クリックされた要素を取得
  const clickedElement = event.target;
  
  // 段落要素を検索
  let paragraphElement = clickedElement;
  while (paragraphElement && paragraphElement.tagName !== 'P' && paragraphElement !== contentRef.current) {
    paragraphElement = paragraphElement.parentElement;
  }

  // ページのスクロール位置を取得
  const scrollPosition = window.scrollY + event.clientY;
  
  // 周辺のテキスト断片（最大100文字）を取得
  let textFrag = '';
  if (paragraphElement && paragraphElement.tagName === 'P') {
    // HTMLタグを除去してプレーンテキストを取得
    const paragraphText = extractTextFromHtml(paragraphElement.innerHTML);
    
    // テキストが5文字未満の場合、しおりを設定しない
    if (paragraphText.length < 5) {
      console.log('テキストが短すぎるため、しおりを設定できません（5文字以上必要）');
      // スナックバーでユーザーに通知（親コンポーネントに通知関数がある場合）
      if (typeof handleBookmarkError === 'function') {
        handleBookmarkError('テキストが短すぎます。5文字以上の行を選択してください。');
      }
      return;
    }
    
    // クリック位置に近いテキスト断片を取得（最大100文字）
    if (paragraphText.length > 100) {
      // クリック位置を推定し、その周辺のテキストを取得
      const clickPositionInElement = Math.floor(paragraphText.length / 2); // 単純に中央と仮定
      const startPos = Math.max(0, clickPositionInElement - 50);
      textFrag = paragraphText.substring(startPos, startPos + 100);
    } else {
      textFrag = paragraphText;
    }
  } else {
    // 段落要素が見つからない場合、しおりを設定しない
    console.log('有効なテキスト位置が見つかりません');
    if (typeof handleBookmarkError === 'function') {
      handleBookmarkError('有効なテキスト位置を選択してください。');
    }
    return;
  }

  // ブックマーク情報をまとめる
  const bookmarkInfo = {
    position: scrollPosition,
    pageNumber: currentPage,
    textFragment: textFrag
  };

  // 親コンポーネントにブックマーク情報を渡す
  handleTextClick(event, bookmarkInfo);
}, [isBookmarkMode, currentPage, handleTextClick, handleBookmarkError]);

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (event) => {
      // インプットフィールドでの入力時はスキップ
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }
      
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        goToNextPage();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        goToPrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNextPage, goToPrevPage]);

  // 複数ページがある場合のみページネーションを表示
  const showPagination = pages.length > 1;

  // 認証情報の読み込み中または初回マウント時は制限画面を表示しない
  if (post?.isAdultContent && !canViewContent() && !loading && !isInitialMount) {
    return (
      <RestrictionContainer elevation={3}>
        <WarningIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
          年齢制限コンテンツ
        </Typography>
        <Typography variant="body1" paragraph>
          このコンテンツは成人向け（R18）です。閲覧するには18歳以上である必要があります。
        </Typography>
        
        {!isAuthenticated ? (
          // 未ログインの場合 - ログインボタンを表示
          <Stack spacing={2} alignItems="center" mt={3}>
            <Alert severity="info" sx={{ mb: 2, maxWidth: 400 }}>
              閲覧するにはログインが必要です
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PersonIcon />}
              component={Link}
              to="/login"
              size="large"
              sx={{ borderRadius: 28, px: 4 }}
            >
              ログインする
            </Button>
          </Stack>
        ) : !user?.dob ? (
          // ログイン済みだが誕生日未設定の場合
          <Stack spacing={2} alignItems="center" mt={3}>
            <Alert severity="info" sx={{ mb: 2, maxWidth: 400 }}>
              年齢確認のために生年月日の設定が必要です
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<CakeIcon />}
              component={Link}
              to="/mypage"
              size="large"
              sx={{ borderRadius: 28, px: 4 }}
            >
              マイページで設定する
            </Button>
          </Stack>
        ) : (
          // ログイン済み、誕生日設定済みだが18歳未満の場合
          <Stack spacing={2} alignItems="center" mt={3}>
            <Alert severity="warning" sx={{ mb: 2, maxWidth: 400 }}>
              このコンテンツは18歳以上のユーザーのみが閲覧できます
            </Alert>
            <LockIcon color="action" sx={{ fontSize: 36, mt: 2, opacity: 0.5 }} />
          </Stack>
        )}
      </RestrictionContainer>
    );
  }

  return (
    <>
      {showPagination && (
        <PaginationContainer>
          <IconButton 
            onClick={goToPrevPage} 
            disabled={currentPage <= 1}
            color="primary"
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          <PageIndicator>
            <MenuBookIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
            <Typography variant="body2" fontWeight="medium">
              {currentPage} / {pages.length}
            </Typography>
          </PageIndicator>
          
          <IconButton 
            onClick={goToNextPage} 
            disabled={currentPage >= pages.length}
            color="primary"
          >
            <NavigateNextIcon />
          </IconButton>
        </PaginationContainer>
      )}
      
      <ContentContainer 
        onClick={handleContentClick}
        isbookmarkmode={isBookmarkMode ? 'true' : 'false'}
        elevation={0}
        ref={contentRef}
      >
        <Fade in={fadeIn} timeout={150}>
          <div>
            <NovelText variant="body1" paragraph>
              <div 
                id={`page-content-${currentPage}`} 
                dangerouslySetInnerHTML={{ __html: displayedContent }} 
              />
            </NovelText>
          </div>
        </Fade>
      </ContentContainer>
      
      {showPagination && (
        <PageNavigation>
          <Button
            variant="outlined"
            startIcon={<NavigateBeforeIcon />}
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            sx={{ borderRadius: 28 }}
          >
            前のページ
          </Button>
          
          <Pagination 
            count={pages.length} 
            page={currentPage}
            onChange={handlePageChange}
            size="medium"
            color="primary"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
          
          <Button
            variant="outlined"
            endIcon={<NavigateNextIcon />}
            onClick={goToNextPage}
            disabled={currentPage >= pages.length}
            sx={{ borderRadius: 28 }}
          >
            次のページ
          </Button>
        </PageNavigation>
      )}
    </>
  );
});

export default Content;