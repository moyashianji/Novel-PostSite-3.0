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
    
    // データをソート
    return getSortedData(filteredData, sortOption, tab);
  }, [
    tab, 
    ageFilter, 
    postTypeFilter, 
    lengthFilter, 
    seriesStatusFilter, 
    postsData, 
    seriesData, 
    usersData, 
    sortOption
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

  // 総ページ数の計算
  const totalPages = useMemo(() => {
    const totalItems = getTotalFilteredCount();
    return calculateTotalPages(totalItems, pageSize);
  }, [getTotalFilteredCount, pageSize]);
  
  // currentPageがtotalPagesを超える場合に調整
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
      
      // URLも更新
      const updatedParams = new URLSearchParams(location.search);
      updatedParams.set("page", totalPages.toString());
      navigate({ search: updatedParams.toString() }, { replace: true });
    }
  }, [currentPage, totalPages, location.search, navigate]);

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

  // URLパラメータ更新のヘルパー関数
  const updateUrlParams = useCallback((updates) => {
    const updatedParams = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        updatedParams.set(key, value.toString());
      } else {
        updatedParams.delete(key);
      }
    });
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    // ページトップにスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  // ページネーション処理
  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: newPage });
  }, [updateUrlParams]);

  // ページサイズ変更処理
  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    updateUrlParams({ size: newSize, page: 1 });
  }, [updateUrlParams]);

  // タブ切り替え処理
  const handleTabChange = useCallback((event, newValue) => {
    const updates = { type: newValue, page: 1 };
    
    // タブに応じてデフォルトの検索フィールドを設定
    if (newValue === "users") {
      updates.fields = "nickname,favoriteAuthors";
      updates.tagSearchType = "exact";
    } else if (newValue === "series") {
      updates.fields = "title,description,tags";
    } else { // posts
      updates.fields = "title,content,tags";
    }

    setTab(newValue);
    setCurrentPage(1);
    updateUrlParams(updates);
  }, [updateUrlParams]);

  // 年齢制限フィルター切り替え処理
  const handleAgeFilterChange = useCallback((event, newValue) => {
    setAgeFilter(newValue);
    setCurrentPage(1);
    updateUrlParams({ ageFilter: newValue, page: 1 });
  }, [updateUrlParams]);

  // ソートオプション切り替え処理
  const handleSortChange = useCallback((event, newValue) => {
    if (newValue === null) return;
    
    setSortOption(newValue);
    setCurrentPage(1);
    updateUrlParams({ sortBy: newValue, page: 1 });
  }, [updateUrlParams]);

  // 作品タイプフィルター変更ハンドラー
  const handlePostTypeFilterChange = useCallback((event, newValue) => {
    setPostTypeFilter(newValue);
    setCurrentPage(1);
    updateUrlParams({ postType: newValue, page: 1 });
  }, [updateUrlParams]);
  
  // 文字数フィルター変更ハンドラー
  const handleLengthFilterChange = useCallback((event, newValue) => {
    setLengthFilter(newValue);
    setCurrentPage(1);
    updateUrlParams({ length: newValue, page: 1 });
  }, [updateUrlParams]);
  
  // シリーズ状態フィルター変更ハンドラー
  const handleSeriesStatusFilterChange = useCallback((event, newValue) => {
    setSeriesStatusFilter(newValue);
    setCurrentPage(1);
    updateUrlParams({ seriesStatus: newValue, page: 1 });
  }, [updateUrlParams]);

  // タグクリックハンドラー
  const handleTagClick = useCallback((tag) => {
    updateUrlParams({ mustInclude: tag, page: 1 });
  }, [updateUrlParams]);

  // AIツールクリックハンドラー
  const handleAiToolClick = useCallback((tool) => {
    updateUrlParams({ aiTool: tool, page: 1 });
  }, [updateUrlParams]);

  // コンテストタグクリックハンドラー
  const handleContestTagClick = useCallback((tag) => {
    updateUrlParams({ 
      mustInclude: tag, 
      fields: "contestTags", 
      page: 1 
    });
  }, [updateUrlParams]);

  // AIツールフィルターをクリアする処理
  const clearAIToolFilter = useCallback(() => {
    updateUrlParams({ aiTool: null, page: 1 });
  }, [updateUrlParams]);

  // `searchParams.type`の変更を監視してタブを更新
  useEffect(() => {
    setTab(searchParams.type);
  }, [searchParams.type]);

  // searchParams.ageFilterの変更を監視してフィルターを更新
  useEffect(() => {
    setAgeFilter(searchParams.ageFilter);
  }, [searchParams.ageFilter]);
  
  // searchParams.postTypeの変更を監視してフィルターを更新
  useEffect(() => {
    setPostTypeFilter(searchParams.postType || "all");
  }, [searchParams.postType]);
  
  // searchParams.lengthの変更を監視してフィルターを更新
  useEffect(() => {
    setLengthFilter(searchParams.length || "all");
  }, [searchParams.length]);
  
  // searchParams.seriesStatusの変更を監視してフィルターを更新
  useEffect(() => {
    setSeriesStatusFilter(searchParams.seriesStatus || "all");
  }, [searchParams.seriesStatus]);

  // searchParams.sortByの変更を監視してソートオプションを更新
  useEffect(() => {
    setSortOption(searchParams.sortBy || "newest");
  }, [searchParams.sortBy]);

  return (
    <Container sx={{ mt: 4 }}>
      <SearchResultsHeader 
        searchParams={searchParams}
        tab={tab}
        onClearAIToolFilter={clearAIToolFilter}
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