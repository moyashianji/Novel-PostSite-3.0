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
import DetailedSortModal from "../components/search/DetailedSortModal";

// 詳細フィルター適用関数（作品用）
const applyDetailedPostsFilter = (posts, detailedFilters) => {
  if (!posts || !Array.isArray(posts)) return [];
  
  let filteredPosts = [...posts];
  
  if (detailedFilters.minWordCount) {
    filteredPosts = filteredPosts.filter(post => 
      post.wordCount >= detailedFilters.minWordCount
    );
  }
  
  if (detailedFilters.maxWordCount) {
    filteredPosts = filteredPosts.filter(post => 
      post.wordCount <= detailedFilters.maxWordCount
    );
  }
  
  if (detailedFilters.startDate) {
    filteredPosts = filteredPosts.filter(post => 
      new Date(post.createdAt) >= detailedFilters.startDate
    );
  }
  
  if (detailedFilters.endDate) {
    const endOfDay = new Date(detailedFilters.endDate);
    endOfDay.setHours(23, 59, 59, 999);
    filteredPosts = filteredPosts.filter(post => 
      new Date(post.createdAt) <= endOfDay
    );
  }
  
  return filteredPosts;
};

// 詳細フィルター適用関数（シリーズ用）
const applyDetailedSeriesFilter = (series, detailedFilters) => {
  if (!series || !Array.isArray(series)) return [];
  
  let filteredSeries = [...series];
  
  if (detailedFilters.minWorksCount) {
    filteredSeries = filteredSeries.filter(s => 
      s.worksCount >= detailedFilters.minWorksCount
    );
  }
  
  if (detailedFilters.maxWorksCount) {
    filteredSeries = filteredSeries.filter(s => 
      s.worksCount <= detailedFilters.maxWorksCount
    );
  }
  
  if (detailedFilters.seriesStartDate) {
    filteredSeries = filteredSeries.filter(s => 
      new Date(s.createdAt) >= detailedFilters.seriesStartDate
    );
  }
  
  if (detailedFilters.seriesEndDate) {
    const endOfDay = new Date(detailedFilters.seriesEndDate);
    endOfDay.setHours(23, 59, 59, 999);
    filteredSeries = filteredSeries.filter(s => 
      new Date(s.createdAt) <= endOfDay
    );
  }
  
  return filteredSeries;
};

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
  
  // 詳細設定モーダルの状態管理
  const [detailedModalOpen, setDetailedModalOpen] = useState(false);
  const [detailedFilters, setDetailedFilters] = useState({
    // 作品用フィルター
    minWordCount: searchParams.minWordCount || null,
    maxWordCount: searchParams.maxWordCount || null,
    startDate: searchParams.startDate || null,
    endDate: searchParams.endDate || null,
    // シリーズ用フィルター
    minWorksCount: searchParams.minWorksCount || null,
    maxWorksCount: searchParams.maxWorksCount || null,
    seriesStartDate: searchParams.seriesStartDate || null,
    seriesEndDate: searchParams.seriesEndDate || null,
  });

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

  // 詳細フィルターが有効かどうかを判定
  const hasActiveDetailedFilters = useMemo(() => {
    if (tab === 'posts') {
      return !!(
        detailedFilters.minWordCount ||
        detailedFilters.maxWordCount ||
        detailedFilters.startDate ||
        detailedFilters.endDate
      );
    } else if (tab === 'series') {
      return !!(
        detailedFilters.minWorksCount ||
        detailedFilters.maxWorksCount ||
        detailedFilters.seriesStartDate ||
        detailedFilters.seriesEndDate
      );
    }
    return false;
  }, [tab, detailedFilters]);

  // 詳細フィルター適用済みデータ（年齢フィルター適用済みデータに対して詳細フィルターを適用）
  const detailedFilteredData = useMemo(() => {
    if (tab === 'users') return { all: usersData, general: [], r18: [] };
    
    const sourceData = tab === 'posts' ? postsData : seriesData;
    
    if (!hasActiveDetailedFilters) {
      // 詳細フィルターが無効な場合は元のデータをそのまま返す
      return sourceData;
    }
    
    // 詳細フィルターを適用
    const applyDetailedFilter = tab === 'posts' ? applyDetailedPostsFilter : applyDetailedSeriesFilter;
    
    return {
      all: applyDetailedFilter(sourceData.all, detailedFilters),
      general: applyDetailedFilter(sourceData.general, detailedFilters),
      r18: applyDetailedFilter(sourceData.r18, detailedFilters),
      totalCounts: sourceData.totalCounts // 元の総数は保持
    };
  }, [tab, postsData, seriesData, usersData, hasActiveDetailedFilters, detailedFilters]);

  // すべてのフィルターが適用された後のデータセットを取得（既存ロジックを維持）
  const getCurrentDataset = useMemo(() => {
    if (tab === 'users') return usersData;
    
    // 詳細フィルター適用済みデータから年齢フィルターでデータを選択
    let filteredData = detailedFilteredData[ageFilter] || [];
    
    // 既存のフィルター適用（作品タイプ、文字数、シリーズ状態）
    if (tab === 'posts') {
      // 作品タイプでフィルタリング
      filteredData = getPostsByType(filteredData, postTypeFilter);
      
      // 文字数でフィルタリング（既存の文字数フィルターとは別の機能）
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
    detailedFilteredData, 
    usersData, 
    sortOption,
    searchParams.contestTag
  ]);

  // 各フィルター適用後の正確な件数を計算する関数（詳細フィルターを考慮）
  const getTotalFilteredCount = useCallback(() => {
    if (tab === 'users') return usersData.length;
    
    // 詳細フィルター適用済みデータから年齢フィルターでデータを選択
    let baseData = detailedFilteredData[ageFilter] || [];
    
    // 既存フィルターの適用
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
    detailedFilteredData,
    usersData
  ]);

  // 詳細設定モーダルを開く
  const handleOpenDetailedModal = () => {
    setDetailedModalOpen(true);
  };

  // 詳細設定モーダルを閉じる
  const handleCloseDetailedModal = () => {
    setDetailedModalOpen(false);
  };

  // 詳細フィルターを適用
  const handleApplyDetailedFilters = (filters) => {
    setDetailedFilters(filters);
    setCurrentPage(1);
    
    // URLにフィルターパラメータを追加
    const updatedParams = new URLSearchParams(location.search);
    
    if (tab === 'posts') {
      // 作品用パラメータ
      if (filters.minWordCount) {
        updatedParams.set("minWordCount", filters.minWordCount.toString());
      } else {
        updatedParams.delete("minWordCount");
      }
      
      if (filters.maxWordCount) {
        updatedParams.set("maxWordCount", filters.maxWordCount.toString());
      } else {
        updatedParams.delete("maxWordCount");
      }
      
      if (filters.startDate) {
        updatedParams.set("startDate", filters.startDate.toISOString());
      } else {
        updatedParams.delete("startDate");
      }
      
      if (filters.endDate) {
        updatedParams.set("endDate", filters.endDate.toISOString());
      } else {
        updatedParams.delete("endDate");
      }
    } else if (tab === 'series') {
      // シリーズ用パラメータ
      if (filters.minWorksCount) {
        updatedParams.set("minWorksCount", filters.minWorksCount.toString());
      } else {
        updatedParams.delete("minWorksCount");
      }
      
      if (filters.maxWorksCount) {
        updatedParams.set("maxWorksCount", filters.maxWorksCount.toString());
      } else {
        updatedParams.delete("maxWorksCount");
      }
      
      if (filters.seriesStartDate) {
        updatedParams.set("seriesStartDate", filters.seriesStartDate.toISOString());
      } else {
        updatedParams.delete("seriesStartDate");
      }
      
      if (filters.seriesEndDate) {
        updatedParams.set("seriesEndDate", filters.seriesEndDate.toISOString());
      } else {
        updatedParams.delete("seriesEndDate");
      }
    }
    
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() }, { replace: true });
  };

  // アクティブな詳細フィルターの数を計算
  const getActiveDetailedFiltersCount = () => {
    let count = 0;
    if (tab === 'posts') {
      if (detailedFilters.minWordCount) count++;
      if (detailedFilters.maxWordCount) count++;
      if (detailedFilters.startDate) count++;
      if (detailedFilters.endDate) count++;
    } else if (tab === 'series') {
      if (detailedFilters.minWorksCount) count++;
      if (detailedFilters.maxWorksCount) count++;
      if (detailedFilters.seriesStartDate) count++;
      if (detailedFilters.seriesEndDate) count++;
    }
    return count;
  };

  // 総ページ数の計算
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

  // ページネーション用データの更新
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

  // 既存のハンドラー関数の実装
  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
    
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("page", newPage.toString());
    navigate({ search: updatedParams.toString() });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handlePageSizeChange = useCallback((event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("size", newSize.toString());
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() }, { replace: true });
  }, [location.search, navigate]);

  const handleTabChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("type", newValue);
    updatedParams.set("page", "1");
    
    if (newValue === "users") {
      updatedParams.set("fields", "nickname,favoriteAuthors");
      updatedParams.set("tagSearchType", "exact");
    } else if (newValue === "series") {
      updatedParams.set("fields", "title,description,tags");
    } else {
      updatedParams.set("fields", "title,content,tags");
    }

    setTab(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handleAgeFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("ageFilter", newValue);
    updatedParams.set("page", "1");
    setAgeFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handleSortChange = useCallback((event, newValue) => {
    if (newValue === null) return;
    
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("sortBy", newValue);
    updatedParams.set("page", "1");
    setSortOption(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handlePostTypeFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("postType", newValue);
    updatedParams.set("page", "1");
    setPostTypeFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handleLengthFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("length", newValue);
    updatedParams.set("page", "1");
    setLengthFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handleSeriesStatusFilterChange = useCallback((event, newValue) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("seriesStatus", newValue);
    updatedParams.set("page", "1");
    setSeriesStatusFilter(newValue);
    setCurrentPage(1);
    navigate({ search: updatedParams.toString() }, { replace: true });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.search, navigate]);

  const handleTagClick = useCallback((tag) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("mustInclude", tag);
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  const handleAiToolClick = useCallback((tool) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("aiTool", tool);
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

  const handleContestTagClick = useCallback((tag) => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("contestTag", tag);
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

  return (
    <Container>
      <SearchResultsHeader 
        searchParams={searchParams}
        loading={loading}
        totalCounts={tab === 'users' ? { users: usersData.length } : 
                     tab === 'posts' ? postsData.totalCounts : seriesData.totalCounts}
        tab={tab}
        onClearAIToolFilter={clearAIToolFilter}
        onClearContestTagFilter={clearContestTagFilter}
      />

      <SearchTabs 
        tab={tab}
        onTabChange={handleTabChange}
        postsCount={postsData.totalCounts?.all || 0}
        seriesCount={seriesData.totalCounts?.all || 0}
        usersCount={usersData.length || 0}
      />

      {/* 詳細設定ボタンはSearchResultsInfoコンポーネント内に移動 */}

      <AgeFilterTabs 
        ageFilter={ageFilter}
        onAgeFilterChange={handleAgeFilterChange}
        postsData={detailedFilteredData}
        seriesData={detailedFilteredData}
        usersData={usersData}
        totalCounts={tab === 'users' ? { users: usersData.length } : 
                     detailedFilteredData.totalCounts}
        tab={tab}
      />

      <PostTypeFilterTabs 
        postTypeFilter={postTypeFilter}
        onPostTypeFilterChange={handlePostTypeFilterChange}
        postsData={detailedFilteredData}
        ageFilter={ageFilter}
        tab={tab}
      />

      <LengthFilterTabs 
        lengthFilter={lengthFilter}
        onLengthFilterChange={handleLengthFilterChange}
        postsData={detailedFilteredData}
        ageFilter={ageFilter}
        postTypeFilter={postTypeFilter}
        tab={tab}
      />

      <SeriesStatusFilterTabs 
        seriesStatusFilter={seriesStatusFilter}
        onSeriesStatusFilterChange={handleSeriesStatusFilterChange}
        seriesData={detailedFilteredData}
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
        showDetailedButton={tab === 'posts' || tab === 'series'}
        onDetailedButtonClick={handleOpenDetailedModal}
        activeDetailedFiltersCount={getActiveDetailedFiltersCount()}
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

      {/* 詳細設定モーダル */}
      <DetailedSortModal
        open={detailedModalOpen}
        onClose={handleCloseDetailedModal}
        onApply={handleApplyDetailedFilters}
        initialFilters={detailedFilters}
        contentType={tab}
      />
    </Container>
  );
};

export default SearchResults;