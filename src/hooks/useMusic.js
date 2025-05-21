import { useState } from 'react';
import * as musicService from '../services/musicService';
import { ERROR_MESSAGES } from '../constants/messages';

// Helper functions
const isExactMatch = (track, query) => {
  const parts = query.split(' - ').map(part => part.trim().toLowerCase());
  if (parts.length === 2) {
    return track.name.toLowerCase() === parts[0] && 
           track.artist.toLowerCase() === parts[1];
  }
  return false;
};

const filterTracks = (tracks, originalTrack, excludeSameArtist) => {
  // Remove original track
  let filtered = tracks.filter(t => 
    t.name.toLowerCase() !== originalTrack.name.toLowerCase() ||
    t.artist.name.toLowerCase() !== originalTrack.artist.toLowerCase()
  );

  // Filter by same artist if enabled
  if (excludeSameArtist) {
    filtered = filtered.filter(t => 
      t.artist.name.toLowerCase() !== originalTrack.artist.toLowerCase()
    );
  }

  return filtered;
};

export const useMusic = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(null);
  const [excludeSameArtist, setExcludeSameArtist] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  
  const clearState = () => {
    setResults([]);
    setError('');
    setNotFound(null);
    setSearchResults([]);
  };

  const performSearch = async () => {
    if (!query.trim()) {
      setError(ERROR_MESSAGES.EMPTY_QUERY);
      return;
    }
    
    setLoading(true);
    clearState();
    
    try {
      const trackData = await musicService.searchTrack(query);
      const tracks = trackData.results?.trackmatches?.track;
      
      if (!tracks || (Array.isArray(tracks) && tracks.length === 0)) {
        setNotFound({
          title: ERROR_MESSAGES.NO_TRACK_ERROR,
          message: ERROR_MESSAGES.SEARCH_HINT
        });
        return;
      }

      const trackList = Array.isArray(tracks) ? tracks : [tracks];
      setSearchResults(trackList);
      
      // Auto-search if single result or exact match
      const exactMatch = trackList.find(track => isExactMatch(track, query));
      if (trackList.length === 1 || exactMatch) {
        await findSimilarTracks(exactMatch || trackList[0]);
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setError(ERROR_MESSAGES.API_ERROR);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const findSimilarTracks = async (track) => {
    if (!track) return;

    setLoading(true);
    clearState();
    setSelectedTrack(track);
    
    try {
      const similarData = await musicService.getSimilarTracks(track.artist, track.name);
      const tracks = similarData.similartracks?.track;
      
      if (!tracks || (Array.isArray(tracks) && tracks.length === 0)) {
        setNotFound({
          title: ERROR_MESSAGES.NO_SIMILAR_TRACKS,
          message: ERROR_MESSAGES.SIMILAR_TRACKS_HINT
        });
        return;
      }

      const trackList = Array.isArray(tracks) ? tracks : [tracks];
      const filteredTracks = filterTracks(trackList, track, excludeSameArtist);

      if (filteredTracks.length === 0) {
        setNotFound({
          title: ERROR_MESSAGES.NO_SIMILAR_TRACKS,
          message: excludeSameArtist ? ERROR_MESSAGES.EXCLUDE_ARTIST_HINT : ERROR_MESSAGES.SIMILAR_TRACKS_HINT
        });
        return;
      }

      setResults(filteredTracks);
      setSearchResults([]);
      
    } catch (error) {
      console.error('Error finding similar tracks:', error);
      setError(ERROR_MESSAGES.API_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    notFound,
    performSearch,
    excludeSameArtist,
    setExcludeSameArtist,
    searchResults,
    selectedTrack,
    findSimilarTracks
  };
};

export default useMusic; 