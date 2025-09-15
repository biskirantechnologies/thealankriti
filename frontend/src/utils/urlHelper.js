// URL helper functions to ensure consistent API and image URLs

export const getApiBaseUrl = () => {
  // Check if we're in development mode (localhost)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback to working Vercel deployment URL
  return 'https://ukriti-jewells-iqxbr1cbm-oracle-brain.vercel.app/api';
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/images/placeholder.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path starting with /uploads, prepend appropriate base URL
  if (imagePath.startsWith('/uploads')) {
    // Check if we're in development mode
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return `http://localhost:5000${imagePath}`;
    }
    return `https://thealankriti.com${imagePath}`;
  }
  
  // For other relative paths, use as is (relative to current domain)
  return imagePath;
};

export const getFullImageUrl = (imageObj) => {
  if (!imageObj) return '/images/placeholder.jpg';
  
  // Handle object with url property
  if (typeof imageObj === 'object' && imageObj.url) {
    return getImageUrl(imageObj.url);
  }
  
  // Handle direct string
  if (typeof imageObj === 'string') {
    return getImageUrl(imageObj);
  }
  
  return '/images/placeholder.jpg';
};