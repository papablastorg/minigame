/**
 * Сервис для предзагрузки и кэширования изображений
 */

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

// Счетчики загрузки
let totalLoaded = 0;
let totalFailed = 0;

/**
 * Загружает одно изображение и возвращает Promise
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Сохраняем в кэше с прямым путем
      imageCache[src] = img;
      
      // Также сохраняем с альтернативным путем (с/без начального слэша)
      const altSrc = src.startsWith('/') ? src.substring(1) : `/${src}`;
      imageCache[altSrc] = img;
      
      // Увеличиваем счетчик загруженных изображений
      totalLoaded++;
      
      // Логируем прогресс загрузки каждые несколько изображений
      if (totalLoaded % 5 === 0 || totalLoaded === gameImages.length) {
        console.log(`📊 Прогресс загрузки: ${totalLoaded}/${gameImages.length} изображений (${Math.round(totalLoaded / gameImages.length * 100)}%)`);
      }
      
      resolve(img);
    };
    img.onerror = (err) => {
      totalFailed++;
      console.error(`❌ Ошибка загрузки изображения ${src}:`, err);
      reject(new Error(`Не удалось загрузить изображение: ${src}`));
    };
    img.src = src;
  });
};

/**
 * Предзагружает все изображения из списка
 */
export const preloadAllImages = async (): Promise<void> => {
  console.log(`🖼️ Начинаем предзагрузку ${gameImages.length} изображений...`);
  totalLoaded = 0;
  totalFailed = 0;
  
  try {
    // Используем Promise.allSettled вместо Promise.all, чтобы продолжить даже если некоторые изображения не загрузятся
    const results = await Promise.allSettled(gameImages.map(src => loadImage(src)));
    
    // Анализируем результаты загрузки
    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejected = results.filter(r => r.status === 'rejected').length;
    
    console.log('📊 Итоги загрузки изображений:');
    console.log(`✅ Успешно загружено: ${fulfilled}/${gameImages.length}`);
    if (rejected > 0) {
      console.warn(`⚠️ Не удалось загрузить: ${rejected}/${gameImages.length}`);
    }
    
    // Выводим список всех кэшированных изображений для отладки
    console.log('🗄️ Кэшированные изображения:', Object.keys(imageCache).length);
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
 * Получает изображение из кэша
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

  // Проверяем полный URL
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

  console.warn(`⚠️ Изображение не найдено в кэше: ${src}`);
  return null;
};

/**
 * Сервис предзагрузки изображений
 */
export const ImagePreloadService = {
  preloadAllImages,
  getImageFromCache,
  areAllImagesLoaded
};

export default ImagePreloadService;