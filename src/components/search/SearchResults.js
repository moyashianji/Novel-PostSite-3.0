import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Container, Grid, Typography, CircularProgress, 
  Box, Pagination, Tabs, Tab, Chip, Alert, Paper,
  Menu, MenuItem, Button, Select, FormControl, InputLabel,
  useTheme, IconButton
} from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonIcon from '@mui/icons-material/Person'; 
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import RestrictedIcon from '@mui/icons-material/DoNotDisturbOn';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import TuneIcon from '@mui/icons-material/Tune';
import SortIcon from '@mui/icons-material/Sort';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import HistoryIcon from '@mui/icons-material/History';
import UpdateIcon from '@mui/icons-material/Update';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PostCard from "../post/PostCard";
import SeriesCard from "../../components/series/SeriesCard";
import UserCard from "../user/UserCard";

// ページごとのアイテム数の選択肢
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ソートオプション定義
const SORT_OPTIONS = [
  { value: "newest", label: "新しい順", icon: <NewReleasesIcon fontSize="small" />, field: "createdAt", order: "desc" },
  { value: "oldest", label: "古い順", icon: <HistoryIcon fontSize="small" />, field: "createdAt", order: "asc" },
  { value: "updated", label: "更新順", icon: <UpdateIcon fontSize="small" />, field: "updatedAt", order: "desc" },
  { value: "views", label: "閲覧数順", icon: <VisibilityIcon fontSize="small" />, field: "viewCounter", order: "desc" },
  { value: "likes", label: "いいね順", icon: <FavoriteIcon fontSize="small" />, field: "goodCounter", order: "desc" },
  { value: "bookmarks", label: "ブックマーク数順", icon: <BookmarkIcon fontSize="small" />, field: "bookShelfCounter", order: "desc" }
];

