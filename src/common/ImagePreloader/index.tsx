import classNames from 'classnames';
import { ImgHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';

import styles from './ImagePreloader.module.css';
import { Loader } from '../Loader';

export interface ImagePreloaderProps extends ImgHTMLAttributes<HTMLImageElement> {
  width?: number | `${number}`;
  height?: number | `${number}`;
  spinClassName?: string;
}

export const ImagePreloader = ({
    src, className, alt, spinClassName, ...props
  }: ImagePreloaderProps) => {
  const attempts = useRef(0);
  const img = useRef(new Image());
  const [loading, setLoading] = useState<boolean>(true);

  const handleLoad = useCallback(() => {
    setLoading(false);
    attempts.current = 0;
  }, []);

  const handleError = useCallback((s: string) => (e: string | Event) => {
    if (attempts.current > 5) return;
    img.current.src = '';
    img.current.src = s;
    attempts.current += 1;
  }, []);

  useEffect(() => {
    if (!img.current) img.current = new Image();
    const image = img.current;
    if (src && image.src !== src) {
      setLoading(true);
      image.src = src;
      image.onload = handleLoad;
      image.onerror = handleError(src);
    }
    return () => {
      if (image) {
        image.onload = null;
        image.onerror = null;
      }
    };
  }, [handleLoad, handleError, src]);

  return loading
    ? <div className={styles.loading}><Loader /></div>
    : <img src={img.current.src} className={classNames(styles.image, className)} alt={alt} {...props} />;
}
