import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { formatDuration, formatNumber } from '../utils/formatters';
import { getImageUrl, DEFAULT_TRACK_IMAGE } from '../utils/imageHelpers';

// Simplified match indicator with genre information
const MatchIndicator = memo(({ percentage, matchReason, primaryGenre }) => {
  return (
    <div className="match-container">
      <div className="match-info">
        <div className="match-percentage">{percentage}%</div>
      </div>
      <div className="match-bar">
        <div 
          className="match-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {primaryGenre && (
        <div className="genre-tag">{primaryGenre}</div>
      )}
    </div>
  );
});

// Statistics component for displaying play count and listeners
const Statistics = memo(({ playcount, listeners }) => {
  if (!playcount && !listeners) return null;
  
  return (
    <div className="stats">
      {playcount > 0 && <span className="plays">{formatNumber(playcount)} plays</span>}
      {listeners > 0 && <span className="listeners">{formatNumber(listeners)} listeners</span>}
    </div>
  );
});

// SongCard component with genre information
const SongCard = ({ track }) => {
  const matchPercentage = track.normalizedMatch || Math.round(parseFloat(track.match || 0) * 100);
  const imageUrl = getImageUrl(track);
  const artistName = track.artist.name || track.artist;

  return (
    <div className="song-card">
      <div className="song-image">
        <img 
          src={imageUrl} 
          alt={`${track.name}`}
          onError={(e) => { e.target.src = DEFAULT_TRACK_IMAGE; }}
        />
      </div>
      <div className="song-info">
        <div className="song-name">{track.name}</div>
        <div className="artist-name">{artistName}</div>
        <MatchIndicator 
          percentage={matchPercentage} 
          matchReason={track.matchReason} 
          primaryGenre={track.primaryGenre}
        />
        {track.duration > 0 && <div className="duration">{formatDuration(track.duration)}</div>}
        <Statistics playcount={track.playcount} listeners={track.listeners} />
      </div>
    </div>
  );
};

// Update PropTypes
SongCard.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string.isRequired,
    artist: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({ name: PropTypes.string })
    ]).isRequired,
    duration: PropTypes.number,
    playcount: PropTypes.number,
    listeners: PropTypes.number,
    match: PropTypes.number,
    normalizedMatch: PropTypes.number,
    matchReason: PropTypes.object,
    primaryGenre: PropTypes.string
  }).isRequired
};

export default memo(SongCard); 