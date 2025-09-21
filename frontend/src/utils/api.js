// Utility function to get the correct API base URL
const getApiBaseUrl = () => {
  // Check environment variable first, then fallback based on hostname
  const envUrl = process.env.REACT_APP_API_URL;
  const defaultUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://thealankriti-backend.onrender.com/api';
  
  const baseUrl = envUrl || defaultUrl;
  const finalUrl = baseUrl.replace('/api', '');
  
  console.log('🔧 getApiBaseUrl debug:');
  console.log('🔧   envUrl:', envUrl);
  console.log('🔧   window.location.hostname:', window.location.hostname);
  console.log('🔧   defaultUrl:', defaultUrl);
  console.log('🔧   baseUrl:', baseUrl);
  console.log('🔧   finalUrl:', finalUrl);
  
  return finalUrl;
};

// Utility function to get the full API URL
const getApiUrl = (endpoint = '') => {
  const baseUrl = getApiBaseUrl();
  if (endpoint.startsWith('/')) {
    return `${baseUrl}${endpoint}`;
  }
  return `${baseUrl}/api/${endpoint}`;
};

// Utility function to get image URL
const getImageUrl = (imagePath) => {
  console.log('🔧 getImageUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('🔧 No imagePath provided, returning empty string');
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🔧 Full URL detected, returning as is:', imagePath);
    return `${imagePath}?v=${Date.now()}`;
  }
  
  const baseUrl = getApiBaseUrl();
  console.log('🔧 Base URL:', baseUrl);
  
  // If it starts with /uploads, prepend the base URL
  if (imagePath.startsWith('/uploads')) {
    const fullUrl = `${baseUrl}${imagePath}?v=${Date.now()}`;
    console.log('🔧 /uploads path detected, constructed URL:', fullUrl);
    return fullUrl;
  }
  
  // If it's a relative path, assume it's in uploads
  const fullUrl = `${baseUrl}/uploads/${imagePath}?v=${Date.now()}`;
  console.log('🔧 Relative path detected, constructed URL:', fullUrl);
  return fullUrl;
};

// Fallback image helper - returns a data URL instead of external placeholder
const getImageWithFallback = (imagePath, alt = 'No Image') => {
  const imageUrl = getImageUrl(imagePath);
  
  if (imageUrl) {
    return imageUrl;
  }
  
  // Return a data URL for a simple gray background instead of external placeholder
  return 'data:image/svg+xml;base64,' + btoa(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${alt}
      </text>
    </svg>
  `);
};

export { getApiBaseUrl, getApiUrl, getImageUrl, getImageWithFallback };