/**
 * Сервис для предзагрузки и кэширования изображений
 */

import { CONFIG } from '../config';

// Получаем базовый URL из конфигурации
const baseUrl = CONFIG.BASE_URL;

// Список всех изображений, которые нужно предзагрузить
const gameImages = [
  '/images/player_start_img.png',
  '/images/player_jump.png',
  '/images/player_jump2.png',
  '/images/player_jumped.png',
  '/images/static_platform.png',
  '/images/move_platform.png',
  '/images/broken_platform.png',
  '/images/flash_platform.png',
  '/images/jump_point.png',
  '/images/PAPApoint.png',
  '/images/game_over.png',
  '/images/ticket.png',
  '/images/airdrop.png',
  '/images/auth.png',
  '/images/start_background.png',
  '/images/start_bg.png',
  '/images/layout_bg.png',
  '/images/L1.jpg',
  '/images/L2.jpg',
  '/images/L3.jpg',
  '/images/referrals.png'
];

// Кэш для хранения загруженных изображений с обоими вариантами путей
const imageCache: Record<string, HTMLImageElement> = {};

// Кэш для хранения запросов на загрузку изображений
const imageLockCache: Record<string, Promise<HTMLImageElement>> = {};

// Счетчики загрузки
let totalLoaded = 0;
let totalFailed = 0;

// Флаг для отслеживания платформы
let isMobileApp = false;

/**
 * Определяет, запущено ли приложение в мобильном Telegram
 */
export const detectPlatform = (): void => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Проверяем, запущено ли приложение в Telegram
  isMobileApp = (
    userAgent.includes('telegram') || 
    navigator.userAgent.includes('TelegramWebView') || 
    window.location.href.includes('tg://') ||
    window.Telegram ||
    // @ts-ignore Telegram Mini App API
    window.TelegramWebviewProxy
  );
  
  // Определяем, это iOS/MacOS или нет
  const isIOS = /iphone|ipad|ipod|macintosh/.test(userAgent) && !window.MSStream;
  
  if (isMobileApp) {
    console.log(`📱 Обнаружено мобильное приложение Telegram. iOS/MacOS: ${isIOS}`);
    
    // Устанавливаем меньше параллельных загрузок для iOS
    if (isIOS) {
      console.log('🍎 Применены оптимизации для iOS/MacOS');
    }
  }
};

/**
 * Нормализует путь к изображению с учетом базового URL
 */
export const normalizePath = (src: string): string => {
  // Удаляем начальный слеш, если он есть и добавляем базовый URL
  const cleanPath = src.startsWith('/') ? src.substring(1) : src;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Загружает одно изображение и возвращает Promise
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  // Если уже есть запрос на загрузку этого изображения, возвращаем существующий промис
  if (imageLockCache[src]) {
    return imageLockCache[src];
  }
  
  // Создаем новый промис и сохраняем его в кэше запросов
  const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
    // Проверяем, может изображение уже загружено
    if (imageCache[src]) {
      totalLoaded++;
      resolve(imageCache[src]);
      return;
    }
    
    const img = new Image();
    
    // Устанавливаем таймаут для загрузки (особенно важно для iOS)
    const timeoutId = setTimeout(() => {
      console.warn(`⏱️ Таймаут загрузки изображения: ${src}`);
      // Не отклоняем промис, а просто создаем пустое изображение с fallback
      const fallbackImg = document.createElement('canvas');
      fallbackImg.width = 100;
      fallbackImg.height = 100;
      const ctx = fallbackImg.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 100, 100);
      }
      // Используем канвас как временное изображение
      // @ts-ignore - конвертируем canvas в Image
      resolve(fallbackImg);
    }, 5000); // 5 секунд таймаута
    
    img.onload = () => {
      clearTimeout(timeoutId);
      
      // Сохраняем в кэше с оригинальным путем
      imageCache[src] = img;
      
      // Также сохраняем с альтернативным путем (с/без начального слэша)
      const altSrc = src.startsWith('/') ? src.substring(1) : `/${src}`;
      imageCache[altSrc] = img;
      
      // Увеличиваем счетчик загруженных изображений
      totalLoaded++;
      
      // Удаляем запрос из кэша запросов
      delete imageLockCache[src];
      
      resolve(img);
    };
    
    img.onerror = (err) => {
      clearTimeout(timeoutId);
      totalFailed++;
      console.error(`❌ Ошибка загрузки изображения ${src}:`, err);
      
      // Удаляем запрос из кэша запросов
      delete imageLockCache[src];
      
      // Создаем фоллбэк вместо отклонения промиса
      const fallbackImg = new Image();
      imageCache[src] = fallbackImg;
      resolve(fallbackImg);
    };
    
    // Важно для iOS: установить crossOrigin
    img.crossOrigin = 'anonymous';
    
    // Используем нормализованный путь для src
    img.src = normalizePath(src);
  });
  
  // Сохраняем промис в кэш запросов
  imageLockCache[src] = loadPromise;
  
  return loadPromise;
};

