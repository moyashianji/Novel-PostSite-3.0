import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container } from "@mui/material";

// Utility imports
import { 
  parseSearchParams, 
  calculateTotalPages, 
  calculateResultsInfo 
} from "../components/search/utils/searchUtils";
import { 
  getPostsByLength, 
  getPostsByType, 
  getSeriesByStatus, 
  getSortedData 
} from "../components/search/utils/filterUtils";

// Custom hooks
import { useSearchData } from "../components/search/hooks/useSearchData";

// Component imports
import SearchResultsHeader from "../components/search/SearchResultsHeader";
import SearchTabs from "../components/search/SearchTabs";
import AgeFilterTabs from "../components/search/filters/AgeFilterTabs";
import PostTypeFilterTabs from "../components/search/filters/PostTypeFilterTabs";
import LengthFilterTabs from "../components/search/filters/LengthFilterTabs";
import SeriesStatusFilterTabs from "../components/search/filters/SeriesStatusFilterTabs";
import SortTabs from "../components/search/filters/SortTabs";
import TagCloud from "../components/search/clouds/TagCloud";
import AiToolCloud from "../components/search/clouds/AiToolCloud";
import ContestTagCloud from "../components/search/clouds/ContestTagCloud";
import SearchResultsContent from "../components/search/content/SearchResultsContent";
import SearchResultsInfo from "../components/search/content/SearchResultsInfo";
import SearchPagination from "../components/search/content/SearchPagination";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // URLから検索パラメータを取得
  const searchParams = useMemo(() => parseSearchParams(location.search), [location.search]);

  // 状態管理
  const [tab, setTab] = useState(searchParams.type);
  const [ageFilter, setAgeFilter] = useState(searchParams.ageFilter);
  const [sortOption, setSortOption] = useState(searchParams.sortBy);
  const [currentPage, setCurrentPage] = useState(searchParams.page);
  const [pageSize, setPageSize] = useState(searchParams.size);
  const [paginatedData, setPaginatedData] = useState([]);
  
  // タブフィルターの状態管理
  const [postTypeFilter, setPostTypeFilter] = useState(searchParams.postType || "all");
  const [lengthFilter, setLengthFilter] = useState(searchParams.length || "all");
  const [seriesStatusFilter, setSeriesStatusFilter] = useState(searchParams.seriesStatus || "all");

  // カスタムフックから検索データを取得
  const {
    postsData,
    seriesData,
    usersData,
    followedUsers,
    loading,
    error,
    fetchingMore,
    hasMore,
    tagCounts,
    aiToolCounts,
    contestTagCounts,
    loadMoreData,
    handleFollowToggle
  } = useSearchData(searchParams, tab);

  // すべてのフィルターが適用された後のデータセットを取得
  const getCurrentDataset = useMemo(() => {
    if (tab === 'users') return usersData;
    
    // データソースの選択
    const dataSource = tab === 'posts' ? postsData : seriesData;
    let filteredData = dataSource[ageFilter] || [];
    
    // 追加フィルター
    if (tab === 'posts') {
      // 作品タイプでフィルタリング
      filteredData = getPostsByType(filteredData, postTypeFilter);
      
      // 文字数でフィルタリング
      filteredData = getPostsByLength(filteredData, lengthFilter);
    } else if (tab === 'series') {
      // シリーズ状態でフィルタリング
      filteredData = getSeriesByStatus(filteredData, seriesStatusFilter);
    }
    
    // データをソート（コンテストタグソートを含む）
    return getSortedData(filteredData, sortOption, tab, searchParams.contestTag);
  }, [
    tab, 
    ageFilter, 
    postTypeFilter, 
    lengthFilter, 
    seriesStatusFilter, 
    postsData, 
    seriesData, 
    usersData, 
    sortOption,
    searchParams.contestTag
  ]);
  
  // 各フィルター適用後の正確な件数を計算する関数
  const getTotalFilteredCount = useCallback(() => {
    if (tab === 'users') return usersData.length;
    
    const dataSource = tab === 'posts' ? postsData : seriesData;
    let baseData = dataSource[ageFilter] || [];
    
    // 追加フィルターの適用
    if (tab === 'posts') {
      // 作品タイプでフィルタリング
      baseData = getPostsByType(baseData, postTypeFilter);
      
      // 文字数でフィルタリング
      baseData = getPostsByLength(baseData, lengthFilter);
    } else if (tab === 'series') {
      // シリーズ状態でフィルタリング
      baseData = getSeriesByStatus(baseData, seriesStatusFilter);
    }
    
    return baseData.length;
  }, [
    tab,
    ageFilter,
    postTypeFilter,
    lengthFilter,
    seriesStatusFilter,
    postsData,
    seriesData,
    usersData
  ]);

  // 総ページ数の計算（データ読み込み中は現在のページを最小値とする）
  const totalPages = useMemo(() => {
    const totalItems = getTotalFilteredCount();
    const calculatedPages = calculateTotalPages(totalItems, pageSize);
    
    // データ読み込み中で、現在のページが計算されたページ数より大きい場合は
    // 現在のページを最小値として使用（データ読み込み後に正しい値になる）
    if (loading && currentPage > calculatedPages) {
      return Math.max(calculatedPages, currentPage);
    }
    
    return calculatedPages;
  }, [getTotalFilteredCount, pageSize, loading, currentPage]);
  
  // currentPageがtotalPagesを超える場合に調整（データ読み込み後のみ）
  useEffect(() => {
    // データがまだ読み込まれていない場合は処理をスキップ
    const hasData = (tab === 'posts' && postsData.all.length > 0) ||
                   (tab === 'series' && seriesData.all.length > 0) ||
                   (tab === 'users' && usersData.length > 0);
    
    if (!hasData || loading) return;
    
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      
      // URLも更新
      const updatedParams = new URLSearchParams(location.search);
      updatedParams.set("page", totalPages.toString());
      navigate({ search: updatedParams.toString() }, { replace: true });
    }
  }, [currentPage, totalPages, location.search, navigate, tab, postsData.all.length, seriesData.all.length, usersData.length, loading]);

  // 現在のページに表示するデータを計算
  useEffect(() => {
    const dataset = getCurrentDataset;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // もしendIndexがデータセットの長さを超えていて、まだ読み込むデータがある場合は追加データを読み込む
    if (endIndex > dataset.length && hasMore) {
      loadMoreData();
    }
    
    // 現在のページに表示するデータをセット
    setPaginatedData(dataset.slice(startIndex, endIndex));
  }, [getCurrentDataset, currentPage, pageSize, hasMore, loadMoreData]);

  // 検索結果情報表示
  const resultsInfo = useMemo(() => {
    const totalCount = getTotalFilteredCount();
    return calculateResultsInfo(currentPage, pageSize, totalCount);
  }, [currentPage, pageSize, getTotalFilteredCount]);

  // ページネーション処理
  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
    
    // URLも更新（ページ変更時はreplace: falseで履歴に残す）
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("page", newPage.toString());
    navigate({ search: updatedParams.toString() });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  // ページサイズ変更処理
  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // ページサイズ変更時はページを1に戻す
    
    // URLも更新
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("size", newSize.toString());
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() }, { replace: true });
  }, [location.search, navigate]);

  // タブ切り替え処理
  const handleTabChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("type", newValue);
    updatedParams.set("page", "1");
    
    // タブに応じてデフォルトの検索フィールドを設定
    if (newValue === "users") {
      updatedParams.set("fields", "nickname,favoriteAuthors");
      updatedParams.set("tagSearchType", "exact");
    } else if (newValue === "series") {
      updatedParams.set("fields", "title,description,tags");
    } else { // posts
      updatedParams.set("fields", "title,content,tags");
    }

    setTab(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  // 年齢制限フィルター切り替え処理
  const handleAgeFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("ageFilter", newValue);
    updatedParams.set("page", "1");
    setAgeFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  // ソートオプション切り替え処理
  const handleSortChange = useCallback((event, newValue) => {
    if (newValue === null) return; // タブクリック時にnullが来た場合は無視
    
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("sortBy", newValue);
    updatedParams.set("page", "1");
    setSortOption(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  // 作品タイプフィルター変更ハンドラー
  const handlePostTypeFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("postType", newValue);
    updatedParams.set("page", "1");
    setPostTypeFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);
  
  // 文字数フィルター変更ハンドラー
  const handleLengthFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("length", newValue);
    updatedParams.set("page", "1");
    setLengthFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);
  
  // シリーズ状態フィルター変更ハンドラー
  const handleSeriesStatusFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("seriesStatus", newValue);
    updatedParams.set("page", "1");
    setSeriesStatusFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  // タグクリックハンドラー
  const handleTagClick = useCallback((tag) => {
    // 検索クエリを更新
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("mustInclude", tag);
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  // AIツールクリックハンドラー
  const handleAiToolClick = useCallback((tool) => {
    // 検索クエリを更新
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("aiTool", tool);
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  // AIツールフィルターをクリアする処理
  const clearAIToolFilter = useCallback(() => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete("aiTool");
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  // コンテストタグクリアハンドラー
  const clearContestTagFilter = useCallback(() => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete("contestTag");
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  // コンテストタグクリックハンドラー（コンテストタグクラウド用）
  const handleContestTagClick = useCallback((tag) => {
    // 検索クエリを更新（コンテストタグ検索）
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("contestTag", tag);
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  // URLパラメータと状態の同期を確実にする
  useEffect(() => {
    const params = parseSearchParams(location.search);
    
    // currentPageの同期（データ読み込み中は元のページを保持）
    if (params.page !== currentPage && !loading) {
      setCurrentPage(params.page);
    }
    
    // その他の状態の同期
    if (params.type !== tab) setTab(params.type);
    if (params.ageFilter !== ageFilter) setAgeFilter(params.ageFilter);
    if (params.sortBy !== sortOption) setSortOption(params.sortBy);
    if (params.size !== pageSize) setPageSize(params.size);
    if (params.postType !== postTypeFilter) setPostTypeFilter(params.postType || "all");
    if (params.length !== lengthFilter) setLengthFilter(params.length || "all");
    if (params.seriesStatus !== seriesStatusFilter) setSeriesStatusFilter(params.seriesStatus || "all");
  }, [location.search, currentPage, tab, ageFilter, sortOption, pageSize, postTypeFilter, lengthFilter, seriesStatusFilter, loading]);

  return (
    <Container sx={{ mt: 4 }}>
      <SearchResultsHeader 
        searchParams={searchParams}
        tab={tab}
        onClearAIToolFilter={clearAIToolFilter}
        onClearContestTagFilter={clearContestTagFilter}
      />

      <SearchTabs 
        tab={tab}
        onTabChange={handleTabChange}
        postsCount={postsData.totalCounts.all}
        seriesCount={seriesData.totalCounts.all}
        usersCount={usersData.length}
      />

      <AgeFilterTabs 
        ageFilter={ageFilter}
        onAgeFilterChange={handleAgeFilterChange}
        totalCounts={tab === 'posts' ? postsData.totalCounts : seriesData.totalCounts}
        tab={tab}
      />

      <PostTypeFilterTabs 
        postTypeFilter={postTypeFilter}
        onPostTypeFilterChange={handlePostTypeFilterChange}
        postsData={postsData}
        ageFilter={ageFilter}
        tab={tab}
      />

      <LengthFilterTabs 
        lengthFilter={lengthFilter}
        onLengthFilterChange={handleLengthFilterChange}
        postsData={postsData}
        ageFilter={ageFilter}
        postTypeFilter={postTypeFilter}
        tab={tab}
      />

      <SeriesStatusFilterTabs 
        seriesStatusFilter={seriesStatusFilter}
        onSeriesStatusFilterChange={handleSeriesStatusFilterChange}
        seriesData={seriesData}
        ageFilter={ageFilter}
        tab={tab}
      />

      <SortTabs 
        sortOption={sortOption}
        onSortChange={handleSortChange}
        tab={tab}
      />

      <TagCloud 
        tagCounts={tagCounts}
        onTagClick={handleTagClick}
        tab={tab}
      />
      
      <AiToolCloud 
        aiToolCounts={aiToolCounts}
        onAiToolClick={handleAiToolClick}
        tab={tab}
      />

      <ContestTagCloud 
        contestTagCounts={contestTagCounts}
        onContestTagClick={handleContestTagClick}
        tab={tab}
      />

      <SearchResultsInfo 
        resultsInfo={resultsInfo}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      <SearchResultsContent 
        loading={loading}
        error={error}
        paginatedData={paginatedData}
        fetchingMore={fetchingMore}
        tab={tab}
        ageFilter={ageFilter}
        totalCount={getTotalFilteredCount()}
        followedUsers={followedUsers}
        onFollowToggle={handleFollowToggle}
      />

      <SearchPagination 
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        hasMore={hasMore}
        currentDatasetLength={getCurrentDataset.length}
        totalFilteredCount={getTotalFilteredCount()}
        fetchingMore={fetchingMore}
        onLoadMore={loadMoreData}
      />
    </Container>
  );
};

export default SearchResults;