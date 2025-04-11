import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { RouterProvider, createBrowserRouter } from "react-router";
import { Game } from './components/Game';
import { Leaderboard } from './components/Leaderboard';
import { Referral } from './components/Referral';
import { Layout } from './components/layout';
import { AirDrop } from './components/AirDrop';

function App() {
  useEffect(() => {
    // Initialize Telegram Mini App
    WebApp.ready();
  }, []);

  const router = createBrowserRouter([
    { path: "/", element: <Layout> <Game /> </Layout> },
    { path: "/leaderboard", element: <Layout> <Leaderboard /> </Layout> },
    { path: "/referral", element: <Layout> <Referral /> </Layout> },
    { path: "/airdrop", element: <Layout> <AirDrop /> </Layout> },
    { path: "*", element: <Layout><div>Page not found</div></Layout> },
  ]);
  

  return (
      <div className="App">
        <RouterProvider router={router} />
      </div>
  );
}

export default App;
