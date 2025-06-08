import React from "react";
import { Container } from "@mui/material";
import SearchFilters from "../components/search/SearchFilters";
import SearchResults from "../components/search/SearchResults"; // 🔥 追加

const SearchPage = () => {
  return (
    <Container sx={{ mt: 4 }}>
      <SearchFilters />
      <SearchResults />
    </Container>
  );
};

export default SearchPage;