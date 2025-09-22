import React, { useState, useCallback } from 'react';
import { getImageWithFallback } from '../utils/api';

const SafeImage = ({ 
  src, 
  alt = 'Image', 
  className = '', 
  fallbackType = 'jewelry',
  onLoad,
  onError,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = useCallback((e) => {
    setIsLoading(false);
    setImageError(false);
    if (onLoad) onLoad(e);
  }, [onLoad]);

  const handleImageError = useCallback((e) => {
    console.log('🖼️ Image failed to load:', src);
    setIsLoading(false);
    setImageError(true);
    if (onError) onError(e);
  }, [onError, src]);

  // Get the image source with fallback
  const imageSrc = imageError ? getImageWithFallback(null, alt) : (src || getImageWithFallback(null, alt));

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={className}
        {...props}
      />
    </div>
  );
};

export default SafeImage;