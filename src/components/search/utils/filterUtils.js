import { SORT_OPTIONS } from './constants';

// 文字数によるフィルタリング関数
export const getPostsByLength = (posts, lengthType) => {
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
};

// 作品タイプによるフィルタリング関数
export const getPostsByType = (posts, type) => {
  if (!posts || !Array.isArray(posts)) return [];
  
  switch(type) {
    case "standalone":
      return posts.filter(post => !post.series);
    case "series":
      return posts.filter(post => post.series);
    default:
      return posts;
  }
};

// シリーズ状態によるフィルタリング関数
export const getSeriesByStatus = (series, status) => {
  if (!series || !Array.isArray(series)) return [];
  
  switch(status) {
    case "ongoing":
      return series.filter(s => s.isCompleted === false || s.isCompleted === undefined);
    case "completed":
      return series.filter(s => s.isCompleted === true);
    default:
      return series;
  }
};

// データをソートする関数
export const getSortedData = (data, sortOption, tab) => {
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
};

// タグを集計する関数
export const collectTags = (data) => {
  const tagsMap = new Map();
  data.forEach(item => {
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
      });
    }
  });
  
  // 出現回数でソート
  return Array.from(tagsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
};

// AIツールを集計する関数
export const collectAiTools = (data) => {
  const aiToolsMap = new Map();
  data.forEach(item => {
    if (item.aiEvidence && item.aiEvidence.tools && Array.isArray(item.aiEvidence.tools)) {
      item.aiEvidence.tools.forEach(tool => {
        aiToolsMap.set(tool, (aiToolsMap.get(tool) || 0) + 1);
      });
    }
  });
  
  // 出現回数でソート
  return Array.from(aiToolsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tool, count]) => ({ tool, count }));
};

// コンテストタグを集計する関数
export const collectContestTags = (data) => {
  const contestTagsMap = new Map();
  data.forEach(item => {
    if (item.contestTags && Array.isArray(item.contestTags)) {
      item.contestTags.forEach(tag => {
        contestTagsMap.set(tag, (contestTagsMap.get(tag) || 0) + 1);
      });
    }
  });
  
  // 出現回数でソート
  return Array.from(contestTagsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
};

// 全てのタグクラウドデータを集計する関数
export const collectAllTagClouds = (data) => {
  return {
    tags: collectTags(data),
    aiTools: collectAiTools(data),
    contestTags: collectContestTags(data)
  };
};

// タグのみを集計する関数（シリーズ用）
export const collectTagsOnly = (data) => {
  return {
    tags: collectTags(data),
    aiTools: [],
    contestTags: []
  };
};