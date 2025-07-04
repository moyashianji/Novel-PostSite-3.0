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

// URLから検索パラメータを解析
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
    seriesStatus: query.get("seriesStatus") || "all"
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