// Utility function to get the correct API base URL
const getApiBaseUrl = () => {
  const defaultUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://api.thealankriti.com/api';

  const rawEnvUrl = (process.env.REACT_APP_API_URL || '').trim();
  if (!rawEnvUrl) {
    return defaultUrl;
  }

  // Fix malformed protocol like: https:/.domain.com/api -> https://domain.com/api
  const fixedProtocolUrl = rawEnvUrl.replace(/^(https?):\/+/, '$1://');

  try {
    const parsed = new URL(fixedProtocolUrl);
    if (!parsed.protocol || !parsed.host) {
      return defaultUrl;
    }

    // Always ensure we keep /api suffix for axios/api utilities
    const normalizedPath = parsed.pathname.endsWith('/api')
      ? parsed.pathname
      : `${parsed.pathname.replace(/\/$/, '')}/api`;

    return `${parsed.protocol}//${parsed.host}${normalizedPath}`;
  } catch (error) {
    return defaultUrl;
  }
};

// Utility function to get the full API URL
const getApiUrl = (endpoint = '') => {
  const baseUrl = getApiBaseUrl();
  if (endpoint.startsWith('/')) {
    return `${baseUrl}${endpoint}`;
  }
  return `${baseUrl}/${endpoint}`;
};

// Utility function to get image URL with production fallback
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  if (typeof imagePath === 'object') {
    const objectPath = imagePath.url || imagePath.path || imagePath.image || imagePath.src || '';
    return getImageUrl(objectPath);
  }

  if (typeof imagePath !== 'string') {
    return '';
  }

  const trimmedPath = imagePath.trim();
  if (!trimmedPath) {
    return '';
  }

  // Never try to convert browser-local/image-data URLs to backend URLs
  if (trimmedPath.startsWith('blob:') || trimmedPath.startsWith('data:')) {
    return '';
  }

  const baseUrl = getApiBaseUrl().replace(/\/api$/, '');

  // Handle absolute URLs
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    try {
      const parsed = new URL(trimmedPath);
      const normalizedPathname = parsed.pathname.replace(/\\/g, '/');

      // If DB accidentally stored frontend-domain uploads URL, rewrite to API domain uploads path
      const uploadsIndex = normalizedPathname.indexOf('/uploads/');
      if (uploadsIndex !== -1) {
        const uploadsPath = normalizedPathname.slice(uploadsIndex);
        return `${baseUrl}${uploadsPath}${parsed.search || ''}`;
      }

      return trimmedPath;
    } catch (error) {
      return '';
    }
  }

  // Handle file-system style and Windows-style paths from DB
  const slashNormalized = trimmedPath.replace(/\\/g, '/');
  const uploadsIndex = slashNormalized.indexOf('uploads/');
  if (uploadsIndex !== -1) {
    const uploadsPath = slashNormalized.slice(uploadsIndex).replace(/^\/+/, '');
    return `${baseUrl}/${uploadsPath}`;
  }

  const normalizedPath = slashNormalized.replace(/^\/+/, '');

  if (normalizedPath.startsWith('products/')) {
    return `${baseUrl}/uploads/${normalizedPath}`;
  }

  if (normalizedPath.startsWith('uploads/')) {
    return `${baseUrl}/${normalizedPath}`;
  }

  return `${baseUrl}/uploads/${normalizedPath}`;
};

// Enhanced fallback image helper with jewelry-appropriate placeholders
const getImageWithFallback = (imagePath, alt = 'Jewelry') => {
  const imageUrl = getImageUrl(imagePath);
  
  if (imageUrl) {
    return imageUrl;
  }

  // Return a neutral placeholder for both development and production
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