import { useState, useEffect, useRef } from 'react';
import { CHUNK_SIZE } from '../utils/constants';
import { chunkArray, buildSearchQuery } from '../utils/searchUtils';
import { collectAllTagClouds, collectTagsOnly } from '../utils/filterUtils';

export const useSearchData = (searchParams, tab) => {
  const initialLoadRef = useRef(true);
  
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
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedChunks, setLoadedChunks] = useState(1);
  
  // タグクラウド関連の状態
  const [tagCounts, setTagCounts] = useState([]);
  const [aiToolCounts, setAiToolCounts] = useState([]);
  const [contestTagCounts, setContestTagCounts] = useState([]);

  // 検索条件が変わったときにリセット
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
      setLoadedChunks(1);
      setHasMore(true);
    } else {
      initialLoadRef.current = false;
    }
  }, [searchParams.mustInclude, searchParams.shouldInclude, searchParams.mustNotInclude, 
      searchParams.fields, searchParams.tagSearchType, searchParams.aiTool, tab]);

  // 初回検索結果を取得
  useEffect(() => {
    const fetchSearchResults = async () => {
      if ((tab === 'posts' && postsData.all.length > 0) || 
          (tab === 'series' && seriesData.all.length > 0) ||
          (tab === 'users' && usersData.length > 0)) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const queryString = buildSearchQuery(searchParams, ['page', 'size', 'ageFilter']);
        queryString.set('size', CHUNK_SIZE.toString());
        queryString.set('page', '1');

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
          
          setHasMore(data.total > CHUNK_SIZE);
          
          // タグクラウドを集計
          const cloudData = collectAllTagClouds(allData);
          setTagCounts(cloudData.tags);
          setAiToolCounts(cloudData.aiTools);
          setContestTagCounts(cloudData.contestTags);
          
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
          
          // シリーズの場合はタグのみ集計
          const cloudData = collectTagsOnly(allData);
          setTagCounts(cloudData.tags);
          setAiToolCounts([]);
          setContestTagCounts([]);
          
        } else if (tab === "users") {
          setUsersData(data.results || []);
          setHasMore(data.total > CHUNK_SIZE);
          
          if (data.results?.length > 0) {
            fetchFollowStatus(data.results);
          }
          
          setTagCounts([]);
          setAiToolCounts([]);
          setContestTagCounts([]);
        }

      } catch (error) {
        console.error("❌ Error fetching search results:", error);
        setError(error.message || "検索に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams, tab, postsData.all.length, seriesData.all.length, usersData.length]);

  // ユーザーのフォロー状態を取得
  const fetchFollowStatus = async (userResults) => {
    try {
      const followStatusSet = new Set(followedUsers);
      
      const userBatches = chunkArray(userResults, 10);
      
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

  // 追加データを読み込む
  const loadMoreData = async () => {
    if (!hasMore || fetchingMore) return;
    
    setFetchingMore(true);
    
    try {
      const queryString = buildSearchQuery(searchParams, ['page', 'size', 'ageFilter']);
      
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
          
          // タグクラウドを更新
          const allItems = [...postsData.all, ...newItems];
          const cloudData = collectAllTagClouds(allItems);
          setTagCounts(cloudData.tags);
          setAiToolCounts(cloudData.aiTools);
          setContestTagCounts(cloudData.contestTags);
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
          
          // タグクラウドを更新
          const allItems = [...seriesData.all, ...newItems];
          const cloudData = collectTagsOnly(allItems);
          setTagCounts(cloudData.tags);
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

  return {
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
  };
};