// データをチャンクに分割する関数
export const chunkArray = (array, size) => {
  const chunkedArr = [];
  let index = 0;
  while (index < array.length) {
    chunkedArr.push(array.slice(index, index + size));
    index += size;
  }
  return chunkedArr;
};

// 検索パラメータからクエリ文字列を構築
export const buildSearchQuery = (searchParams, excludeKeys = []) => {
  const queryString = new URLSearchParams();
  Object.keys(searchParams).forEach((key) => {
    if (!excludeKeys.includes(key) && searchParams[key]) {
      queryString.set(
        key,
        Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
      );
    }
  });
  return queryString;
};

// 日付文字列をDateオブジェクトに変換（ISOフォーマット対応）
const parseDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.warn('Invalid date format:', dateString);
    return null;
  }
};

// URLから検索パラメータを解析（詳細フィルター対応）
export const parseSearchParams = (locationSearch) => {
  const query = new URLSearchParams(locationSearch);
  
  let defaultFields = ["title", "content", "tags"];
  const type = query.get("type") || "posts";
  
  if (type === "users") {
    defaultFields = ["nickname", "favoriteAuthors"];
  } else if (type === "series") {
    defaultFields = ["title", "description", "tags"];
  }
  
  let fields = query.get("fields") ? query.get("fields").split(",") : defaultFields;
  
  // コンテストタグが指定されている場合は、fieldsにcontestTagsを追加
  const contestTag = query.get("contestTag");
  if (contestTag && contestTag.trim() && !fields.includes("contestTags")) {
    fields.push("contestTags");
  }
  
  return {
    mustInclude: query.get("mustInclude") || "",
    shouldInclude: query.get("shouldInclude") || "",
    mustNotInclude: query.get("mustNotInclude") || "",
    fields: query.get("fields") ? query.get("fields").split(",") : defaultFields,
    tagSearchType: query.get("tagSearchType") || "partial",
    type: query.get("type") || "posts",
    aiTool: query.get("aiTool") || "",
    contestTag: contestTag || "",
    ageFilter: query.get("ageFilter") || "all",
    sortBy: query.get("sortBy") || "newest",
    page: parseInt(query.get("page")) || 1,
    size: parseInt(query.get("size")) || 10,
    postType: query.get("postType") || "all",
    length: query.get("length") || "all",
    seriesStatus: query.get("seriesStatus") || "all",
    
    // 作品用詳細フィルター
    minWordCount: query.get("minWordCount") ? parseInt(query.get("minWordCount")) : null,
    maxWordCount: query.get("maxWordCount") ? parseInt(query.get("maxWordCount")) : null,
    startDate: parseDate(query.get("startDate")),
    endDate: parseDate(query.get("endDate")),
    
    // シリーズ用詳細フィルター
    minWorksCount: query.get("minWorksCount") ? parseInt(query.get("minWorksCount")) : null,
    maxWorksCount: query.get("maxWorksCount") ? parseInt(query.get("maxWorksCount")) : null,
    seriesStartDate: parseDate(query.get("seriesStartDate")),
    seriesEndDate: parseDate(query.get("seriesEndDate")),
  };
};

// 検索結果の総ページ数を計算
export const calculateTotalPages = (totalItems, pageSize) => {
  return Math.max(1, Math.ceil(totalItems / pageSize));
};

// 現在のページの表示範囲を計算
export const calculateResultsInfo = (currentPage, pageSize, totalItems) => {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  
  return {
    start,
    end,
    total: totalItems
  };
};

// 詳細フィルターが適用されているかチェック
export const hasDetailedFilters = (searchParams, contentType) => {
  if (contentType === 'posts') {
    return !!(
      searchParams.minWordCount ||
      searchParams.maxWordCount ||
      searchParams.startDate ||
      searchParams.endDate
    );
  } else if (contentType === 'series') {
    return !!(
      searchParams.minWorksCount ||
      searchParams.maxWorksCount ||
      searchParams.seriesStartDate ||
      searchParams.seriesEndDate
    );
  }
  return false;
};

// 詳細フィルターのアクティブ数を計算
export const getActiveDetailedFiltersCount = (searchParams, contentType) => {
  let count = 0;
  
  if (contentType === 'posts') {
    if (searchParams.minWordCount) count++;
    if (searchParams.maxWordCount) count++;
    if (searchParams.startDate) count++;
    if (searchParams.endDate) count++;
  } else if (contentType === 'series') {
    if (searchParams.minWorksCount) count++;
    if (searchParams.maxWorksCount) count++;
    if (searchParams.seriesStartDate) count++;
    if (searchParams.seriesEndDate) count++;
  }
  
  return count;
};

// 詳細フィルター情報を含む検索クエリパラメータの構築
export const buildDetailedSearchQuery = (searchParams, detailedFilters, contentType) => {
  const queryString = new URLSearchParams();
  
  // 基本的な検索パラメータを追加
  Object.keys(searchParams).forEach((key) => {
    if (searchParams[key] && searchParams[key] !== '' && 
        !['minWordCount', 'maxWordCount', 'startDate', 'endDate', 
          'minWorksCount', 'maxWorksCount', 'seriesStartDate', 'seriesEndDate'].includes(key)) {
      const value = Array.isArray(searchParams[key]) 
        ? searchParams[key].join(",") 
        : searchParams[key];
      queryString.set(key, value);
    }
  });
  
  // 詳細フィルターを追加
  if (contentType === 'posts') {
    if (detailedFilters.minWordCount) {
      queryString.set("minWordCount", detailedFilters.minWordCount.toString());
    }
    if (detailedFilters.maxWordCount) {
      queryString.set("maxWordCount", detailedFilters.maxWordCount.toString());
    }
    if (detailedFilters.startDate) {
      queryString.set("startDate", detailedFilters.startDate.toISOString());
    }
    if (detailedFilters.endDate) {
      queryString.set("endDate", detailedFilters.endDate.toISOString());
    }
  } else if (contentType === 'series') {
    if (detailedFilters.minWorksCount) {
      queryString.set("minWorksCount", detailedFilters.minWorksCount.toString());
    }
    if (detailedFilters.maxWorksCount) {
      queryString.set("maxWorksCount", detailedFilters.maxWorksCount.toString());
    }
    if (detailedFilters.seriesStartDate) {
      queryString.set("seriesStartDate", detailedFilters.seriesStartDate.toISOString());
    }
    if (detailedFilters.seriesEndDate) {
      queryString.set("seriesEndDate", detailedFilters.seriesEndDate.toISOString());
    }
  }
  
  return queryString;
};