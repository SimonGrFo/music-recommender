import React, { memo } from 'react';
import PropTypes from 'prop-types';

//where the user inputs their search query
const SearchInput = memo(({ query, onQueryChange, onSearch }) => (
  <div className="input-group">
    <input 
      type="text" 
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      placeholder="Enter a song name..." 
      aria-label="Song search"
    />
    <button onClick={onSearch}>Search</button>
  </div>
));
SearchInput.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired
};

// where the user can select the options for the search, 
// currently the only option is to exclude songs from the same artist
const FilterOptions = memo(({ excludeSameArtist, onExcludeSameArtistChange }) => (
  <div className="search-options">
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={excludeSameArtist}
        onChange={(e) => onExcludeSameArtistChange(e.target.checked)}
        aria-label="Exclude songs from the same artist"
      />
      Exclude songs from the same artist
    </label>
  </div>
));
FilterOptions.propTypes = {
  excludeSameArtist: PropTypes.bool.isRequired,
  onExcludeSameArtistChange: PropTypes.func.isRequired
};

const SearchBox = ({ 
  query, 
  onQueryChange, 
  onSearch,
  excludeSameArtist,
  onExcludeSameArtistChange
}) => (
  <div className="search-box">
    <SearchInput 
      query={query}
      onQueryChange={onQueryChange}
      onSearch={onSearch}
    />
    <FilterOptions 
      excludeSameArtist={excludeSameArtist}
      onExcludeSameArtistChange={onExcludeSameArtistChange}
    />
  </div>
);
SearchBox.propTypes = {
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  excludeSameArtist: PropTypes.bool.isRequired,
  onExcludeSameArtistChange: PropTypes.func.isRequired
};

export default memo(SearchBox); 