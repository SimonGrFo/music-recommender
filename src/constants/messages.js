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
  LASTFM_SIMILAR: 0.7,
  TAG_BASED: 0.5,
  ARTIST_TOP: 0.4,
  GENRE_SPECIFICITY: {
    VERY_SPECIFIC: 0.4,
    SPECIFIC: 0.2,
    GENERAL: 0.1,
    MOOD: 0.05
  }
};

export const GENRE_SPECIFICITY = {
  // HIP-HOP/RAP SUBGENRES
  // Very specific hip-hop genres
  'conscious hip hop': 'VERY_SPECIFIC',
  'southern hip hop': 'VERY_SPECIFIC',
  'trap rap': 'VERY_SPECIFIC',
  'boom bap': 'VERY_SPECIFIC',
  'alternative hip hop': 'VERY_SPECIFIC',
  'underground hip hop': 'VERY_SPECIFIC',
  'jazz rap': 'VERY_SPECIFIC',
  'gangsta rap': 'VERY_SPECIFIC',
  'cloud rap': 'VERY_SPECIFIC',
  'instrumental hip hop': 'VERY_SPECIFIC',
  'grime': 'VERY_SPECIFIC',
  'drill': 'VERY_SPECIFIC',
  'uk drill': 'VERY_SPECIFIC',
  'chicago drill': 'VERY_SPECIFIC',
  'memphis rap': 'VERY_SPECIFIC',
  'atlanta rap': 'VERY_SPECIFIC',
  'west coast rap': 'VERY_SPECIFIC',
  'east coast hip hop': 'VERY_SPECIFIC',
  'abstract hip hop': 'VERY_SPECIFIC',
  'experimental hip hop': 'VERY_SPECIFIC',
  'lofi hip hop': 'VERY_SPECIFIC',
  'phonk': 'VERY_SPECIFIC',
  
  // ROCK SUBGENRES
  'slacker rock': 'VERY_SPECIFIC',
  'midwest emo': 'VERY_SPECIFIC',
  'dream pop': 'VERY_SPECIFIC',
  'post-punk revival': 'VERY_SPECIFIC',
  'noise rock': 'VERY_SPECIFIC',
  'shoegaze': 'VERY_SPECIFIC',
  'art punk': 'VERY_SPECIFIC',
  'math rock': 'VERY_SPECIFIC',
  'post-hardcore': 'VERY_SPECIFIC',
  'garage rock': 'VERY_SPECIFIC',
  'stoner rock': 'VERY_SPECIFIC',
  'prog rock': 'VERY_SPECIFIC',
  'space rock': 'VERY_SPECIFIC',
  
  // ELECTRONIC SUBGENRES
  'ambient techno': 'VERY_SPECIFIC',
  'breakbeat': 'VERY_SPECIFIC',
  'drum and bass': 'VERY_SPECIFIC',
  'dubstep': 'VERY_SPECIFIC',
  'future bass': 'VERY_SPECIFIC',
  'house': 'VERY_SPECIFIC',
  'techno': 'VERY_SPECIFIC',
  'synthwave': 'VERY_SPECIFIC',
  'electro': 'VERY_SPECIFIC',
  'vaporwave': 'VERY_SPECIFIC',
  
  // FOLK/ACOUSTIC SUBGENRES
  'psychedelic folk': 'VERY_SPECIFIC',
  'folktronica': 'VERY_SPECIFIC',
  'neo-psychedelia': 'VERY_SPECIFIC',
  'freak folk': 'VERY_SPECIFIC',
  'chamber folk': 'VERY_SPECIFIC',
  'anti-folk': 'VERY_SPECIFIC',

  // SPECIFIC GENRES (BROADER CATEGORIES)
  // Hip-hop/Rap
  'hip hop': 'SPECIFIC',
  'rap': 'SPECIFIC',
  'hardcore hip hop': 'SPECIFIC',
  'old school hip hop': 'SPECIFIC',
  'modern hip hop': 'SPECIFIC',
  'trap': 'SPECIFIC',
  'uk hip hop': 'SPECIFIC',
  'french hip hop': 'SPECIFIC',
  'german hip hop': 'SPECIFIC',
  
  // Rock/Alternative
  'indie rock': 'SPECIFIC',
  'alt-country': 'SPECIFIC',
  'indie folk': 'SPECIFIC',
  'indie pop': 'SPECIFIC',
  'post-rock': 'SPECIFIC',
  'art rock': 'SPECIFIC',
  'experimental rock': 'SPECIFIC',
  'alternative rock': 'SPECIFIC',
  'folk rock': 'SPECIFIC',
  'electronic rock': 'SPECIFIC',
  'punk rock': 'SPECIFIC',
  'psychedelic rock': 'SPECIFIC',
  
  // Electronic
  'idm': 'SPECIFIC',
  'downtempo': 'SPECIFIC',
  'ambient': 'SPECIFIC',
  'trip hop': 'SPECIFIC',
  'electronica': 'SPECIFIC',
  'chillwave': 'SPECIFIC',

  // GENERAL GENRES (BROAD CATEGORIES)
  'hip-hop/rap': 'GENERAL',
  'rock': 'GENERAL',
  'electronic': 'GENERAL',
  'folk': 'GENERAL',
  'pop': 'GENERAL',
  'punk': 'GENERAL',
  'metal': 'GENERAL',
  'jazz': 'GENERAL',
  'classical': 'GENERAL',
  'rnb': 'GENERAL',
  'soul': 'GENERAL',
  'funk': 'GENERAL',
  'country': 'GENERAL',
  'blues': 'GENERAL',
  'reggae': 'GENERAL',

  // MOODS AND ATMOSPHERES
  'lyrical': 'MOOD',
  'melodic': 'MOOD',
  'aggressive': 'MOOD',
  'conscious': 'MOOD',
  'chill': 'MOOD',
  'melancholic': 'MOOD',
  'energetic': 'MOOD',
  'atmospheric': 'MOOD',
  'dark': 'MOOD',
  'upbeat': 'MOOD',
  'dreamy': 'MOOD',
  'mellow': 'MOOD',
  'relaxed': 'MOOD',
  'emotional': 'MOOD'
}; 