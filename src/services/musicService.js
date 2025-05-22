import { API_KEY, API_BASE_URL } from '../config/api';
import { MATCH_SCORES, GENRE_SPECIFICITY } from '../constants/messages';

// Simple cache for track info
const trackInfoCache = new Map();

// Helper functions
const createLastFmUrl = (method, params) => {
  const queryParams = new URLSearchParams({
    method,
    api_key: API_KEY,
    format: 'json',
    ...params
  });
  return `${API_BASE_URL}?${queryParams}`;
};

const fetchJson = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      throw new Error(`Last.fm API error: ${data.message}`);
    }
    return data;
  } catch (error) {
    console.error(`API request failed:`, error);
    throw error;
  }
};

const normalizeArray = (data) => Array.isArray(data) ? data : [data];

const isDuplicateTrack = (track1, track2) => 
  track1.name.toLowerCase() === track2.name.toLowerCase() && 
  track1.artist.name.toLowerCase() === track2.artist.name.toLowerCase();

const getTrackInfo = async (artist, track) => {
  const cacheKey = `${artist.toLowerCase()}-${track.toLowerCase()}`;
  
  if (trackInfoCache.has(cacheKey)) {
    return trackInfoCache.get(cacheKey);
  }

  try {
    const url = createLastFmUrl('track.getInfo', {
      artist: artist,
      track: track,
      autocorrect: 1
    });
    
    const infoData = await fetchJson(url);
    
    if (infoData.track) {
      trackInfoCache.set(cacheKey, infoData);
    }
    
    return infoData;
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// Calculate genre bonus based on genre specificity
const calculateGenreBonus = (tags) => {
  if (!tags || tags.length === 0) return 0;
  
  let maxBonus = 0;
  
  for (const tag of tags) {
    const tagName = tag.name.toLowerCase();
    const specificity = GENRE_SPECIFICITY[tagName];
    if (specificity) {
      const bonus = MATCH_SCORES.GENRE_SPECIFICITY[specificity];
      maxBonus = Math.max(maxBonus, bonus);
    }
  }
  
  return maxBonus;
};

// Search for tracks
export const searchTrack = async (query) => {
  try {
    const [searchQuery, artistQuery = ''] = query.split(' - ').map(part => part.trim());
    const url = createLastFmUrl('track.search', {
      track: searchQuery,
      ...(artistQuery && { artist: artistQuery }),
      limit: 8,
      autocorrect: 1
    });

    const data = await fetchJson(url);
    const tracks = data.results?.trackmatches?.track;
    
    if (!tracks) return data;

    const tracksWithInfo = await Promise.all(
      normalizeArray(tracks).map(async (track) => {
        try {
          const infoData = await getTrackInfo(track.artist, track.name);
          return infoData.track ? {
            ...track,
            album: infoData.track.album || null,
            duration: infoData.track.duration,
            playcount: infoData.track.playcount,
            listeners: infoData.track.listeners,
            tags: infoData.track.toptags?.tag || [],
            isSearchResult: true
          } : { ...track, isSearchResult: true };
        } catch (error) {
          return { ...track, isSearchResult: true };
        }
      })
    );

    return { results: { trackmatches: { track: tracksWithInfo } } };
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Get similar tracks
export const getSimilarTracks = async (artist, track) => {
  try {
    const trackInfo = await getTrackInfo(artist, track);
    if (trackInfo.error) throw new Error(`Last.fm API error: ${trackInfo.message}`);

    // Get source track info
    const trackTags = trackInfo.track?.toptags?.tag || [];
    const sourceGenres = trackTags.map(tag => tag.name.toLowerCase());
    
    // Get top 5 tags
    const selectedTags = trackTags.slice(0, 5);

    // Collect tracks from all sources
    const [similarTracks, artistTracks, tagTracks] = await Promise.all([
      getSimilarTracksFromLastFm(artist, track),
      getArtistTopTracks(artist),
      getTagBasedTracks(selectedTags)
    ]);

    // Combine all tracks
    let allTracks = [...similarTracks];

    // Add tag-based tracks
    tagTracks.forEach(track => {
      if (!allTracks.some(t => isDuplicateTrack(t, track))) {
        allTracks.push(track);
      }
    });

    // Add artist tracks
    artistTracks.forEach(track => {
      if (!allTracks.some(t => isDuplicateTrack(t, track))) {
        allTracks.push(track);
      }
    });

    // Apply genre matching and adjust scores
    allTracks = allTracks.map(track => {
      // Calculate genre overlap score
      let adjustedMatch = track.match;
      
      if (track.tags && track.tags.length > 0) {
        const trackGenres = track.tags.map(tag => tag.name.toLowerCase());
        const overlapping = sourceGenres.filter(genre => trackGenres.includes(genre));
        
        // Bonus for matching genres (more significant)
        adjustedMatch += overlapping.length * 0.08;
        
        // Penalty for no genre match
        if (overlapping.length === 0 && sourceGenres.length > 0) {
          adjustedMatch *= 0.7;
        }
      }
      
      // Add popularity factor if available
      if (track.listeners || track.playcount) {
        adjustedMatch += calculatePopularityScore(track.listeners, track.playcount);
      }
      
      // Add some randomization for variety
      const randomFactor = 0.95 + (Math.random() * 0.1);
      adjustedMatch *= randomFactor;
      
      // Cap at 1.0 and curve the score differently
      adjustedMatch = Math.min(1.0, adjustedMatch);
      
      // Use a different curve to spread out percentages
      const finalMatch = Math.pow(adjustedMatch, 1.1);
      
      return {
        ...track,
        match: finalMatch,
        normalizedMatch: Math.round(finalMatch * 100)
      };
    });

    // Sort tracks by match score
    allTracks.sort((a, b) => b.match - a.match);

    // Get detailed info for top tracks
    const tracksWithInfo = await Promise.all(
      allTracks.slice(0, 20).map(async (track) => {
        try {
          const infoData = await getTrackInfo(track.artist.name, track.name);
          if (!infoData.track) return { ...track, isSearchResult: false };

          // Get primary genre if available
          const tags = infoData.track.toptags?.tag || [];
          const primaryGenre = getPrimaryGenre(tags);
          
          return {
            ...track,
            album: infoData.track.album || null,
            image: infoData.track.album ? infoData.track.album.image : track.image,
            duration: infoData.track.duration,
            playcount: infoData.track.playcount,
            listeners: infoData.track.listeners,
            primaryGenre,
            isSearchResult: false
          };
        } catch (error) {
          return { ...track, isSearchResult: false };
        }
      })
    );

    return {
      similartracks: {
        track: tracksWithInfo,
        sourceTrack: trackInfo.track
      }
    };
  } catch (error) {
    console.error('Get similar tracks error:', error);
    throw error;
  }
};

// Get primary genre from track tags
const getPrimaryGenre = (tags) => {
  if (!tags || tags.length === 0) return null;
  
  // First check for very specific genres
  const verySpecific = tags.find(tag => 
    GENRE_SPECIFICITY[tag.name.toLowerCase()] === 'VERY_SPECIFIC'
  );
  
  if (verySpecific) return verySpecific.name;
  
  // Then check for specific genres
  const specific = tags.find(tag => 
    GENRE_SPECIFICITY[tag.name.toLowerCase()] === 'SPECIFIC'
  );
  
  if (specific) return specific.name;
  
  // Return the first tag as fallback
  return tags[0].name;
};

// Get similar tracks from Last.fm
const getSimilarTracksFromLastFm = async (artist, track) => {
  try {
    const url = createLastFmUrl('track.getSimilar', {
      artist,
      track,
      limit: 30,
      autocorrect: 1
    });
    
    const { similartracks } = await fetchJson(url);
    if (!similartracks?.track) return [];
    
    return normalizeArray(similartracks.track).map(track => ({
      ...track,
      match: parseFloat(track.match || 0.5) * MATCH_SCORES.LASTFM_SIMILAR
    }));
  } catch (error) {
    console.error('Error fetching similar tracks:', error);
    return [];
  }
};

// Calculate popularity score for better match variation
const calculatePopularityScore = (listeners, playcount) => {
  const listenerScore = listeners ? Math.min(0.15, Math.log10(parseInt(listeners) || 1) / 7) : 0;
  const playScore = playcount ? Math.min(0.15, Math.log10(parseInt(playcount) || 1) / 8) : 0;
  return listenerScore + playScore;
};

// Get tracks based on tags
const getTagBasedTracks = async (tags) => {
  if (!tags || tags.length === 0) return [];
  
  try {
    // Get tracks for each tag (limited to first 3 tags)
    const tagResults = await Promise.all(
      tags.slice(0, 3).map(async (tag, index) => {
        const url = createLastFmUrl('tag.getTopTracks', {
          tag: tag.name,
          limit: 20
        });
        
        const { tracks } = await fetchJson(url);
        if (!tracks?.track) return [];
        
        const tagWeight = 1 - (index * 0.15); // Increase weight difference between tags
        
        return normalizeArray(tracks.track).map(track => {
          // Add some randomization for variety (between 0.85 and 1.15)
          const randomFactor = 0.85 + (Math.random() * 0.3);
          const baseScore = MATCH_SCORES.TAG_BASED * tagWeight * randomFactor;
          
          return {
            ...track,
            match: Math.min(1.0, baseScore),
            normalizedMatch: Math.round(baseScore * 100),
            tags: [],
            matchDetails: {
              source: 'tag',
              tagName: tag.name,
              tagWeight
            }
          };
        });
      })
    );
    
    return tagResults.flat();
  } catch (error) {
    console.error('Error fetching tag tracks:', error);
    return [];
  }
};

// Get top tracks from artist
const getArtistTopTracks = async (artist) => {
  try {
    const url = createLastFmUrl('artist.getTopTracks', {
      artist,
      limit: 15
    });
    
    const { toptracks } = await fetchJson(url);
    if (!toptracks?.track) return [];
    
    return normalizeArray(toptracks.track).map((track, index) => {
      // More aggressive position decay
      const positionWeight = Math.max(0.4, 1 - (index * 0.08));
      // Add randomization for variety
      const randomFactor = 0.9 + (Math.random() * 0.2);
      const matchScore = MATCH_SCORES.ARTIST_TOP * positionWeight * randomFactor;
      
      return {
        ...track,
        match: matchScore,
        normalizedMatch: Math.round(matchScore * 100),
        tags: [],
        matchDetails: {
          source: 'artist_top',
          position: index
        }
      };
    });
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    return [];
  }
};

