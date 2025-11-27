'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
}

export default function VideoPlayer({ videoId, onTimeUpdate, onComplete }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const initializePlayer = () => {
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setIsReady(true);
            startTracking();
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              onComplete?.();
            }
          },
        },
      });
    }
  };

  const startTracking = () => {
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          onTimeUpdate?.(currentTime, duration);
        } catch (e) {
          // Player not ready
        }
      }
    }, 1000);
  };

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <div
          id="youtube-player"
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

