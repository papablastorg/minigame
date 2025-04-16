import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { RouterProvider, createBrowserRouter } from "react-router";
import { CONFIG } from './config';

import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import { Referrals } from './components/Referrals';
import { Layout } from './components/layout';
import { AirDrop } from './components/AirDrop';
import styles from './App.module.css';

function App() {
  useEffect(() => {
    // Initialize Telegram Mini App
    WebApp.ready();
    console.log('WebApp',WebApp);
    console.log('WebApp.initData',WebApp.initData);
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
        This application can only be opened in Telegram Desktop or Mobile App
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
      <div className={styles.App}>
        <RouterProvider router={router} />
      </div>
  );
}

export default App;
