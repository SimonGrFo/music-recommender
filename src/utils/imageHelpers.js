//default image for tracks without artwork
export const DEFAULT_TRACK_IMAGE = 'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png';

//sort unages in order of preference
export const IMAGE_SIZES = ['extralarge', 'large', 'medium'];

//get best available image from an image array
const getBestImage = (images) => {
  if (!Array.isArray(images)) return null;
  
  for (const size of IMAGE_SIZES) {
    const img = images.find(i => i.size === size);
    if (img && img['#text']) {
      return img['#text'];
    }
  }
  return null;
};

//get the best available image URL from track or album data
export const getImageUrl = (track) => {
  // Try track images first
  const trackImage = getBestImage(track.image);
  if (trackImage) return trackImage;
  
  // Then try album images
  const albumImage = track.album && getBestImage(track.album.image);
  if (albumImage) return albumImage;
  
  // Fallback to default
  return DEFAULT_TRACK_IMAGE;
}; 
