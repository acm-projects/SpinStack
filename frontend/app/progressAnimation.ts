import { useRef, useEffect } from "react";
import { Animated, Easing } from "react-native";

interface ProgressControls {
  progress: Animated.Value;
  startAnimation: () => void;
  pauseAnimation: () => void;
  restartAnimation: () => void;
}

/**
 * Handles looping progress bar animation synced with moment playback.
 */
export function useProgressAnimation(
  isPlaying: boolean,
  durationMs: number,
  deps: any[] = []
): ProgressControls {
  const progress = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = () => {
    // stop any existing animation first
    animationRef.current?.stop();
    progress.setValue(0);

    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (finished) {
        // restart automatically if still playing
        progress.setValue(0);
        requestAnimationFrame(() => startAnimation());
      }
    });

    animationRef.current = anim;
  };

  const pauseAnimation = () => {
    animationRef.current?.stop();
  };

  const restartAnimation = () => {
    animationRef.current?.stop();
    progress.setValue(0);
    startAnimation();
  };

  // Handle playback toggling automatically
  useEffect(() => {
    if (isPlaying) startAnimation();
    else pauseAnimation();

    return () => {
      animationRef.current?.stop();
    };
  }, [isPlaying, durationMs, ...deps]);

  return { progress, startAnimation, pauseAnimation, restartAnimation };
}
