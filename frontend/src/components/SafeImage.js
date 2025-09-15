import React, { useState } from 'react';
import { getImageUrl, getFullImageUrl } from '../utils/urlHelper';

const SafeImage = ({ 
  src, 
  alt = 'Product image', 
  className = '', 
  product_or_image,
  product = null,
  onClick = null,
  fallbackSrc = 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(() => {
    // Use src if provided, otherwise try product_or_image or product
    const imageSource = src || product_or_image || product;
    return getFullImageUrl(imageSource) || fallbackSrc;
  });

  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onClick={onClick}
      {...props}
    />
  );
};

export default SafeImage;
