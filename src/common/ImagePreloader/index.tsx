import classNames from 'classnames';
import { ImgHTMLAttributes, useCallback, useEffect, useRef, useState } from 'react';

import styles from './ImagePreloader.module.css';
import { Loader } from '../Loader';
import { ImagePreloadService } from '../../services';

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
  
  // Проверяем наличие изображения в кэше при первоначальной установке состояния
  const [loading, setLoading] = useState<boolean>(() => {
    if (!src) return true;
    const cachedImage = ImagePreloadService.getImageFromCache(src);
    if (cachedImage) {
      img.current = cachedImage;
      return false; // Если изображение в кэше, сразу устанавливаем loading: false
    }
    return true; // Иначе loading: true
  });

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
    if (!src) return;

    // Попытка получить изображение из кэша
    const cachedImage = ImagePreloadService.getImageFromCache(src);
    
    if (cachedImage) {
      // Если изображение уже в кэше, используем его
      img.current = cachedImage;
      setLoading(false);
      return;
    }
    
    // Если изображение не найдено в кэше, загружаем его обычным способом
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

export { default as GlobalImagePreloader } from './GlobalImagePreloader';
