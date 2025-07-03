import React from "react";
import {
  NewReleases as NewReleasesIcon,
  History as HistoryIcon,
  Update as UpdateIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';

// ページごとのアイテム数の選択肢
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ソートオプション定義
export const SORT_OPTIONS = [
  { 
    value: "newest", 
    label: "新しい順", 
    icon: <NewReleasesIcon fontSize="small" />, 
    field: "createdAt", 
    order: "desc" 
  },
  { 
    value: "oldest", 
    label: "古い順", 
    icon: <HistoryIcon fontSize="small" />, 
    field: "createdAt", 
    order: "asc" 
  },
  { 
    value: "updated", 
    label: "更新順", 
    icon: <UpdateIcon fontSize="small" />, 
    field: "updatedAt", 
    order: "desc" 
  },
  { 
    value: "views", 
    label: "閲覧数順", 
    icon: <VisibilityIcon fontSize="small" />, 
    field: "viewCounter", 
    order: "desc" 
  },
  { 
    value: "likes", 
    label: "いいね順", 
    icon: <FavoriteIcon fontSize="small" />, 
    field: "goodCounter", 
    order: "desc" 
  },
  { 
    value: "bookmarks", 
    label: "ブックマーク数順", 
    icon: <BookmarkIcon fontSize="small" />, 
    field: "bookShelfCounter", 
    order: "desc" 
  }
];

// チャンク読み込みのための定数
export const CHUNK_SIZE = 500;