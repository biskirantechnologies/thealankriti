// Utility function to get the correct API base URL
const getApiBaseUrl = () => {
  // Check environment variable first, then fallback based on hostname
  const envUrl = process.env.REACT_APP_API_URL;
  const defaultUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://thealankriti-backendd.onrender.com/api';
  
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

// Utility function to get image URL with production fallback
const getImageUrl = (imagePath) => {
  console.log('🔧 getImageUrl called with:', imagePath, 'Type:', typeof imagePath);
  
  if (!imagePath || typeof imagePath !== 'string') {
    console.log('🔧 No imagePath provided or not a string, returning empty string');
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🔧 Full URL detected, returning as is:', imagePath);
    return `${imagePath}?v=${Date.now()}`;
  }
  
  const baseUrl = getApiBaseUrl();
  console.log('🔧 Base URL:', baseUrl);
  
  // In production, if backend is suspended, return fallback immediately
  const isProduction = window.location.hostname !== 'localhost';
  const isRenderBackend = baseUrl.includes('onrender.com');
  
  if (isProduction && isRenderBackend) {
    console.log('🔧 Production environment with Render backend detected, using fallback');
    return '';
  }
  
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

// Enhanced fallback image helper with jewelry-appropriate placeholders
const getImageWithFallback = (imagePath, alt = 'Jewelry') => {
  const imageUrl = getImageUrl(imagePath);
  
  if (imageUrl) {
    return imageUrl;
  }
  
  // For production when backend is unavailable, use high-quality placeholder images
  const isProduction = window.location.hostname !== 'localhost';
  
  if (isProduction) {
    // Use jewelry-related placeholder images from Unsplash
    const jewelryPlaceholders = [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop&crop=center'
    ];
    
    // Use hash of imagePath to consistently return same placeholder for same path
    const hash = imagePath ? imagePath.length % jewelryPlaceholders.length : 0;
    return jewelryPlaceholders[hash];
  }
  
  // Return a data URL for a simple gray background for development
  return 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
        ${alt}
      </text>
    </svg>
  `);
};

export { getApiBaseUrl, getApiUrl, getImageUrl, getImageWithFallback };