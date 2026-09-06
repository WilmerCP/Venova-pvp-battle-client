// hooks/useImageAspectRatio.js
import { useEffect, useState } from 'react';

const ratioCache = new Map();

export function useImageAspectRatio(src) {
  const [ratio, setRatio] = useState(ratioCache.get(src) ?? null);

  useEffect(() => {
    if (!src) return;
    if (ratioCache.has(src)) {
      setRatio(ratioCache.get(src));
      return;
    }
    const img = new Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      ratioCache.set(src, r);
      setRatio(r);
    };
    img.src = src;
  }, [src]);

  return ratio;
}