// components/Sprite.jsx
import { forwardRef, useEffect, useState } from 'react';
import { useImageAspectRatio } from '../hooks/useImageAspectRatio';

const STATUS_TINTS = {
  frz: { color: 'rgb(120, 190, 255)', duration: '6s' },
  psn: { color: 'rgb(160, 60, 220)', duration: '6s' },
  tox: { color: 'rgb(160, 60, 220)', duration: '6s' },
  lowhp: { color: 'rgb(220, 40, 40)', duration: '2.5s' },
  brn: { color: 'rgb(220, 40, 40)', duration: '6s' },
  par: { color: 'rgb(255, 255, 0)', duration: '6s' },
};

const Sprite = forwardRef(function StatusSprite(
  {
    src,
    onError,
    className = '',
    animationClass = '',
    status,
    isIdle,
    animationInfo,
    onComplete,
  },
  ref
) {
  const tint = isIdle && status ? STATUS_TINTS[status] : null;
  const ratio = useImageAspectRatio(src);

  const animationType = animationInfo ? animationInfo.status : 'loop';

  const [tintVisible, setTintVisible] = useState(false);

  useEffect(() => {
    if (animationType === 'loop' || !tint) return;

    setTintVisible(false);

    // Wait until the initial opacity: 0 has been painted
    const frame = requestAnimationFrame(() => {
      setTintVisible(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [animationType, tint]);

  const handleTransitionEnd = (e) => {
    if (e.propertyName !== 'opacity') return;

    if (tintVisible) {
      // Fade in finished → fade out
      setTintVisible(false);
    } else {
      // Fade out finished → complete
      onComplete?.();
    }
  };

  return (
    <>
      <img
        src={src}
        onError={onError}
        className={`pixel-sprite ${animationClass} ${className}`}
        ref={ref}
      />

      {tint && ratio && (
        <div
          className={`${
            animationType === 'loop'
              ? 'tint-loop'
              : `tint ${tintVisible ? 'tint-visible' : ''}`
          } ${className}`}
          onTransitionEnd={
            animationType !== 'loop'
              ? handleTransitionEnd
              : undefined
          }
          style={{
            backgroundColor: tint.color,
            '--tint-duration': tint.duration,
            aspectRatio: ratio,
            maskImage: `url(${src})`,
            WebkitMaskImage: `url(${src})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
          }}
        />
      )}
    </>
  );
});

export default Sprite;