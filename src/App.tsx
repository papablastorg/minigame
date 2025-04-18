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
import styles from './App.module.css';

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const { t } = useTranslation();
  
  useEffect(() => {
    WebApp.ready();
    console.log('WebApp.initData',WebApp.initData);
    console.log('WebApp.initDataUnsafe',WebApp.initDataUnsafe);
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
          <AuthWrapper>
            <RouterProvider router={router} />
          </AuthWrapper>
        </ProfileContextProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
