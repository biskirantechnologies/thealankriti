// Test the frontend URL construction logic
const sampleProduct = {
  name: 'Ring',
  images: [
    {
      url: '/uploads/products/product-1758121273341-420418591.png',
      alt: 'Ring - Image 1',
      isPrimary: true,
      _id: '68cfcc030be35d281536145d'
    }
  ]
};

// Simulate getApiBaseUrl
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const hostname = 'localhost'; // Simulate localhost
  const defaultUrl = hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://thealankriti-backend.onrender.com/api';
  
  const baseUrl = envUrl || defaultUrl;
  const finalUrl = baseUrl.replace('/api', '');
  
  console.log('🔧 getApiBaseUrl debug:');
  console.log('🔧   envUrl:', envUrl);
  console.log('🔧   hostname:', hostname);
  console.log('🔧   defaultUrl:', defaultUrl);
  console.log('🔧   baseUrl:', baseUrl);
  console.log('🔧   finalUrl:', finalUrl);
  
  return finalUrl;
};

// Simulate getImageUrl
const getImageUrl = (imagePath) => {
  console.log('🔧 getImageUrl called with:', imagePath);
  
  if (!imagePath) {
    console.log('🔧 No imagePath provided, returning empty string');
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('🔧 Full URL detected, returning as is:', imagePath);
    return imagePath;
  }
  
  const baseUrl = getApiBaseUrl();
  console.log('🔧 Base URL:', baseUrl);
  
  // If it starts with /uploads, prepend the base URL
  if (imagePath.startsWith('/uploads')) {
    const fullUrl = `${baseUrl}${imagePath}`;
    console.log('🔧 /uploads path detected, constructed URL:', fullUrl);
    return fullUrl;
  }
  
  // If it's a relative path, assume it's in uploads
  const fullUrl = `${baseUrl}/uploads/${imagePath}`;
  console.log('🔧 Relative path detected, constructed URL:', fullUrl);
  return fullUrl;
};

// Simulate getImageUrlForProduct
const getImageUrlForProduct = (product) => {
  console.log('🖼️ getImageUrlForProduct called for product:', product.name);
  console.log('🖼️ Product images:', product.images);
  console.log('🖼️ Product images type:', typeof product.images);
  console.log('🖼️ Product images length:', product.images?.length);
  
  if (!product.images || !product.images.length) {
    console.log('🖼️ No images found, using fallback');
    return 'FALLBACK: No Image';
  }

  const firstImage = product.images[0];
  console.log('🖼️ First image:', firstImage, 'Type:', typeof firstImage);
  
  // If it's a string (new format)
  if (typeof firstImage === 'string') {
    const imageUrl = getImageUrl(firstImage);
    console.log('🖼️ String format image URL:', imageUrl);
    return imageUrl;
  }
  // If it's an object with url property (database format)
  else if (firstImage && typeof firstImage === 'object' && firstImage.url) {
    console.log('🖼️ Object format - firstImage.url:', firstImage.url);
    const imageUrl = getImageUrl(firstImage.url);
    console.log('🖼️ Object format image URL:', imageUrl);
    return imageUrl;
  }
  
  return 'FALLBACK: Invalid Format';
};

// Test the function
console.log('=== TESTING URL CONSTRUCTION ===');
const result = getImageUrlForProduct(sampleProduct);
console.log('=== FINAL RESULT ===');
console.log('Result:', result);
console.log('========================');