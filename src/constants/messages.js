export const ERROR_MESSAGES = {
  EMPTY_QUERY: 'Please enter a song name',
  API_ERROR: 'Failed to fetch recommendations. Please try again.',
  NO_TRACK_ERROR: 'Track not found',
  NO_SIMILAR_TRACKS: 'No similar tracks found',
  SEARCH_HINT: 'Try a different song or check the spelling',
  SIMILAR_TRACKS_HINT: 'Try a different song or artist',
  EXCLUDE_ARTIST_HINT: 'Try disabling "Exclude songs from the same artist"'
};

export const SEARCH_DEFAULTS = {
  LIMIT: 8,
  SIMILAR_LIMIT: 30,
  TAG_LIMIT: 20
};

export const MATCH_SCORES = {
  LASTFM_SIMILAR: 1.0,
  TAG_BASED: 0.5,
  ARTIST_TOP: 0.4
}; 