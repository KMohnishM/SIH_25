// Search Page Component
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
  ListItemAvatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
  History,
  TrendingUp,
  FilterList,
  Description,
  Visibility,
  GetApp,
  ExpandMore,
  Star,
} from '@mui/icons-material';

import {
  performSearch,
  fetchSuggestions,
  setQuery,
  setFilters,
  clearResults,
  addRecentSearch,
} from '../store/slices/searchSlice';

const SearchPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    query,
    results,
    suggestions,
    searchMetadata,
    filters,
    recentSearches,
    loading,
    error
  } = useSelector((state) => state.search);
  const { user } = useSelector((state) => state.auth);

  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (localQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        dispatch(fetchSuggestions({ query: localQuery, role: user?.role }));
        setShowSuggestions(true);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setShowSuggestions(false);
    }
  }, [localQuery, dispatch, user?.role]);

  const handleSearch = () => {
    if (localQuery.trim()) {
      dispatch(setQuery(localQuery));
      dispatch(performSearch({ query: localQuery, filters }));
      dispatch(addRecentSearch(localQuery));
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion.text);
    dispatch(setQuery(suggestion.text));
    dispatch(performSearch({ query: suggestion.text, filters }));
    dispatch(addRecentSearch(suggestion.text));
    setShowSuggestions(false);
  };

  const handleRecentSearchClick = (recentQuery) => {
    setLocalQuery(recentQuery);
    dispatch(setQuery(recentQuery));
    dispatch(performSearch({ query: recentQuery, filters }));
    setShowSuggestions(false);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    dispatch(setFilters(newFilters));
    if (query) {
      dispatch(performSearch({ query, filters: newFilters }));
    }
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    dispatch(setQuery(''));
    dispatch(clearResults());
    setShowSuggestions(false);
  };

  const highlightText = (text, highlights) => {
    if (!highlights || highlights.length === 0) return text;
    
    let result = text;
    // Simple highlight implementation - in real app would be more sophisticated
    highlights.forEach(([start, end]) => {
      const before = result.substring(0, start);
      const highlighted = result.substring(start, end);
      const after = result.substring(end);
      result = `${before}<mark style="background-color: #ffeb3b; padding: 0 2px;">${highlighted}</mark>${after}`;
    });
    
    return result;
  };

  const SearchResult = ({ result }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="h3" sx={{ color: 'primary.main', cursor: 'pointer' }}
            onClick={() => navigate(`/documents/${result.document_id}`)}
          >
            {result.title}
          </Typography>
          <Chip
            label={`${Math.round(result.relevance_score * 100)}% match`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {result.summary}
        </Typography>
        
        {result.matched_snippets?.map((snippet, index) => (
          <Paper key={index} sx={{ p: 1, mt: 1, bgcolor: 'grey.50' }}>
            <Typography
              variant="body2"
              dangerouslySetInnerHTML={{
                __html: highlightText(snippet.text, snippet.highlight_positions)
              }}
            />
          </Paper>
        ))}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Visibility />}
          onClick={() => navigate(`/documents/${result.document_id}`)}
        >
          View Document
        </Button>
        <Button
          size="small"
          startIcon={<GetApp />}
          onClick={() => window.open(`/documents/${result.document_id}/download`, '_blank')}
        >
          Download
        </Button>
        <IconButton size="small" color="default">
          <Star />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Search Documents
      </Typography>

      {/* Search Input */}
      <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search for documents, policies, reports..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setShowSuggestions(localQuery.length >= 2)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: localQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={!localQuery.trim() || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Search Suggestions */}
        {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
          <Paper
            sx={{
              position: 'absolute',
              top: '100%',
              left: 16,
              right: 16,
              zIndex: 1000,
              mt: 1,
              maxHeight: 400,
              overflow: 'auto',
            }}
          >
            {recentSearches.length > 0 && (
              <>
                <Box sx={{ p: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="textSecondary">
                    <History sx={{ fontSize: 14, mr: 0.5 }} />
                    Recent Searches
                  </Typography>
                </Box>
                {recentSearches.slice(0, 3).map((recent, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => handleRecentSearchClick(recent)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.300' }}>
                        <History sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={recent} />
                  </ListItemButton>
                ))}
                <Divider />
              </>
            )}
            
            {suggestions.length > 0 && (
              <>
                <Box sx={{ p: 1, bgcolor: 'grey.100' }}>
                  <Typography variant="caption" color="textSecondary">
                    <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />
                    Suggestions
                  </Typography>
                </Box>
                {suggestions.map((suggestion, index) => (
                  <ListItemButton
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                        <SearchIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={suggestion.text}
                      secondary={`${suggestion.frequency} searches`}
                    />
                  </ListItemButton>
                ))}
              </>
            )}
          </Paper>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Document Type</InputLabel>
                    <Select
                      value={filters.type || ''}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="safety">Safety</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="finance">Finance</MenuItem>
                      <MenuItem value="regulatory">Regulatory</MenuItem>
                      <MenuItem value="hr">HR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={filters.department || ''}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      <MenuItem value="operations">Operations</MenuItem>
                      <MenuItem value="engineering">Engineering</MenuItem>
                      <MenuItem value="finance">Finance</MenuItem>
                      <MenuItem value="sustainability">Sustainability</MenuItem>
                      <MenuItem value="hr">HR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Range</InputLabel>
                    <Select
                      value={filters.date_range || ''}
                      onChange={(e) => handleFilterChange('date_range', e.target.value)}
                    >
                      <MenuItem value="">Any Time</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="week">This Week</MenuItem>
                      <MenuItem value="month">This Month</MenuItem>
                      <MenuItem value="quarter">This Quarter</MenuItem>
                      <MenuItem value="year">This Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Search Type</InputLabel>
                    <Select
                      value={filters.search_type || 'semantic'}
                      onChange={(e) => handleFilterChange('search_type', e.target.value)}
                    >
                      <MenuItem value="semantic">Semantic</MenuItem>
                      <MenuItem value="keyword">Keyword</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>

      {/* Search Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === 'string' ? error : error.search || 'Search failed'}
        </Alert>
      )}

      {query && searchMetadata && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Found {searchMetadata.total_results} results for "{searchMetadata.query}" 
            in {searchMetadata.search_time_ms}ms
          </Typography>
          {searchMetadata.suggestions && searchMetadata.suggestions.length > 0 && (
            <Box mt={1}>
              <Typography variant="caption" color="textSecondary">
                Related searches:
              </Typography>
              {searchMetadata.suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  size="small"
                  variant="outlined"
                  onClick={() => handleSuggestionClick({ text: suggestion })}
                  sx={{ ml: 0.5, cursor: 'pointer' }}
                />
              ))}
            </Box>
          )}
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {results.length > 0 ? (
            <Box>
              {results.map((result) => (
                <SearchResult key={result.document_id} result={result} />
              ))}
            </Box>
          ) : query ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No results found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Try different keywords or adjust your filters
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Description sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                Search KMRL Documents
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Find safety protocols, maintenance schedules, compliance reports, and more
              </Typography>
              {recentSearches.length > 0 && (
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    Recent searches:
                  </Typography>
                  {recentSearches.slice(0, 5).map((recent, index) => (
                    <Chip
                      key={index}
                      label={recent}
                      size="small"
                      variant="outlined"
                      onClick={() => handleRecentSearchClick(recent)}
                      sx={{ m: 0.25, cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default SearchPage;