import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { CONFIG } from './config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileContextProvider } from './context';
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import { Referrals } from './components/Referrals';
import { Layout } from './components/layout';
import { AirDrop } from './components/AirDrop';
import { AuthWrapper } from './components/AuthWrapper';
import { GlobalImagePreloader } from './common/ImagePreloader';
import styles from './App.module.css';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const { t } = useTranslation();

  useEffect(() => {
    WebApp.ready();
    console.log('Telegram WebApp version:', WebApp.version);
    console.log('Telegram WebApp platform:', WebApp.platform);
    
    try {
      WebApp.expand(); // Expand WebApp on any platform
      
      // Проверяем, что это мобильная платформа и поддерживается полноэкранный режим
      if (WebApp.isVersionAtLeast('8.0') && 
          (WebApp.platform === 'android' || WebApp.platform === 'ios')) {
        console.log('Fullscreen mode is supported on mobile, enabling...');
        WebApp.requestFullscreen();
        
        // Отключаем вертикальные свайпы для предотвращения выхода из полноэкранного режима
        if (WebApp.isVersionAtLeast('7.7') && typeof WebApp.disableVerticalSwipes === 'function') {
          console.log('Disabling vertical swipes to prevent exiting fullscreen');
          WebApp.disableVerticalSwipes();
        }
        
        // Отключаем стандартное поведение выхода из полноэкранного режима при нажатии "Назад"
        WebApp.onEvent('backButtonClicked', () => {
          // Вместо выхода из полноэкранного режима, можно добавить свою логику
          // например, возврат к предыдущему экрану в приложении
          console.log('Back button clicked, but staying in fullscreen mode');
        });
        
        // Добавляем слушатель изменения полноэкранного режима
        WebApp.onEvent('fullscreenChanged', () => {
          console.log('Fullscreen changed, current state:', WebApp.isFullscreen);
          // Если вышли из полноэкранного режима, запросим его снова
          if (!WebApp.isFullscreen) {
            setTimeout(() => WebApp.requestFullscreen(), 100);
          }
        });

        // Проверяем состояние полноэкранного режима при получении фокуса приложением
        WebApp.onEvent('activated', () => {
          console.log('App activated, checking fullscreen state');
          if (!WebApp.isFullscreen) {
            console.log('Restoring fullscreen mode after app activation');
            setTimeout(() => WebApp.requestFullscreen(), 100);
          }
        });
      } else {
        console.log('Fullscreen mode is not supported or not mobile platform');
      }
    } catch (error) {
      console.warn('Error while interacting with Telegram WebApp API:', error);
    }
    
    console.log('WebApp.initData', WebApp.initData);
    console.log('WebApp.initDataUnsafe', WebApp.initDataUnsafe);
  }, []);
  

  // Check if the app is running within Telegram
  if (!WebApp.initData && CONFIG.ENV !== 'development') {
    return (
      <div className={styles.App} style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        {t('errors.telegramOnly')}
      </div>
    );
  }

  const baseUrl = CONFIG.BASE_URL;

  const router = createBrowserRouter([
    { path: `${baseUrl}`, element: <Layout> <Game /> </Layout> },
    { path: `${baseUrl}leaderboard`, element: <Layout> <Leaderboard /> </Layout> },
    { path: `${baseUrl}referral`, element: <Layout> <Referrals /> </Layout> },
    { path: `${baseUrl}airdrop`, element: <Layout> <AirDrop /> </Layout> },
    { path: "*", element: <Layout><div>Page not found</div></Layout> },
  ]);

  return (
    <div className='App'>
      <QueryClientProvider client={queryClient}>
        <ProfileContextProvider>
          <GlobalImagePreloader>
            <AuthWrapper>
              <RouterProvider router={router} />
            </AuthWrapper>
          </GlobalImagePreloader>
        </ProfileContextProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
