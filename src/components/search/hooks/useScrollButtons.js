import { useState, useCallback, useEffect } from 'react';

export const useScrollButtons = (containerRef) => {
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // スクロールボタンの表示状態を更新する関数
  const updateScrollButtonsVisibility = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, [containerRef]);

  // スクロールハンドラー
  const handleScroll = useCallback((direction) => {
    if (containerRef.current) {
      const scrollAmount = 200; // スクロール量
      if (direction === 'left') {
        containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  }, [containerRef]);

  // スクロールコンテナの初期化と監視
  useEffect(() => {
    updateScrollButtonsVisibility();
    
    const container = containerRef.current;
    
    if (container) {
      container.addEventListener('scroll', updateScrollButtonsVisibility);
    }
    
    // リサイズイベントの監視
    window.addEventListener('resize', updateScrollButtonsVisibility);
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', updateScrollButtonsVisibility);
      }
      
      window.removeEventListener('resize', updateScrollButtonsVisibility);
    };
  }, [updateScrollButtonsVisibility]);

  return {
    showLeftScroll,
    showRightScroll,
    handleScroll,
    updateScrollButtonsVisibility
  };
};