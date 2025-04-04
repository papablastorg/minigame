import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';
import { Rocket } from 'lucide-react';
import Game from './components/Game';

function App() {
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Initialize Telegram Mini App
    WebApp.ready();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
      {!gameStarted && (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">PAPABLAST Jump</h1>
            <p className="text-white text-lg">Jump higher, earn PAPA coins!</p>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-full mb-4 flex items-center"
          >
            <Rocket className="mr-2" /> Play Now
          </button>
        </div>
      )}

      {gameStarted && <Game  />}
    </div>
  );
}

export default App;
