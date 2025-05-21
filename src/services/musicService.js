import { API_KEY, API_BASE_URL } from '../config/api';
import { MATCH_SCORES } from '../constants/messages';

// Cache for track info to reduce API calls
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
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(`Last.fm API error: ${data.message}`);
  }
  return data;
};

const normalizeArray = (data) => Array.isArray(data) ? data : [data];

const calculatePopularityScore = (listeners, playcount, maxBonus = 0.3) => {
  const listenerScore = listeners > 0 ? Math.min(maxBonus/2, Math.log10(parseInt(listeners) || 0) / 7) : 0;
  const playScore = playcount > 0 ? Math.min(maxBonus/2, Math.log10(parseInt(playcount) || 0) / 8) : 0;
  return Math.min(maxBonus, listenerScore + playScore);
};

const isDuplicateTrack = (track1, track2) => 
  track1.name.toLowerCase() === track2.name.toLowerCase() && 
  track1.artist.name.toLowerCase() === track2.artist.name.toLowerCase();

const getTrackInfo = async (artist, track) => {
  const cacheKey = `${artist.toLowerCase()}-${track.toLowerCase()}`;
  
  if (trackInfoCache.has(cacheKey)) {
    return trackInfoCache.get(cacheKey);
  }

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
};

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
          console.error('Error fetching track info:', error);
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

export const getSimilarTracks = async (artist, track) => {
  try {
    const trackInfo = await getTrackInfo(artist, track);
    if (trackInfo.error) throw new Error(`Last.fm API error: ${trackInfo.message}`);

    // Collect tracks from all sources
    const [similarTracks, artistTracks] = await Promise.all([
      getSimilarTracksFromLastFm(artist, track),
      getArtistTopTracks(artist)
    ]);

    let allTracks = [...similarTracks];

    // Add tag-based recommendations if tags are available
    if (trackInfo.track?.toptags?.tag) {
      const tags = trackInfo.track.toptags.tag.slice(0, 3);
      const tagTracks = (await Promise.all(
        tags.map((tag, index) => getTracksByTag(tag, index))
      )).flat();

      // Add unique tag-based tracks
      tagTracks.forEach(track => {
        if (!allTracks.some(t => isDuplicateTrack(t, track))) {
          allTracks.push(track);
        }
      });
    }

    // Add unique artist tracks
    artistTracks.forEach(track => {
      if (!allTracks.some(t => isDuplicateTrack(t, track))) {
        allTracks.push(track);
      }
    });

    // Get detailed info for top 20 tracks
    const tracksWithInfo = await Promise.all(
      allTracks.slice(0, 20).map(async (track) => {
        try {
          const infoData = await getTrackInfo(track.artist.name, track.name);
          return infoData.track ? {
            ...track,
            album: infoData.track.album || null,
            image: infoData.track.album ? infoData.track.album.image : track.image,
            duration: infoData.track.duration,
            playcount: infoData.track.playcount,
            listeners: infoData.track.listeners,
            isSearchResult: false
          } : { ...track, isSearchResult: false };
        } catch (error) {
          console.error('Error fetching track info:', error);
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

//get similar tracks using last.fm api
const getSimilarTracksFromLastFm = async (artist, track) => {
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
    match: parseFloat(track.match) * MATCH_SCORES.LASTFM_SIMILAR
  }));
};

//get tracks by tag
const getTracksByTag = async (tag, tagIndex) => {
  try {
    const url = createLastFmUrl('tag.getTopTracks', {
      tag: tag.name,
      limit: 20
    });
    
    const { tracks } = await fetchJson(url);
    if (!tracks?.track) return [];
    
    const tagWeight = 1 - (tagIndex * 0.15);
    
    return normalizeArray(tracks.track).map(track => {
      const popularityScore = calculatePopularityScore(track.listeners, track.playcount);
      const matchScore = Math.min(1.0, (MATCH_SCORES.TAG_BASED * tagWeight) + popularityScore);
      
      return {
        ...track,
        match: matchScore,
        normalizedMatch: Math.round(matchScore * 100),
        matchDetails: {
          source: 'tag',
          tagName: tag.name,
          tagWeight,
          popularityScore,
          baseScore: MATCH_SCORES.TAG_BASED,
          listeners: parseInt(track.listeners || '0'),
          playcount: parseInt(track.playcount || '0')
        }
      };
    });
  } catch (error) {
    console.error('Error fetching tag tracks:', error);
    return [];
  }
};

//get top tracks from artist
const getArtistTopTracks = async (artist) => {
  const url = createLastFmUrl('artist.getTopTracks', {
    artist,
    limit: 20
  });
  
  const { toptracks } = await fetchJson(url);
  if (!toptracks?.track) return [];
  
  return normalizeArray(toptracks.track).map((track, index) => {
    const positionWeight = Math.max(0.5, 1 - (index * 0.05));
    const popularityScore = calculatePopularityScore(track.listeners, track.playcount, 0.2);
    const matchScore = Math.min(1.0, (MATCH_SCORES.ARTIST_TOP * positionWeight) + popularityScore);
    
    return {
      ...track,
      match: matchScore,
      normalizedMatch: Math.round(matchScore * 100),
      matchDetails: {
        source: 'artist_top',
        position: index,
        positionWeight,
        popularityBonus: popularityScore,
        baseScore: MATCH_SCORES.ARTIST_TOP,
        listeners: parseInt(track.listeners || '0'),
        playcount: parseInt(track.playcount || '0')
      }
    };
  });
};
