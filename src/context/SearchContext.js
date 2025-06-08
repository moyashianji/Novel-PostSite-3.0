import React, { createContext, useState, useContext, useCallback, memo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Contextの作成
export const SearchContext = createContext();

export const SearchProvider = memo(({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // URLパラメータから初期値を取得する関数
    const getInitialParamsFromUrl = useCallback(() => {
        const urlParams = new URLSearchParams(location.search);
        const type = urlParams.get("type") || "posts";
        
        return {
            mustInclude: urlParams.get("mustInclude") || "",
            shouldInclude: urlParams.get("shouldInclude") || "",
            mustNotInclude: urlParams.get("mustNotInclude") || "",
            fields: urlParams.get("fields") 
                ? urlParams.get("fields").split(",") 
                : type === "series" 
                    ? ["title", "description", "tags"] 
                    : ["title", "content", "tags"],
            tagSearchType: urlParams.get("tagSearchType") || "partial",
            type: type,
            aiTool: urlParams.get("aiTool") || "",
            ageFilter: urlParams.get("ageFilter") || "all", 
            postType: urlParams.get("postType") || "all", // 読み切り/連載フィルター
            length: urlParams.get("length") || "all", // 文字数フィルター
            seriesStatus: urlParams.get("seriesStatus") || "all", // シリーズ状態フィルター
            sortBy: urlParams.get("sortBy") || "newest",
            page: urlParams.get("page") || "1",
            size: urlParams.get("size") || "10",
        };
    }, [location.search]);

    // 状態の初期化
    const [searchParams, setSearchParams] = useState(getInitialParamsFromUrl());

    // URLが変更されたら検索パラメータを更新
    useEffect(() => {
        setSearchParams(getInitialParamsFromUrl());
    }, [location.search, getInitialParamsFromUrl]);

    // 検索実行関数
    const handleSearch = useCallback((params) => {
        const updatedParams = { ...searchParams, ...params };
        
        // 検索パラメータの状態を更新
        setSearchParams(updatedParams);

        // URLクエリパラメータの構築
        const query = new URLSearchParams();
        Object.keys(updatedParams).forEach((key) => {
            if (updatedParams[key]) {
                const value = Array.isArray(updatedParams[key]) 
                    ? updatedParams[key].join(",") 
                    : updatedParams[key];
                query.set(key, value);
            }
        });

        // 検索ページに遷移
        navigate(`/search?${query.toString()}`);
    }, [searchParams, navigate]);

    // パラメータクリア関数
    const clearSearchParams = useCallback(() => {
        const clearedParams = {
            ...searchParams,
            mustInclude: "",
            shouldInclude: "",
            mustNotInclude: "",
            aiTool: "",
            // ageFilterはそのまま保持
            page: "1",
        };
        setSearchParams(clearedParams);
        
        // typeとageFilterだけ残して他をクリアしたURLに遷移
        const query = new URLSearchParams();
        query.set("type", clearedParams.type);
        if (clearedParams.ageFilter && clearedParams.ageFilter !== "all") {
            query.set("ageFilter", clearedParams.ageFilter);
        }
        navigate(`/search?${query.toString()}`);
    }, [searchParams, navigate]);

    return (
        <SearchContext.Provider value={{ 
            searchParams, 
            setSearchParams, 
            handleSearch,
            clearSearchParams 
        }}>
            {children}
        </SearchContext.Provider>
    );
});

// カスタムフック
export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};