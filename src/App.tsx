import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { Game } from './components/Game';

function App() {
  useEffect(() => {
    // Initialize Telegram Mini App
    WebApp.ready();
  }, []);

  return (
      <div className="App">
        <Game />
      </div>
  );
}

export default App;
