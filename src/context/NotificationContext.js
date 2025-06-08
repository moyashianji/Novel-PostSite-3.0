// context/NotificationContext.js - ページネーション対応版
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = React.memo(({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // 最新のリクエストを追跡するための参照
  const activeRequestIdRef = useRef(0);
  
  // ページネーション対応の通知取得関数
  const fetchNotifications = useCallback(async (page = 1, limit = 10, type = 'all') => {
    if (fetchingRef.current) {
      console.log('既にフェッチ中のため、リクエストをスキップします');
      return;
    }
    
    console.log(`通知取得開始: ページ=${page}, 件数=${limit}, タイプ=${type}`);
    fetchingRef.current = true;
    setLoading(true);
    
    // リクエストを識別するためのIDを生成
    const requestId = Date.now();
    activeRequestIdRef.current = requestId;
    
    try {
      // URLにページネーションパラメータとタイプフィルターを追加
      const requestUrl = `/api/notifications?page=${page}&limit=${limit}&type=${type}`;
      console.log(`API呼び出し(${requestId}): ${requestUrl}`);
      
      const response = await fetch(requestUrl, {
        credentials: 'include',
      });
      
      // このリクエストが最新でない場合は処理をスキップ
      if (activeRequestIdRef.current !== requestId) {
        console.log(`リクエスト(${requestId})は最新ではないため、結果を無視します`);
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`通知の取得に失敗しました: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`API レスポンス(${requestId}):`, result);
      
      if (!isMountedRef.current) {
        console.log('コンポーネントがアンマウントされているため、状態更新をスキップします');
        return;
      }
      
      // リクエスト時のページ番号を状態に保存 (これが重要)
      setCurrentPage(page);
      
      // 通知データの設定
      setNotifications(result.notifications || []);
      
      // ページネーション情報の更新
      const resultPages = result.pages || 1;
      
      console.log(`ページ情報を更新(${requestId}): リクエスト=${page}, API結果ページ=${result.page}, 合計=${resultPages}`);
      setTotalPages(resultPages);
      setHasMore(result.hasMore || false);
      
      // 未読数の設定
      if (result.unreadCount !== undefined) {
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error(`通知取得エラー(${requestId}):`, error);
      if (isMountedRef.current) {
        // エラー発生時は空の配列を設定
        setNotifications([]);
        setTotalPages(1);
        // エラー時でもリクエストページを維持
        setCurrentPage(page);
        setHasMore(false);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false;
      console.log(`通知取得完了(${requestId})`);
    }
  }, []);

  // 通知を既読にする
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;
    
    try {
      // MongoDBの場合は_idを使うケースが多いため対応
      const idToUse = typeof notificationId === 'object' ? notificationId._id : notificationId;
      const response = await fetch(`/api/notifications/${idToUse}/read`, {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('既読処理に失敗しました');
      
      // UIを更新
      setNotifications(prev => 
        prev.map(n => {
          // idとして_idも考慮
          const nId = n._id || n.id;
          return nId === idToUse ? {...n, read: true} : n;
        })
      );
      
      // 未読カウントを1減らす
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('既読処理エラー:', error);
      return false;
    }
  }, []);

  // すべて既読にする
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('全既読処理に失敗しました');
      
      // 全通知を既読状態に更新
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      
      // 未読カウントをリセット
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('全既読処理エラー:', error);
      return false;
    }
  }, []);

  // 通知を削除する
  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationId) return false;
    
    try {
      // MongoDBの場合は_idを使うケースが多いため対応
      const idToUse = typeof notificationId === 'object' ? notificationId._id : notificationId;
      const response = await fetch(`/api/notifications/${idToUse}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('削除に失敗しました');
      
      // 削除する前に通知が未読かチェック
      const deletedNotification = notifications.find(n => (n._id || n.id) === idToUse);
      const wasUnread = deletedNotification && !deletedNotification.read;
      
      // UIから削除
      setNotifications(prev => {
        // idとして_idも考慮
        return prev.filter(n => (n._id || n.id) !== idToUse);
      });
      
      // 削除した通知が未読なら未読カウントを1減らす
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (error) {
      console.error('削除エラー:', error);
      return false;
    }
  }, [notifications]);

  // 定期更新の設定
  useEffect(() => {
    // 初回読み込みは行わない（コンポーネント側で実行）
    // 必要な場合のみ手動で fetchNotifications を呼び出す
    
    // 5分ごとに通知を更新 - 現在のページを維持
    const interval = setInterval(() => {
      if (isMountedRef.current && currentPage > 0) {
        console.log(`定期更新: 現在のページ=${currentPage}を維持して更新`);
        // 現在のページを維持してリフレッシュ
        fetchNotifications(currentPage);
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, currentPage]);

  // コンテキスト値
  const value = {
    notifications,
    unreadCount,
    loading,
    currentPage,
    totalPages,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
});

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};