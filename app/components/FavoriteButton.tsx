'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  lessonId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({ lessonId, className, size = 'md' }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [lessonId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites?lessonId=${lessonId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorited(data.favorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    setIsToggling(true);
    const newFavorited = !isFavorited;
    setIsFavorited(newFavorited); // Optimistic update

    try {
      if (newFavorited) {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add favorite');
        }
      } else {
        const response = await fetch(`/api/favorites?lessonId=${lessonId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to remove favorite');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setIsFavorited(!newFavorited); // Revert on error
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={cn(
        'transition-all hover:scale-110 active:scale-95 disabled:opacity-50',
        className
      )}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          isFavorited
            ? 'text-[#EF6161] fill-[#EF6161]'
            : 'text-[#9CA3AF] hover:text-[#EF6161]'
        )}
      />
    </button>
  );
}
