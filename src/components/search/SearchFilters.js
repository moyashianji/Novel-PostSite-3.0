import React, { useCallback, useEffect } from "react";
import {
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Box,
    Typography,
    Chip,
    Divider,
    IconButton,
    Tooltip,
} from "@mui/material";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useSearch } from "../../context/SearchContext";
import { useLocation, useNavigate } from "react-router-dom";

const KeywordFilter = React.memo(({ label, value, onChange, placeholder }) => (
    <TextField
        label={label}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        fullWidth
        sx={{ mb: 2 }}
        variant="outlined"
        size="small"
    />
));

const RadioFilter = React.memo(({ label, value, options, onChange, disabled }) => {
    if (disabled) return null;

    return (
        <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup row value={value} onChange={onChange}>
                {options.map((option) => (
                    <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio size="small" />}
                        label={option.label}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
});

// AIツールフィルター
const AIToolFilter = React.memo(({ value, onChange, clearFilter, disabled }) => {
    // 一般的なAIツールのリスト
    const commonAITools = ["AIのべりすと", "ChatGPT", "Claude", "GPT-4", "DALL-E", "Midjourney", "Stable Diffusion",
        "Bard", "Bing AI", "Jasper", "Rytr", "Copy.ai", "Novel AI", "AI Dungeon",
        "Replika", "Character.AI", "Playground AI", "DeepL", "Notion AI", "Sudowrite",
        "Synthesia", "RunwayML", "Kaiber", "Leonardo.AI", "Firefly"];

    if (disabled) return null;

    return (
        <Box sx={{ mb: 2 }}>
            <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SmartToyIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                AIツールで絞り込み（現在作品のみの対応です）
            </FormLabel>

            {value && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>選択中:</Typography>
                    <Chip
                        label={value}
                        onDelete={clearFilter}
                        color="secondary"
                        size="small"
                    />
                </Box>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {commonAITools.map((tool) => (
                    <Chip
                        key={tool}
                        label={tool}
                        onClick={() => onChange(tool)}
                        sx={{ mr: 1, mb: 1 }}
                        color={value === tool ? "secondary" : "default"}
                        variant={value === tool ? "filled" : "outlined"}
                        size="small"
                    />
                ))}
            </Box>
        </Box>
    );
});

const SearchFilters = () => {
    const { searchParams, setSearchParams, handleSearch, clearSearchParams } = useSearch();
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const type = query.get("type") || "posts"; // デフォルトでposts
    const aiTool = query.get("aiTool") || "";

    // タイプに応じてフィールドのデフォルト値を設定
    useEffect(() => {
        const defaultFields = {
            posts: "title,content,tags",
            series: "title,description,tags",
            users: "nickname,favoriteAuthors"
        };

        // タイプに応じた適切なフィールドを設定
        if (!searchParams.fields || (type !== searchParams.type)) {
            setSearchParams(prev => ({
                ...prev,
                fields: defaultFields[type] || defaultFields.posts,
                type,
                // ユーザー検索の場合はタグ検索タイプを強制的に完全一致に設定
                ...(type === "users" ? { tagSearchType: "exact" } : {})
            }));
        }
    }, [type, setSearchParams, searchParams.fields, searchParams.type]);

const handleInputChange = useCallback((field, value) => {
    setSearchParams((prev) => {
        let newValue = value;
        
        // fieldsの変更時に特別な処理
        if (field === "fields") {
            // コンテストタグが入力されている場合は、contestTagsを自動的に追加
            if (prev.contestTag && prev.contestTag.trim()) {
                const fieldsArray = value.split(',');
                if (!fieldsArray.includes('contestTags')) {
                    fieldsArray.push('contestTags');
                    newValue = fieldsArray.join(',');
                }
            }
        }
        
        return {
            ...prev,
            [field]: field === "fields" ? newValue : value,
            page: "1"
        };
    });
}, [setSearchParams]);

    // AIツールの選択処理
    const handleAIToolSelect = useCallback((tool) => {
        setSearchParams((prev) => ({
            ...prev,
            aiTool: prev.aiTool === tool ? "" : tool, // 同じツールを選択した場合は解除
            page: "1"
        }));
    }, [setSearchParams]);

    // AIツールフィルターのクリア
    const clearAIToolFilter = useCallback(() => {
        setSearchParams((prev) => ({
            ...prev,
            aiTool: "",
            page: "1"
        }));
    }, [setSearchParams]);

    const handleSearchClick = useCallback(() => {
        const updatedQuery = new URLSearchParams();

        // デフォルトで作品タブを選択するように設定
        Object.keys(searchParams).forEach((key) => {
            if (searchParams[key]) {
                updatedQuery.set(
                    key,
                    Array.isArray(searchParams[key]) ? searchParams[key].join(",") : searchParams[key]
                );
            }
        });

        // typeが指定されていない場合は、デフォルトでpostsを設定
        if (!updatedQuery.has("type")) {
            updatedQuery.set("type", "posts");
        }

        console.log("🔍 更新された検索クエリ:", updatedQuery.toString());
        navigate(`/search?${updatedQuery.toString()}`);
    }, [searchParams, navigate]);

    // 検索フィールドのオプション（コンテストタグを削除）
const fieldsOptions = type === "users" 
    ? [
        { value: "nickname,favoriteAuthors", label: "ユーザー名・好きな作家タグ" },
        { value: "nickname", label: "ユーザー名" },
        { value: "favoriteAuthors", label: "好きな作家タグ" },
    ]
    : type === "series"
        ? [
            { value: "title,description,tags", label: "タイトル・説明・タグ" },
            { value: "title", label: "タイトル" },
            { value: "description", label: "説明" },
            { value: "tags", label: "タグ" },
        ]
        : [
            // 🔥 作品検索でもコンテストタグを検索対象から除外
            { value: "title,content,tags", label: "タイトル・本文・タグ" },
            { value: "title", label: "タイトル" },
            { value: "content", label: "本文" },
            { value: "tags", label: "タグ" },
            // 🚫 contestTagsオプションは削除（ユーザーが手動選択できないようにする）
        ];

    return (
        <FormControl component="fieldset" sx={{
            mb: 3,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormLabel component="legend" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    検索オプション
                </FormLabel>
                <Tooltip title="検索条件をクリア">
                    <IconButton size="small" onClick={clearSearchParams}>
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <KeywordFilter
                label="以下のキーワードをすべて含む"
                value={searchParams.mustInclude}
                onChange={(e) => handleInputChange("mustInclude", e.target.value)}
            />

            {type !== "users" && (
                <>
                    <KeywordFilter
                        label="以下のキーワードのいずれかを含む"
                        value={searchParams.shouldInclude}
                        onChange={(e) => handleInputChange("shouldInclude", e.target.value)}
                    />
                    <KeywordFilter
                        label="以下のキーワードを除外する"
                        value={searchParams.mustNotInclude}
                        onChange={(e) => handleInputChange("mustNotInclude", e.target.value)}
                    />
                    {/* 🆕 コンテストタグ検索フィールドを追加 */}
                    <Box sx={{ mb: 2 }}>
                        <FormLabel component="legend" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EmojiEventsIcon sx={{ mr: 1, fontSize: '1.2rem', color: 'primary.main' }} />
                            コンテストで検索（該当するコンテストタグを持つ作品を検索）
                        </FormLabel>
                        <TextField
                            label="コンテストタグ"
                            value={searchParams.contestTag || ''}
                            onChange={(e) => {
                                // コンテストタグが入力された場合、fieldsも自動的にcontestTagsを含める
                                const newValue = e.target.value;
                                handleInputChange("contestTag", newValue);

                                // 🔥 重要な修正: コンテストタグ入力時にfieldsを自動設定
                                if (newValue.trim()) {
                                    // コンテストタグがある場合は、fieldsにcontestTagsを追加
                                    const currentFields = Array.isArray(searchParams.fields) ? searchParams.fields :
                                        (searchParams.fields ? searchParams.fields.split(',') : ['title', 'content', 'tags']);

                                    if (!currentFields.includes('contestTags')) {
                                        currentFields.push('contestTags');
                                        handleInputChange("fields", currentFields.join(','));
                                    }
                                }
                            }}
                            placeholder="例: 春コンテスト"
                            fullWidth
                            variant="outlined"
                            size="small"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        {searchParams.contestTag && (
                            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                                「{searchParams.contestTag}」のコンテストタグを持つ作品を検索中
                            </Typography>
                        )}
                    </Box>
                </>
            )}

            <Divider sx={{ my: 2 }} />

            {/* AIツールフィルター (ユーザー検索では非表示) */}
            <AIToolFilter
                value={searchParams.aiTool}
                onChange={handleAIToolSelect}
                clearFilter={clearAIToolFilter}
                disabled={type === "users"}
            />

            {type !== "users" && <Divider sx={{ my: 2 }} />}

<RadioFilter
    label="検索対象"
    value={
        (() => {
            let currentFields = Array.isArray(searchParams.fields) ? 
                searchParams.fields.join(",") : searchParams.fields;
            
            // 表示用にcontestTagsを除外
            if (currentFields) {
                const fieldsArray = currentFields.split(',');
                const filteredFields = fieldsArray.filter(field => field !== 'contestTags');
                return filteredFields.join(',');
            }
            return currentFields;
        })()
    }
    options={fieldsOptions}
    onChange={(e) => {
        let newFields = e.target.value;
        
        // 🔥 重要: コンテストタグが入力されている場合は、contestTagsを自動的に追加
        if (searchParams.contestTag && searchParams.contestTag.trim()) {
            const fieldsArray = newFields.split(',');
            if (!fieldsArray.includes('contestTags')) {
                fieldsArray.push('contestTags');
                newFields = fieldsArray.join(',');
            }
        }
        
        handleInputChange("fields", newFields);
    }}
/>
            <RadioFilter
                label="タグ検索の精度"
                value={searchParams.tagSearchType}
                options={[
                    { value: "partial", label: "あいまい一致" },
                    { value: "exact", label: "完全一致" },
                ]}
                onChange={(e) => handleInputChange("tagSearchType", e.target.value)}
                disabled={type === "users"}
            />

            {type === "users" && (
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label="ユーザー検索は完全一致のみ対応"
                        variant="outlined"
                        color="primary"
                        size="small"
                    />
                </Box>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={handleSearchClick}
                sx={{ mt: 2 }}
                startIcon={<SearchIcon />}
                size="medium"
                fullWidth
            >
                検索
            </Button>
        </FormControl>
    );
};

export default SearchFilters;