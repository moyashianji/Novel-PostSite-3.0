import { useCallback } from 'react';

export const useAPI = () => {

  const fetchWithCredentials = async (endpoint) => {
    try {
      const response = await fetch(`${endpoint}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`Failed to fetch from ${endpoint}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return null;
    }
  };

  const fetchUserData = useCallback(async () => {
    return await fetchWithCredentials('/api/user/me');
  }, []);

  const fetchMyWorks = useCallback(async () => {
    return await fetchWithCredentials('/api/users/me/works');
  }, []);

  const fetchMySeries = useCallback(async () => {
    return await fetchWithCredentials('/api/users/me/series');
  }, []);

  const fetchFollowingList = useCallback(async () => {
    return await fetchWithCredentials('/api/users/following');
  }, []);

  const fetchFollowerList = useCallback(async () => {
    return await fetchWithCredentials('/api/users/followers');
  }, []);

  const fetchLikedPosts = useCallback(async () => {
    return await fetchWithCredentials('/api/posts/user/liked');
  }, []);

  const fetchBookshelf = useCallback(async () => {
    return await fetchWithCredentials('/api/me/bookshelf');
  }, []);

  // 更新されたブックマーク取得関数
  const fetchBookmarks = useCallback(async () => {
    const bookmarks = await fetchWithCredentials('/api/me/bookmarks');
    
    // ブックマークデータがある場合は追加情報を取得
    if (bookmarks && bookmarks.length > 0) {
      return bookmarks.map(bookmark => {
        // 日付を表示用にフォーマット
        const readableDate = new Date(bookmark.date).toLocaleString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // ページ情報の表示用テキスト
        const pageInfo = bookmark.pageNumber 
          ? `ページ ${bookmark.pageNumber}` 
          : '位置情報あり';
          
        // テキスト断片があれば先頭30文字を表示
        const textPreview = bookmark.textFragment 
          ? `「${bookmark.textFragment.substring(0, 30)}${bookmark.textFragment.length > 30 ? '...' : ''}」` 
          : '';
          
        return {
          ...bookmark,
          readableDate,
          pageInfo,
          textPreview
        };
      });
    }
    
    return bookmarks;
  }, []);

  const fetchContests = useCallback(async () => {
    return await fetchWithCredentials('/api/users/me/contests');
  }, []);

  const fetchViewHistory = async () => {
    try {
      const response = await fetch(`/api/view-history`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('閲覧履歴の取得に失敗しました');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('閲覧履歴取得エラー:', error);
      return [];
    }
  };

  // 作品のアナリティクスを取得する関数を追加
  const fetchWorkAnalytics = useCallback(async (postId) => {
    try {
      const response = await fetch(`/api/users/me/works/${postId}/analytics`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'アナリティクスの取得に失敗しました');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching work analytics:', error);
      throw error;
    }
  }, []);
  
  return {
    fetchUserData,
    fetchMyWorks,
    fetchMySeries,
    fetchFollowingList,
    fetchFollowerList,
    fetchLikedPosts,
    fetchBookshelf,
    fetchBookmarks,
    fetchContests,
    fetchViewHistory,
    fetchWorkAnalytics  // 新しく追加
  };
};