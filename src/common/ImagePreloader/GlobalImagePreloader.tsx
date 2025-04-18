import { useEffect, useState } from 'react';
import { ImagePreloadService } from '../../services';
import { Loader } from '../Loader';
import { useTranslation } from 'react-i18next';

interface GlobalImagePreloaderProps {
  children: React.ReactNode;
}

/**
 * Компонент для предзагрузки всех изображений приложения
 * Отображает дочерние компоненты и показывает экран загрузки поверх них до завершения загрузки
 */
export const GlobalImagePreloader = ({ children }: GlobalImagePreloaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  useEffect(() => {
    const loadImages = async () => {
      console.log('🖼️ Начало предзагрузки изображений...');
      const startTime = performance.now();
      
      try {
        // Предзагрузка всех изображений
        await ImagePreloadService.preloadAllImages();
        
        const endTime = performance.now();
        console.log(`✅ Все изображения успешно предзагружены за ${((endTime - startTime) / 1000).toFixed(2)}s`);
        
        // Делаем небольшую задержку для уверенности, что все изображения корректно обработаны
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      } catch (error) {
        console.error('❌ Ошибка при предзагрузке изображений:', error);
        // Даже при ошибке все равно убираем экран загрузки после задержки
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    loadImages();
  }, []);

  return (
    <>
      {children}
      
      {isLoading && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          width: '100vw',
          background: '#0f0841',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>{t('loading.title')}</h2>
            <Loader />
            <p>{t('loading.resources')}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalImagePreloader;