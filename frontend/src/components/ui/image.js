import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export const Image = ({
  src,
  alt,
  className,
  fallback = '/images/placeholder.jpg',
  ...props
}) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      className={cn('object-cover', className)}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  );
}; 