/**
 * Предзагружает пакет изображений из списка с ограничением на параллельные загрузки
 */
export const preloadImageBatch = async (images: string[], batchSize = 6): Promise<void> => {
  // Для iOS/MacOS в приложении Telegram используем меньший размер пакета
  if (isMobileApp && /iphone|ipad|ipod|macintosh/.test(navigator.userAgent.toLowerCase())) {
    batchSize = 3; // Меньше параллельных загрузок для iOS
  }
  
  // Разбиваем список на пакеты для параллельной загрузки
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(src => loadImage(src)));
  }
};

/**
 * Предзагружает все изображения из списка с оптимизацией для мобильных устройств
 */
export const preloadAllImages = async (): Promise<void> => {
  console.log(`🖼️ Начинаем предзагрузку ${gameImages.length} изображений...`);
  console.log(`🌐 Базовый URL: ${baseUrl}`);
  
  // Определяем тип платформы
  detectPlatform();
  
  totalLoaded = 0;
  totalFailed = 0;
  
  try {
    // Загружаем изображения пакетами
    await preloadImageBatch(gameImages);
    
    console.log('📊 Итоги загрузки изображений:');
    console.log(`✅ Успешно загружено: ${totalLoaded}/${gameImages.length}`);
    if (totalFailed > 0) {
      console.warn(`⚠️ Не удалось загрузить: ${totalFailed}/${gameImages.length}`);
    }
  } catch (error) {
    console.error('❌ Критическая ошибка при предзагрузке изображений:', error);
  }
};

/**
 * Проверяет, загружены ли все изображения
 */
export const areAllImagesLoaded = (): boolean => {
  return totalLoaded >= gameImages.length;
};

/**
 * Получает изображение из кэша с fallback механизмом
 */
export const getImageFromCache = (src: string): HTMLImageElement | null => {
  // Проверяем, есть ли изображение в кэше напрямую
  if (imageCache[src]) {
    return imageCache[src];
  }
  
  // Пробуем альтернативный путь (с/без начального слэша)
  const altSrc = src.startsWith('/') ? src.substring(1) : `/${src}`;
  if (imageCache[altSrc]) {
    return imageCache[altSrc];
  }

  // Проверяем различные варианты путей
  const possiblePaths = [
    src,
    altSrc,
    src.replace(/^\/images\//, 'images/'),
    src.replace(/^images\//, '/images/')
  ];

  for (const path of possiblePaths) {
    if (imageCache[path]) {
      return imageCache[path];
    }
  }

  // Если изображение не найдено в кэше, загружаем его асинхронно и возвращаем временный заполнитель
  if (!imageLockCache[src]) {
    console.warn(`⚠️ Изображение не найдено в кэше: ${src}, загружаем асинхронно`);
    loadImage(src).then(() => {
      console.log(`✅ Async loaded: ${src}`);
    });
  }
  
  // Создаем и возвращаем временное изображение
  const tempImg = new Image();
  tempImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1px transparent gif
  return tempImg;
};

/**
 * Сервис предзагрузки изображений
 */
export const ImagePreloadService = {
  preloadAllImages,
  getImageFromCache,
  areAllImagesLoaded,
  normalizePath,
  detectPlatform
};

export default ImagePreloadService;