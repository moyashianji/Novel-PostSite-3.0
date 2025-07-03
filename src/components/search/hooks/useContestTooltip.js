import { useState, useCallback, useRef, useEffect } from 'react';

export const useContestTooltip = () => {
  const [contestInfo, setContestInfo] = useState({});
  const [hoveredContestTag, setHoveredContestTag] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // クリーンアップ：コンポーネントアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // コンテストタグマウスオーバーハンドラー
  const handleContestTagMouseEnter = useCallback(async (event, tag) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // すでにキャッシュされている場合はすぐに表示
    if (contestInfo[tag]) {
      setHoveredContestTag(tag);
      setAnchorEl(event.currentTarget);
      return;
    }

    // 0.5秒のタイマーを設定
    hoverTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/contests/by-tag/${encodeURIComponent(tag)}`);
        
        if (response.ok) {
          const contests = await response.json();
          
          // キャッシュに保存
          setContestInfo(prev => ({
            ...prev,
            [tag]: contests
          }));
          
          // ツールチップを表示
          setHoveredContestTag(tag);
          setAnchorEl(event.currentTarget);
        }
      } catch (error) {
        console.error('コンテスト情報の取得に失敗しました:', error);
      }
    }, 500); // 0.5秒後に表示
  }, [contestInfo]);

  // コンテストタグマウスリーブハンドラー
  const handleContestTagMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    // 3秒後にツールチップを非表示にする
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredContestTag(null);
      setAnchorEl(null);
    }, 3000); // 3秒間表示を維持
  }, []);

  // ツールチップ内のマウスエンター/リーブハンドラー
  const handleTooltipMouseEnter = useCallback(() => {
    // ツールチップ内ではクローズタイマーをクリア
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    // ツールチップから離れたら3秒後に非表示
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredContestTag(null);
      setAnchorEl(null);
    }, 3000);
  }, []);

  return {
    contestInfo,
    hoveredContestTag,
    anchorEl,
    handleContestTagMouseEnter,
    handleContestTagMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave
  };
};