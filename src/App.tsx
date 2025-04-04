import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

function App() {

  useEffect(() => {
    // Initialize Telegram Mini App
    WebApp.ready();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">PAPABLAST Jump</h1>
          </div>
        </div>
    </div>
  );
}

export default App;
