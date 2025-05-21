import React, { memo } from 'react';
import PropTypes from 'prop-types';
import SongCard from './SongCard';

//notfound component for displaying when no results are found
const NotFound = memo(({ title, message }) => (
  <div className="not-found">
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
));

NotFound.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired
};

//searchresults component for displaying search results
const SearchResults = memo(({ tracks, onTrackSelect }) => (
  <>
    <h2 className="section-title">Select a song to find similar tracks:</h2>
    <div className="search-results">
      {tracks.map((track, index) => (
        <div 
          key={index} 
          className="search-result-item"
          onClick={() => onTrackSelect(track)}
        >
          <div className="search-result-name">{track.name}</div>
          <div className="search-result-artist">by {track.artist}</div>
        </div>
      ))}
    </div>
  </>
));

SearchResults.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    artist: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string })
    ]).isRequired
  })).isRequired,
  onTrackSelect: PropTypes.func.isRequired
};

//selectedtrack component for displaying the current track
const SelectedTrack = memo(({ track }) => (
  <div className="selected-track">
    <h2 className="section-title">Similar to:</h2>
    <div className="search-result-item selected">
      <div className="search-result-name">{track.name}</div>
      <div className="search-result-artist">
        by {track.artist.name || track.artist}
      </div>
    </div>
  </div>
));

SelectedTrack.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string.isRequired,
    artist: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string })
    ]).isRequired
  }).isRequired
};

//resultssection component for managing different result states
const ResultsSection = ({
  searchResults,
  notFound,
  results,
  selectedTrack,
  onTrackSelect
}) => {
  if (searchResults.length > 0) {
    return (
      <SearchResults 
        tracks={searchResults} 
        onTrackSelect={onTrackSelect}
      />
    );
  }

  if (notFound) {
    return <NotFound {...notFound} />;
  }

  if (results.length > 0) {
    return (
      <>
        {selectedTrack && <SelectedTrack track={selectedTrack} />}
        <div className="similar-tracks">
          {results.map((track, index) => (
            <SongCard key={index} track={track} />
          ))}
        </div>
      </>
    );
  }

  return null;
};

ResultsSection.propTypes = {
  searchResults: PropTypes.array.isRequired,
  notFound: PropTypes.shape({
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
  }),
  results: PropTypes.array.isRequired,
  selectedTrack: PropTypes.object,
  onTrackSelect: PropTypes.func.isRequired
};

export default memo(ResultsSection); 