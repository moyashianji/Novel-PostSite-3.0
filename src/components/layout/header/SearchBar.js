import React, { useState, useContext, useCallback, useRef, useEffect } from "react";
import { 
  Box, 
  Button, 
  InputBase, 
  Paper, 
  Popper, 
  Fade, 
  Typography, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ClickAwayListener,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Search as SearchIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as FireIcon
} from "@mui/icons-material";
import { styled, alpha } from "@mui/system";
import { SearchContext } from "../../../context/SearchContext";
import { useNavigate } from "react-router-dom";

const SearchBox = styled(Paper)(({ theme, isFocused }) => ({
  position: "relative",
  borderRadius: 50,
  backgroundColor: isFocused 
    ? theme.palette.background.paper 
    : theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.common.white, 0.9),
  border: `1px solid ${isFocused 
    ? theme.palette.primary.main 
    : theme.palette.mode === 'dark'
      ? alpha(theme.palette.divider, 0.3)
      : 'transparent'}`,
  boxShadow: isFocused 
    ? theme.palette.mode === 'dark'
      ? '0 4px 20px rgba(0, 0, 0, 0.4)'
      : '0 4px 20px rgba(0, 0, 0, 0.1)'
    : 'none',
  width: "100%",
  maxWidth: "600px",
  display: "flex",
  alignItems: "center",
  transition: "all 0.2s ease-in-out",
  backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : 'none',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 2px 15px rgba(0, 0, 0, 0.3)'
      : '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.primary.main,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  flex: 1,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    fontSize: 16,
    width: "100%",
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
      fontStyle: 'italic',
    },
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  borderRadius: 50,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  height: 40,
  fontWeight: 'bold',
  boxShadow: 'none',
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(0.5),
  transition: 'all 0.2s',
  minWidth: 80,
  width: 'auto',
  whiteSpace: 'nowrap',
  overflow: 'visible',
  textOverflow: 'clip',
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`
    : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 4px 12px rgba(0, 0, 0, 0.4)'
      : '0 4px 12px rgba(30, 68, 157, 0.3)',
    transform: 'translateY(-2px)',
    background: theme.palette.mode === 'dark'
      ? `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
      : `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
  },
  '& .MuiButton-label': {
    whiteSpace: 'nowrap',
    overflow: 'visible',
  }
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  padding: 6,
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.1)
    : 'transparent',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.15)
      : alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
}));

// Suggestion dropdown components
const SuggestionPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1200,
  width: '100%',
  maxWidth: 600,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 12px 30px rgba(0, 0, 0, 0.4)'
    : '0 8px 20px rgba(0, 0, 0, 0.15)',
  borderRadius: 12,
  overflow: 'hidden',
  marginTop: 8,
}));

const SuggestionContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  border: theme.palette.mode === 'dark'
    ? `1px solid ${alpha(theme.palette.divider, 0.2)}`
    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  backdropFilter: theme.palette.mode === 'dark' ? 'blur(20px)' : 'none',
}));

const TrendingChip = styled(Chip)(({ theme, index }) => {
  const isTop = index === 0;
  const baseColor = isTop ? theme.palette.error.main : theme.palette.primary.main;
  
  return {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(baseColor, 0.2)
      : alpha(baseColor, isTop ? 0.1 : 0.05),
    color: theme.palette.mode === 'dark'
      ? (isTop ? theme.palette.error.light : theme.palette.primary.light)
      : baseColor,
    border: theme.palette.mode === 'dark'
      ? `1px solid ${alpha(baseColor, 0.3)}`
      : 'none',
    fontWeight: index < 2 ? 'bold' : 'normal',
    margin: theme.spacing(0.5),
    transition: 'all 0.2s',
    backdropFilter: theme.palette.mode === 'dark' ? 'blur(10px)' : 'none',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(baseColor, 0.3)
        : alpha(baseColor, isTop ? 0.2 : 0.1),
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? `0 4px 12px ${alpha(baseColor, 0.3)}`
        : `0 2px 8px ${alpha(baseColor, 0.2)}`,
    },
    '& .MuiChip-icon': {
      color: 'inherit',
    }
  };
});

const SectionHeader = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(0.5),
    fontSize: 16,
    color: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.primary.main,
  }
}));

const HistoryListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.main, 0.15)
      : alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.text.secondary,
    fontSize: 18,
  }
}));

const ClearHistoryButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.error.main, 0.1)
      : alpha(theme.palette.error.main, 0.05),
    color: theme.palette.error.main,
  }
}));

const TrendingSection = styled(Box)(({ theme }) => ({
  '& .trending-chips': {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  }
}));

// Simulated trending searches and recent searches
const TRENDING_SEARCHES = [
  "ファンタジー", "恋愛小説", "ミステリー", "SF", "歴史小説"
];

const SearchBar = () => {
  const { handleSearch } = useContext(SearchContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches).slice(0, 5));
      } catch (e) {
        console.error('Failed to parse recent searches from localStorage');
      }
    }
    const fetchTags = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/tags/popular`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setTags(data);
          setError(false);
        } catch (error) {
          console.error('❌ Elasticsearch から人気タグ取得エラー:', error);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
  
      fetchTags();
  }, []);

  // Save recent search to localStorage
  const saveRecentSearch = useCallback((query) => {
    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  }, [recentSearches]);

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      handleSearch({ mustInclude: searchQuery });
      saveRecentSearch(searchQuery);
      navigate(`/search?mustInclude=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  }, [searchQuery, handleSearch, navigate, saveRecentSearch]);

  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  }, [handleSearchSubmit]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleClickAway = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  const handleSuggestionClick = useCallback((query) => {
    setSearchQuery(query);
    handleSearch({ mustInclude: query });
    saveRecentSearch(query);
    navigate(`/search?mustInclude=${encodeURIComponent(query)}`, { replace: true });
    setShowSuggestions(false);
  }, [handleSearch, navigate, saveRecentSearch]);

  const handleClearHistory = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }, []);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box 
        sx={{ 
          width: "100%", 
          display: "flex", 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          position: 'relative'
        }}
        ref={searchBoxRef}
      >
        <SearchBox isFocused={isFocused}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          
          <StyledInputBase
            placeholder="タイトル・タグなどで検索しましょう！"
            inputProps={{ "aria-label": "search" }}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            inputRef={inputRef}
            fullWidth
          />
          
          {searchQuery && (
            <ClearButton size="small" onClick={handleClearSearch} aria-label="clear search">
              <CloseIcon fontSize="small" />
            </ClearButton>
          )}

        </SearchBox>
        
        {!isMobile && (
          <SearchButton
            variant="contained"
            color="primary"
            disableElevation
            onClick={handleSearchSubmit}
          >
            検索
          </SearchButton>
        )}
        
        {/* Suggestion dropdown */}
        <SuggestionPopper
          open={showSuggestions}
          anchorEl={searchBoxRef.current}
          placement="bottom-start"
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={200}>
              <SuggestionContent elevation={0}>
                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <SectionHeader variant="subtitle2">
                        <HistoryIcon />
                        最近の検索
                      </SectionHeader>
                      <ClearHistoryButton onClick={handleClearHistory}>
                        履歴を消去
                      </ClearHistoryButton>
                    </Box>
                    <List disablePadding>
                      {recentSearches.map((search, index) => (
                        <HistoryListItem 
                          key={`recent-${index}`}
                          dense
                          button
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <HistoryIcon />
                          <ListItemText 
                            primary={search ? search.toString() : ''}
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              sx: { 
                                color: theme.palette.text.primary,
                                fontWeight: 500 
                              } 
                            }}
                          />
                        </HistoryListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {recentSearches.length > 0 && (
                  <Divider sx={{ 
                    my: 2,
                    borderColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.divider, 0.2)
                      : alpha(theme.palette.divider, 0.1)
                  }} />
                )}
                
                {/* Trending searches */}
                <TrendingSection>
                  <SectionHeader variant="subtitle2">
                    <TrendingUpIcon />
                    トレンド検索
                  </SectionHeader>
                  <Box className="trending-chips">
                    {tags.map((tag, index) => (
                      <TrendingChip
                        key={`trend-${index}`}
                        label={tag.tag ? tag.tag.toString() : ''}
                        index={index}
                        clickable
                        onClick={() => handleSuggestionClick(tag.tag)}
                        icon={index === 0 ? <FireIcon /> : undefined}
                      />
                    ))}
                  </Box>
                </TrendingSection>
              </SuggestionContent>
            </Fade>
          )}
        </SuggestionPopper>
      </Box>
    </ClickAwayListener>
  );
};

export default React.memo(SearchBar);