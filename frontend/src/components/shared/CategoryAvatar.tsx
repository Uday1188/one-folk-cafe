'use client';
import { useState } from 'react';

interface CategoryAvatarProps {
  name: string;
  image?: string;
  className?: string;
  fallbackClassName?: string;
}

export function CategoryAvatar({ name, image, className, fallbackClassName }: CategoryAvatarProps) {
  const [error, setError] = useState(false);

  const resolveImageUrl = (src: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
    return backendBase + src;
  };

  return (
    <div className={`overflow-hidden flex items-center justify-center ${className || ''}`}>
      {image && !error ? (
        <img 
          src={resolveImageUrl(image)} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center font-black ${fallbackClassName || ''}`}>
          {name.charAt(0)}
        </div>
      )}
    </div>
  );
}