// データをチャンクに分割する関数
const chunkArray = (array, size) => {
  const chunkedArr = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, index + size));
    index += size;
  }
  return chunkedArr;
};

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const initialLoadRef = useRef(true);
  const tagsScrollContainerRef = useRef(null);
  const aiTagsScrollContainerRef = useRef(null);

  // URLから検索パラメータを取得
  const searchParams = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return {
      mustInclude: query.get("mustInclude") || "",
      shouldInclude: query.get("shouldInclude") || "",
      mustNotInclude: query.get("mustNotInclude") || "",
      fields: query.get("fields") ? query.get("fields").split(",") : ["title", "content", "tags"],
      tagSearchType: query.get("tagSearchType") || "partial",
      type: query.get("type") || "posts",
      aiTool: query.get("aiTool") || "",
      ageFilter: query.get("ageFilter") || "all",
      sortBy: query.get("sortBy") || "newest", // デフォルトは新しい順
      page: parseInt(query.get("page")) || 1,
      size: parseInt(query.get("size")) || 10,
      postType: query.get("postType") || "all", // 作品タイプのパラメータを追加
      length: query.get("length") || "all", // 作品長さのパラメータを追加
      seriesStatus: query.get("seriesStatus") || "all" // シリーズ状態のパラメータを追加
    };
  }, [location.search]);

  const [tab, setTab] = useState(searchParams.type);
  const [ageFilter, setAgeFilter] = useState(searchParams.ageFilter);
  const [sortOption, setSortOption] = useState(searchParams.sortBy);
  const [postsData, setPostsData] = useState({
    all: [],
    general: [],
    r18: [],
    totalCounts: { all: 0, general: 0, r18: 0 }
  });
  const [seriesData, setSeriesData] = useState({
    all: [],
    general: [],
    r18: [],
    totalCounts: { all: 0, general: 0, r18: 0 }
  });
  const [usersData, setUsersData] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(searchParams.page);
  const [pageSize, setPageSize] = useState(searchParams.size);
  const [paginatedData, setPaginatedData] = useState([]);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // タブフィルターの状態管理
  const [postTypeFilter, setPostTypeFilter] = useState(searchParams.postType || "all");
  const [lengthFilter, setLengthFilter] = useState(searchParams.length || "all");
  const [seriesStatusFilter, setSeriesStatusFilter] = useState(searchParams.seriesStatus || "all");

  // タグクラウド関連の状態
  const [tagCounts, setTagCounts] = useState([]);
  const [aiToolCounts, setAiToolCounts] = useState([]);
  const [showLeftScrollTag, setShowLeftScrollTag] = useState(false);
  const [showRightScrollTag, setShowRightScrollTag] = useState(true);
  const [showLeftScrollAiTag, setShowLeftScrollAiTag] = useState(false);
  const [showRightScrollAiTag, setShowRightScrollAiTag] = useState(true);
  
  // チャンク読み込みのための状態
  const [loadedChunks, setLoadedChunks] = useState(1);
  const CHUNK_SIZE = 500; // 一度に処理するデータの量

  // 検索条件が変わったときにリセットする
  useEffect(() => {
    if (!initialLoadRef.current) {
      setPostsData({
        all: [],
        general: [],
        r18: [],
        totalCounts: { all: 0, general: 0, r18: 0 }
      });
      setSeriesData({
        all: [],
        general: [],
        r18: [],
        totalCounts: { all: 0, general: 0, r18: 0 }
      });
      setUsersData([]);
      setCurrentPage(1);
      setLoadedChunks(1);
      setHasMore(true);
    } else {
      initialLoadRef.current = false;
    }
  }, [searchParams.mustInclude, searchParams.shouldInclude, searchParams.mustNotInclude, 
      searchParams.fields, searchParams.tagSearchType, searchParams.aiTool, tab]);

  // 検索結果を取得する関数
  useEffect(() => {
    const fetchSearchResults = async () => {
      if ((tab === 'posts' && postsData.all.length > 0) || 
          (tab === 'series' && seriesData.all.length > 0) ||
          (tab === 'users' && usersData.length > 0)) {
        // すでにデータが読み込まれている場合は処理をスキップ
        return;
      }

      setLoading(true);
      setError("");

      try {
        // ページネーションパラメータを除外したクエリを作成
        const queryString = new URLSearchParams();
        Object.keys(searchParams).forEach((key) => {
          if (key !== 'page' && key !== 'size' && key !== 'ageFilter' && searchParams[key]) {
            queryString.set(
              key,
              Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
            );
          }
        });

        // 最初のチャンクだけを取得
        queryString.set('size', CHUNK_SIZE.toString());
        queryString.set('page', '1');

        let endpoint = "/api/search";
        if (tab === "users") {
          endpoint = "/api/search/users";
        }

        console.log("🔍 APIリクエストURL:", `${endpoint}?${queryString.toString()}`);

        const response = await fetch(`${endpoint}?${queryString.toString()}`);
        
        if (!response.ok) {
          throw new Error(`サーバーエラー: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("📥 取得したデータ:", data);

        if (tab === "posts") {
          // 年齢制限ごとにデータを仕分け
          const allData = data.results || [];
          const generalData = allData.filter(item => !item.isAdultContent);
          const r18Data = allData.filter(item => item.isAdultContent);
          
          setPostsData({
            all: allData,
            general: generalData,
            r18: r18Data,
            totalCounts: {
              all: data.total || allData.length,
              general: generalData.length,
              r18: r18Data.length
            }
          });
          
          // 全体の件数がCHUNK_SIZEより多い場合、まだ取得できるデータがあることを示す
          setHasMore(data.total > CHUNK_SIZE);
          
          // タグとAIツールを集計
          collectTagsAndAiTools(allData);
          
        } else if (tab === "series") {
          const allData = data.results || [];
          const generalData = allData.filter(item => !item.isAdultContent);
          const r18Data = allData.filter(item => item.isAdultContent);
          
          setSeriesData({
            all: allData,
            general: generalData,
            r18: r18Data,
            totalCounts: {
              all: data.total || allData.length,
              general: generalData.length,
              r18: r18Data.length
            }
          });
          
          setHasMore(data.total > CHUNK_SIZE);
          
          // シリーズのタグを集計（AIツールは対象外）
          collectTagsOnly(allData);
          
        } else if (tab === "users") {
          setUsersData(data.results || []);
          setHasMore(data.total > CHUNK_SIZE);
          
          // ユーザーのフォロー状態を取得
          if (data.results?.length > 0) {
            fetchFollowStatus(data.results);
          }
          
          // ユーザータブの場合はタグ集計なし
          setTagCounts([]);
          setAiToolCounts([]);
        }

        setCurrentPage(searchParams.page || 1);
      } catch (error) {
        console.error("❌ Error fetching search results:", error);
        setError(error.message || "検索に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams, tab, postsData.all.length, seriesData.all.length, usersData.length]);

  // タグとAIツールを集計する関数
  const collectTagsAndAiTools = useCallback((data) => {
    // タグを集計
    const tagsMap = new Map();
    data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        });
      }
    });
    
    // 出現回数でソート
    const sortedTags = Array.from(tagsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
    
    setTagCounts(sortedTags);
    
    // AIツールを集計
    const aiToolsMap = new Map();
    data.forEach(item => {
      if (item.aiEvidence && item.aiEvidence.tools && Array.isArray(item.aiEvidence.tools)) {
        item.aiEvidence.tools.forEach(tool => {
          aiToolsMap.set(tool, (aiToolsMap.get(tool) || 0) + 1);
        });
      }
    });
    
    // 出現回数でソート
    const sortedAiTools = Array.from(aiToolsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tool, count]) => ({ tool, count }));
    
    setAiToolCounts(sortedAiTools);
  }, []);

  // シリーズの場合はタグのみを集計
  const collectTagsOnly = useCallback((data) => {
    // タグを集計
    const tagsMap = new Map();
    data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        });
      }
    });
    
    // 出現回数でソート
    const sortedTags = Array.from(tagsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
    
    setTagCounts(sortedTags);
    
    // シリーズの場合はAIツールは対象外
    setAiToolCounts([]);
  }, []);

  // スクロールボタンの表示状態を更新する関数
  const updateScrollButtonsVisibility = useCallback(() => {
    if (tagsScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tagsScrollContainerRef.current;
      setShowLeftScrollTag(scrollLeft > 0);
      setShowRightScrollTag(scrollLeft < scrollWidth - clientWidth - 10);
    }

    if (aiTagsScrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = aiTagsScrollContainerRef.current;
      setShowLeftScrollAiTag(scrollLeft > 0);
      setShowRightScrollAiTag(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // スクロールコンテナの初期化と監視
  useEffect(() => {
    updateScrollButtonsVisibility();
    
    // スクロールイベントの監視
    const tagsContainer = tagsScrollContainerRef.current;
    const aiTagsContainer = aiTagsScrollContainerRef.current;
    
    if (tagsContainer) {
      tagsContainer.addEventListener('scroll', updateScrollButtonsVisibility);
    }
    
    if (aiTagsContainer) {
      aiTagsContainer.addEventListener('scroll', updateScrollButtonsVisibility);
    }
    
    // リサイズイベントの監視
    window.addEventListener('resize', updateScrollButtonsVisibility);
    
    return () => {
      if (tagsContainer) {
        tagsContainer.removeEventListener('scroll', updateScrollButtonsVisibility);
      }
      
      if (aiTagsContainer) {
        aiTagsContainer.removeEventListener('scroll', updateScrollButtonsVisibility);
      }
      
      window.removeEventListener('resize', updateScrollButtonsVisibility);
    };
  }, [tab, tagCounts, aiToolCounts, updateScrollButtonsVisibility]);

  // タグスクロールハンドラー
  const handleTagsScroll = useCallback((direction) => {
    if (tagsScrollContainerRef.current) {
      const scrollAmount = 200; // スクロール量
      if (direction === 'left') {
        tagsScrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        tagsScrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

  // AIタグスクロールハンドラー
  const handleAiTagsScroll = useCallback((direction) => {
    if (aiTagsScrollContainerRef.current) {
      const scrollAmount = 200; // スクロール量
      if (direction === 'left') {
        aiTagsScrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        aiTagsScrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, []);

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

  // 追加データを読み込む関数
  const loadMoreData = useCallback(async () => {
    if (!hasMore || fetchingMore) return;
    
    setFetchingMore(true);
    
    try {
      const queryString = new URLSearchParams();
      Object.keys(searchParams).forEach((key) => {
        if (key !== 'page' && key !== 'size' && key !== 'ageFilter' && searchParams[key]) {
          queryString.set(
            key,
            Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
          );
        }
      });
      
      const nextChunk = loadedChunks + 1;
      queryString.set('size', CHUNK_SIZE.toString());
      queryString.set('page', nextChunk.toString());
      
      let endpoint = "/api/search";
      if (tab === "users") {
        endpoint = "/api/search/users";
      }
      
      const response = await fetch(`${endpoint}?${queryString.toString()}`);
      
      if (!response.ok) {
        throw new Error(`サーバーエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (tab === "posts") {
        const newItems = data.results || [];
        
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          // 新しいデータを仕分けして既存のデータに追加
          const generalData = newItems.filter(item => !item.isAdultContent);
          const r18Data = newItems.filter(item => item.isAdultContent);
          
          setPostsData(prev => ({
            all: [...prev.all, ...newItems],
            general: [...prev.general, ...generalData],
            r18: [...prev.r18, ...r18Data],
            totalCounts: {
              all: data.total || prev.totalCounts.all + newItems.length,
              general: prev.totalCounts.general + generalData.length,
              r18: prev.totalCounts.r18 + r18Data.length
            }
          }));
          
          setLoadedChunks(nextChunk);
          setHasMore(data.results.length === CHUNK_SIZE);
          
          // タグとAIツールを更新
          const allItems = [...postsData.all, ...newItems];
          collectTagsAndAiTools(allItems);
        }
      } else if (tab === "series") {
        const newItems = data.results || [];
        
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          const generalData = newItems.filter(item => !item.isAdultContent);
          const r18Data = newItems.filter(item => item.isAdultContent);
          
          setSeriesData(prev => ({
            all: [...prev.all, ...newItems],
            general: [...prev.general, ...generalData],
            r18: [...prev.r18, ...r18Data],
            totalCounts: {
              all: data.total || prev.totalCounts.all + newItems.length,
              general: prev.totalCounts.general + generalData.length,
              r18: prev.totalCounts.r18 + r18Data.length
            }
          }));
          
          setLoadedChunks(nextChunk);
          setHasMore(data.results.length === CHUNK_SIZE);
          
          // タグを更新
          const allItems = [...seriesData.all, ...newItems];
          collectTagsOnly(allItems);
        }
      } else if (tab === "users") {
        const newItems = data.results || [];
        
        if (newItems.length === 0) {
          setHasMore(false);
        } else {
          setUsersData(prev => [...prev, ...newItems]);
          setLoadedChunks(nextChunk);
          setHasMore(data.results.length === CHUNK_SIZE);
          
          if (newItems.length > 0) {
            fetchFollowStatus(newItems);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading more data:", error);
      setError(error.message || "追加データの読み込みに失敗しました");
    } finally {
      setFetchingMore(false);
    }
  }, [hasMore, fetchingMore, searchParams, tab, loadedChunks, postsData.all, seriesData.all, collectTagsAndAiTools, collectTagsOnly]);

  // ユーザーのフォロー状態を取得
  const fetchFollowStatus = async (userResults) => {
    try {
      const followStatusSet = new Set(followedUsers);
      
      // バッチ処理で複数のユーザーのフォロー状態をまとめて取得
      const userBatches = chunkArray(userResults, 10); // 10ユーザーずつ処理
      
      for (const batch of userBatches) {
        const promises = batch.map(user => 
          fetch(`/api/users/${user._id}/is-following`, {
            credentials: 'include'
          })
          .then(response => {
            if (response.ok) {
              return response.json();
            }
            return { isFollowing: false };
          })
          .then(data => ({ userId: user._id, isFollowing: data.isFollowing }))
          .catch(error => {
            console.error(`Error checking follow status for user ${user._id}:`, error);
            return { userId: user._id, isFollowing: false };
          })
        );
        
        const results = await Promise.all(promises);
        
        results.forEach(result => {
          if (result.isFollowing) {
            followStatusSet.add(result.userId);
          }
        });
      }
      
      setFollowedUsers(followStatusSet);
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  };

  // フォロー/アンフォロー処理
  const handleFollowToggle = async (userId, shouldFollow) => {
    try {
      const endpoint = shouldFollow 
        ? `/api/users/follow/${userId}`
        : `/api/users/unfollow/${userId}`;
      
      const method = shouldFollow ? 'POST' : 'DELETE';
      
      const response = await fetch(endpoint, {
        method,
        credentials: 'include',
      });
      
      if (response.ok) {
        setFollowedUsers(prev => {
          const newSet = new Set(prev);
          if (shouldFollow) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  // 文字数によるフィルタリング関数
  const getPostsByLength = useCallback((posts, lengthType) => {
    if (!posts || !Array.isArray(posts)) return [];
    
    switch(lengthType) {
      case "short":
        return posts.filter(post => post.wordCount <= 1000);
      case "medium":
        return posts.filter(post => post.wordCount > 1000 && post.wordCount <= 10000);
      case "long":
        return posts.filter(post => post.wordCount > 10000);
      default:
        return posts;
    }
  }, []);
  
  // 作品タイプによるフィルタリング関数
  const getPostsByType = useCallback((posts, type) => {
    if (!posts || !Array.isArray(posts)) return [];
    
    switch(type) {
      case "standalone":
        return posts.filter(post => !post.series);
      case "series":
        return posts.filter(post => post.series);
      default:
        return posts;
    }
  }, []);
  
  // シリーズ状態によるフィルタリング関数
  const getSeriesByStatus = useCallback((series, status) => {
    if (!series || !Array.isArray(series)) return [];
    
    switch(status) {
      case "ongoing":
        return series.filter(s => s.isCompleted === false || s.isCompleted === undefined);
      case "completed":
        return series.filter(s => s.isCompleted === true);
      default:
        return series;
    }
  }, []);

  // 現在選択されているデータをソートする
  const getSortedData = useCallback((data) => {
    if (!data || data.length === 0) return [];
    
    // ユーザータブの場合はソートなし
    if (tab === 'users') return data;
    
    // 現在のソートオプションを取得
    const sortConfig = SORT_OPTIONS.find(option => option.value === sortOption);
    if (!sortConfig) return data;
    
    // データをコピーしてソート
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.field] || 0;
      const bValue = b[sortConfig.field] || 0;
      
      if (sortConfig.order === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [tab, sortOption]);

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
    return getSortedData(filteredData);
  }, [
    tab, 
    ageFilter, 
    postTypeFilter, 
    lengthFilter, 
    seriesStatusFilter, 
    postsData, 
    seriesData, 
    usersData, 
    getSortedData,
    getPostsByType,
    getPostsByLength,
    getSeriesByStatus
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
    usersData,
    getPostsByType,
    getPostsByLength,
    getSeriesByStatus
  ]);

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

  // フィルタータブのレンダリング
  const renderPostTypeFilter = useCallback(() => {
    if (!postsData || !postsData[ageFilter]) return null;
    
    // フィルタリング結果の件数を計算
    const allPostsCount = postsData[ageFilter].length;
    const standaloneCount = getPostsByType(postsData[ageFilter], "standalone").length;
    const seriesCount = getPostsByType(postsData[ageFilter], "series").length;
    
    return (
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs 
          value={postTypeFilter} 
          onChange={handlePostTypeFilterChange} 
          aria-label="post type filter tabs"
          centered
        >
          <Tab 
            label={`すべて (${allPostsCount})`}
            value="all" 
          />
          <Tab 
            label={`読み切り (${standaloneCount})`}
            value="standalone" 
          />
          <Tab 
            label={`連載作品 (${seriesCount})`}
            value="series" 
          />
        </Tabs>
      </Box>
    );
  }, [postsData, ageFilter, postTypeFilter, handlePostTypeFilterChange, getPostsByType]);
  
  const renderLengthFilter = useCallback(() => {
    if (!postsData || !postsData[ageFilter]) return null;
    
    // タイプフィルター適用後のデータ
    const typedData = getPostsByType(postsData[ageFilter], postTypeFilter);
    
    // 各文字数フィルターの件数を計算
    const typedDataCount = typedData.length;
    const shortCount = getPostsByLength(typedData, "short").length;
    const mediumCount = getPostsByLength(typedData, "medium").length;
    const longCount = getPostsByLength(typedData, "long").length;
    
    return (
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs 
          value={lengthFilter} 
          onChange={handleLengthFilterChange} 
          aria-label="length filter tabs"
          centered
        >
          <Tab 
            label={`すべて (${typedDataCount})`}
            value="all" 
          />
          <Tab 
            label={`ショート (${shortCount})`}
            value="short" 
          />
          <Tab 
            label={`ミディアム (${mediumCount})`}
            value="medium" 
          />
          <Tab 
            label={`ロング (${longCount})`}
            value="long" 
          />
        </Tabs>
      </Box>
    );
  }, [postsData, ageFilter, postTypeFilter, lengthFilter, handleLengthFilterChange, getPostsByType, getPostsByLength]);
  
  const renderSeriesStatusFilter = useCallback(() => {
    if (!seriesData || !seriesData[ageFilter]) return null;
    
    // 各シリーズ状態フィルターの件数を計算
    const allSeriesCount = seriesData[ageFilter].length;
    const ongoingCount = getSeriesByStatus(seriesData[ageFilter], "ongoing").length;
    const completedCount = getSeriesByStatus(seriesData[ageFilter], "completed").length;
    
    return (
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs 
          value={seriesStatusFilter} 
          onChange={handleSeriesStatusFilterChange} 
          aria-label="series status filter tabs"
          centered
        >
          <Tab 
            label={`すべて (${allSeriesCount})`}
            value="all" 
          />
          <Tab 
            label={`連載中 (${ongoingCount})`}
            value="ongoing" 
          />
          <Tab 
            label={`完結済 (${completedCount})`}
            value="completed" 
          />
        </Tabs>
      </Box>
    );
  }, [seriesData, ageFilter, seriesStatusFilter, handleSeriesStatusFilterChange, getSeriesByStatus]);

  // 総ページ数の計算
  const totalPages = useMemo(() => {
    const totalItems = getTotalFilteredCount();
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [getTotalFilteredCount, pageSize]);
  
  // currentPageがtotalPagesを超える場合に調整
  useEffect(() => {
    if (currentPage > totalPages) {
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

  // ページネーション処理
  const handlePageChange = useCallback((event, newPage) => {
    setCurrentPage(newPage);
    
    // URLも更新
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.set("page", newPage.toString());
    navigate({ search: updatedParams.toString() }, { replace: true });
    
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

  // AIツールフィルターをクリアする処理
  const clearAIToolFilter = useCallback(() => {
    const updatedParams = new URLSearchParams(location.search);
    updatedParams.delete("aiTool");
    updatedParams.set("page", "1");
    navigate({ search: updatedParams.toString() });
  }, [location.search, navigate]);

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

  // 検索タイトルの生成
  const searchTitle = useMemo(() => {
    const parts = [];
    let hasFilters = false;
    
    if (searchParams.mustInclude) {
      parts.push(<span key="must">{`"${searchParams.mustInclude}"`}</span>);
      hasFilters = true;
    }
    
    if (searchParams.aiTool && tab !== "users") {
      parts.push(
        <Chip 
          key="aiTool"
          icon={<SmartToyIcon />}
          label={searchParams.aiTool} 
          color="secondary"
          onDelete={clearAIToolFilter}
          size="medium"
          sx={{ ml: 1, fontWeight: 500 }}
        />
      );
      hasFilters = true;
    }
    
    if (!hasFilters) {
      return "すべての結果";
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchIcon sx={{ mr: 1 }} />
        <Typography variant="h5" component="span" sx={{ mr: 1 }}>
          検索結果
        </Typography>
        {parts}
      </Box>
    );
  }, [searchParams.mustInclude, searchParams.aiTool, tab, clearAIToolFilter]);

  // タグクラウドのレンダリング
  const renderTagCloud = useMemo(() => {
    if (tab === 'users' || tagCounts.length === 0) return null;
    
    return (
      <Box sx={{ position: 'relative', my: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1.5,
          justifyContent: 'space-between',
          pl: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalOfferIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight="500">
              タグクラウド
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              （クリックで検索）
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            {showLeftScrollTag && (
              <IconButton size="small" onClick={() => handleTagsScroll('left')}>
                <NavigateBeforeIcon />
              </IconButton>
            )}
            {showRightScrollTag && (
              <IconButton size="small" onClick={() => handleTagsScroll('right')}>
                <NavigateNextIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        
        <Box 
          ref={tagsScrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            pb: 1,
            px: 1,
            gap: 1,
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.primary.light,
              borderRadius: 3,
            }
          }}
        >
          {tagCounts.map(({ tag, count }) => (
            <Chip
              key={tag}
              label={`${tag} (${count})`}
              color="primary"
              variant="outlined"
              onClick={() => handleTagClick(tag)}
              sx={{ 
                flexShrink: 0,
                height: 32,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  boxShadow: 1
                }
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }, [tagCounts, handleTagClick, handleTagsScroll, showLeftScrollTag, showRightScrollTag, tab, theme]);

  // AIツールクラウドのレンダリング
  const renderAiToolCloud = useMemo(() => {
    if (tab !== 'posts' || aiToolCounts.length === 0) return null;
    
    return (
      <Box sx={{ position: 'relative', my: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 1.5,
          justifyContent: 'space-between',
          pl: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="subtitle1" fontWeight="500">
              AIツール
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
              （クリックで検索）
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex' }}>
            {showLeftScrollAiTag && (
              <IconButton size="small" onClick={() => handleAiTagsScroll('left')}>
                <NavigateBeforeIcon />
              </IconButton>
            )}
            {showRightScrollAiTag && (
              <IconButton size="small" onClick={() => handleAiTagsScroll('right')}>
                <NavigateNextIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        
        <Box 
          ref={aiTagsScrollContainerRef}
          sx={{
            display: 'flex',
            overflowX: 'auto',
            pb: 1,
            px: 1,
            gap: 1,
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.secondary.light,
              borderRadius: 3,
            }
          }}
        >
          {aiToolCounts.map(({ tool, count }) => (
            <Chip
              key={tool}
              label={`${tool} (${count})`}
              color="secondary"
              variant="outlined"
              onClick={() => handleAiToolClick(tool)}
              icon={<SmartToyIcon style={{ fontSize: '14px' }} />}
              sx={{ 
                flexShrink: 0,
                height: 32,
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  color: 'white',
                  boxShadow: 1
                }
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }, [aiToolCounts, handleAiToolClick, handleAiTagsScroll, showLeftScrollAiTag, showRightScrollAiTag, tab, theme]);

  // 表示するコンテンツを決定
  const renderContent = () => {
    if (loading && !paginatedData.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }

    // 検索結果がない場合
    if (getCurrentDataset.length === 0 && !loading) {
      return (
        <Paper sx={{ p: 3, my: 2, textAlign: 'center' }}>
          <InfoOutlinedIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" color="textSecondary">
            検索結果が見つかりませんでした
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {ageFilter !== 'all' 
              ? '別の年齢制限フィルターを試してみてください' 
              : '別のキーワードで試してみてください'}
          </Typography>
        </Paper>
      );
    }

    if (tab === "posts") {
      return (
        <Grid container spacing={3}>
          {paginatedData.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post._id}>
              <PostCard post={post} />
            </Grid>
          ))}
          {fetchingMore && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            </Grid>
          )}
        </Grid>
      );
    } else if (tab === "series") {
      return (
        <Grid container spacing={3}>
          {paginatedData.map((series) => (
            <Grid item xs={12} sm={6} md={4} key={series._id}>
              <SeriesCard series={series} />
            </Grid>
          ))}
          {fetchingMore && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            </Grid>
          )}
        </Grid>
      );
    } else { // ユーザータブ
      return (
        <Grid container spacing={3}>
          {paginatedData.map((user) => (
            <Grid item xs={12} key={user._id}>
              <UserCard 
                user={user}
                isFollowing={followedUsers.has(user._id)}
                onFollowToggle={handleFollowToggle}
                showFollowButton={true}
                showWorks={Boolean(user.recentWorks?.length)}
              />
            </Grid>
          ))}
          {fetchingMore && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            </Grid>
          )}
        </Grid>
      );
    }
  };

  // 検索結果情報表示
  const resultsInfo = useMemo(() => {
    const totalCount = getTotalFilteredCount();
    const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);
    
    return {
      start,
      end,
      total: totalCount
    };
  }, [currentPage, pageSize, getTotalFilteredCount]);
  
  // メインの年齢制限タブ（ユーザータブ以外で表示）
  const renderAgeFilterTabs = useCallback(() => {
    if (tab === 'users') return null;
    
    const dataSource = tab === 'posts' ? postsData.totalCounts : seriesData.totalCounts;
    
    return (
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs 
          value={ageFilter} 
          onChange={handleAgeFilterChange} 
          aria-label="age filter tabs"
          textColor="secondary"
          indicatorColor="secondary"
          centered
        >
          <Tab 
            icon={<AllInclusiveIcon fontSize="small" />} 
            iconPosition="start" 
            label={`すべて (${dataSource.all})`}
            value="all" 
          />
          <Tab 
            icon={<FamilyRestroomIcon fontSize="small" />} 
            iconPosition="start" 
            label={`全年齢 (${dataSource.general})`}
            value="general" 
          />
          <Tab 
            icon={<RestrictedIcon fontSize="small" />} 
            iconPosition="start" 
            label={`R18 (${dataSource.r18})`}
            value="r18" 
          />
        </Tabs>
      </Box>
    );
  }, [tab, ageFilter, postsData.totalCounts, seriesData.totalCounts, handleAgeFilterChange]);

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        {searchTitle}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab 
            icon={<SearchIcon />}
            iconPosition="start"
            label={`作品${tab === "posts" ? ` (${postsData.totalCounts.all})` : ""}`} 
            value="posts" 
          />
          <Tab 
            icon={<SearchIcon />}
            iconPosition="start"
            label={`シリーズ${tab === "series" ? ` (${seriesData.totalCounts.all})` : ""}`} 
            value="series" 
          />
          <Tab 
            icon={<PersonIcon />}
            iconPosition="start"
            label={`ユーザー${tab === "users" ? ` (${usersData.length})` : ""}`} 
            value="users" 
          />
        </Tabs>
      </Box>

      {/* 年齢制限フィルタータブ（ユーザータブ以外で表示） */}
      {renderAgeFilterTabs()}

      {/* 作品タイプタブ（作品タブのみ表示） */}
      {tab === "posts" && renderPostTypeFilter()}

      {/* 文字数タブ（作品タブのみ表示） */}
      {tab === "posts" && renderLengthFilter()}

      {/* シリーズ状態タブ（シリーズタブのみ表示） */}
      {tab === "series" && renderSeriesStatusFilter()}

      {/* ソートオプションタブ（ユーザータブ以外で表示） */}
      {tab !== "users" && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}>
          <Tabs 
            value={sortOption} 
            onChange={handleSortChange} 
            aria-label="sort options"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {SORT_OPTIONS.map(option => (
              <Tab 
                key={option.value}
                icon={option.icon} 
                iconPosition="start" 
                label={option.label}
                value={option.value} 
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* タグクラウド */}
      {renderTagCloud}
      
      {/* AIツールクラウド */}
      {renderAiToolCloud}

      {/* 検索結果情報とページサイズ設定 */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="body2" color="text.secondary">
          {`${resultsInfo.start}〜${resultsInfo.end}件 / 全${resultsInfo.total}件`}
        </Typography>
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-select-label">表示件数</InputLabel>
          <Select
            labelId="page-size-select-label"
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            label="表示件数"
          >
            {PAGE_SIZE_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>{option}件</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {renderContent()}

      {totalPages > 1 && (
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          mt: 4, 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 2
        }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary"
            showFirstButton 
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
          
          {hasMore && getCurrentDataset.length < getTotalFilteredCount() && (
            <Button 
              variant="outlined" 
              onClick={loadMoreData}
              disabled={fetchingMore}
              startIcon={fetchingMore ? <CircularProgress size={16} /> : <TuneIcon />}
            >
              {fetchingMore ? "読み込み中..." : "もっと読み込む"}
            </Button>
          )}
        </Box>
      )}
    </Container>
  );
};

export default SearchResults;