// Utility function to get the correct API base URL
const getApiBaseUrl = () => {
  // Check environment variable first, then fallback based on hostname
  const envUrl = process.env.REACT_APP_API_URL;
  const defaultUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : 'https://thealankriti-backendd.onrender.com/api';
  
  const baseUrl = envUrl || defaultUrl;
  return baseUrl.replace('/api', '');
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
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /uploads, prepend the base URL
  if (imagePath.startsWith('/uploads')) {
    return `${getApiBaseUrl()}${imagePath}`;
  }
  
  // If it's a relative path, assume it's in uploads
  return `${getApiBaseUrl()}/uploads/${imagePath}`;
};

export { getApiBaseUrl, getApiUrl, getImageUrl };