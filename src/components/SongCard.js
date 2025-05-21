import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { formatNumber, formatDuration } from '../utils/formatters';
import { getImageUrl, DEFAULT_TRACK_IMAGE } from '../utils/imageHelpers';

// component for displaying the match percentage
const MatchIndicator = memo(({ percentage, details }) => {
  // Format the match source for display
  const getMatchSource = () => {
    if (!details) return '';
    switch (details.source) {
      case 'tag':
        return ` (${details.tagName})`;
      case 'artist_top':
        return ' (Artist Top)';
      default:
        return '';
    }
  };

  return (
    <div className="match-container">
      <div className="match-bar">
        <div 
          className="match-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="match">{percentage}% match{getMatchSource()}</div>
    </div>
  );
});

MatchIndicator.propTypes = {
  percentage: PropTypes.number.isRequired,
  details: PropTypes.object
};

//statistics component for displaying play count and listeners
const Statistics = memo(({ playcount, listeners }) => {
  if (!playcount && !listeners) return null;
  
  return (
    <div className="stats">
      {playcount > 0 && (
        <span className="plays">{formatNumber(playcount)} plays</span>
      )}
      {listeners > 0 && (
        <span className="listeners">{formatNumber(listeners)} listeners</span>
      )}
    </div>
  );
});

Statistics.propTypes = {
  playcount: PropTypes.number,
  listeners: PropTypes.number
};

//songcard component for displaying track information
const SongCard = ({ track }) => {
  // More robust match percentage calculation with debug logging
  const matchPercentage = (() => {
    const normalizedMatch = track.normalizedMatch;
    const rawMatch = parseFloat(track.match || 0);
    
    console.log('Match calculation for:', track.name, {
      normalizedMatch,
      rawMatch,
      finalMatch: normalizedMatch || Math.round(rawMatch * 100)
    });
    
    return normalizedMatch || Math.round(rawMatch * 100);
  })();
  
  const imageUrl = getImageUrl(track);
  const artistName = track.artist.name || track.artist;

  return (
    <div className="song-card">
      <div className="song-image">
        <img 
          src={imageUrl} 
          alt={`${track.name} by ${artistName}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_TRACK_IMAGE;
          }}
        />
      </div>
      <div className="song-info">
        <div className="song-name">{track.name}</div>
        <div className="artist-name">{artistName}</div>
        <MatchIndicator 
          percentage={matchPercentage} 
          details={track.matchDetails}
        />
        {track.duration > 0 && (
          <div className="duration">
            {formatDuration(track.duration)}
          </div>
        )}
        <Statistics 
          playcount={track.playcount} 
          listeners={track.listeners}
        />
      </div>
    </div>
  );
};

SongCard.propTypes = {
  track: PropTypes.shape({
    name: PropTypes.string.isRequired,
    artist: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string
      })
    ]).isRequired,
    duration: PropTypes.number,
    playcount: PropTypes.number,
    listeners: PropTypes.number,
    match: PropTypes.number,
    normalizedMatch: PropTypes.number,
    matchDetails: PropTypes.object,
    image: PropTypes.arrayOf(PropTypes.shape({
      '#text': PropTypes.string,
      size: PropTypes.string
    })),
    album: PropTypes.shape({
      image: PropTypes.arrayOf(PropTypes.shape({
        '#text': PropTypes.string,
        size: PropTypes.string
      }))
    })
  }).isRequired
};

export default memo(SongCard); 