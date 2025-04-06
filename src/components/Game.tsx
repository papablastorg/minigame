import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './GameEngine.ts';
import './Game.css';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameEngine = new GameEngine(
        canvas,
        ctx,
        (newScore) => {
          setScore(newScore);
          if (newScore >= 500) {
            setBackgroundLevel(3);
          } else if (newScore >= 250) {
            setBackgroundLevel(2);
          } else {
            setBackgroundLevel(1);
          }
        },
        () => setGameState('gameover')
    );

    gameEngineRef.current = gameEngine;

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;

      if (x < rect.width / 2) {
        gameEngine.player.isMovingLeft = true;
        gameEngine.player.isMovingRight = false;
      } else {
        gameEngine.player.isMovingLeft = false;
        gameEngine.player.isMovingRight = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      gameEngine.player.isMovingLeft = false;
      gameEngine.player.isMovingRight = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBackgroundLevel(1);
    gameEngineRef.current?.start();
  };

  const restartGame = () => {
    setGameState('playing');
    setScore(0);
    setBackgroundLevel(1);
    gameEngineRef.current?.restart();
  };

  const handleLeftButtonDown = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.player.isMovingLeft = true;
      gameEngineRef.current.player.isMovingRight = false;
    }
  };

  const handleRightButtonDown = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.player.isMovingLeft = false;
      gameEngineRef.current.player.isMovingRight = true;
    }
  };

  const handleButtonUp = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.player.isMovingLeft = false;
      gameEngineRef.current.player.isMovingRight = false;
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < rect.width / 2) {
      if (gameEngineRef.current) {
        gameEngineRef.current.player.isMovingLeft = true;
        gameEngineRef.current.player.isMovingRight = false;
      }
    } else {
      if (gameEngineRef.current) {
        gameEngineRef.current.player.isMovingLeft = false;
        gameEngineRef.current.player.isMovingRight = true;
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.player.isMovingLeft = false;
      gameEngineRef.current.player.isMovingRight = false;
    }
  };

  return (
      <div className={`game-container level-${backgroundLevel}`}>
        <canvas
            ref={canvasRef}
            width={422}
            height={552}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
        />
        {gameState === 'start' && (
            <div className="overlay">
              <h1>Doodle Jump</h1>
              <button onClick={startGame}>Start Game</button>
            </div>
        )}
        {gameState === 'gameover' && (
            <div className="overlay">
              <h1>Game Over</h1>
              <p>Score: {score}</p>
              <button onClick={restartGame}>Restart</button>
            </div>
        )}
        <div className="score-board">Score: {score}</div>
        {gameState === 'playing' && (
            <div className="controls">
              <button
                  className="control-button"
                  onMouseDown={handleLeftButtonDown}
                  onMouseUp={handleButtonUp}
                  onTouchStart={handleLeftButtonDown}
                  onTouchEnd={handleButtonUp}
              >
                ←
              </button>
              <button
                  className="control-button"
                  onMouseDown={handleRightButtonDown}
                  onMouseUp={handleButtonUp}
                  onTouchStart={handleRightButtonDown}
                  onTouchEnd={handleButtonUp}
              >
                →
              </button>
            </div>
        )}
      </div>
  );
};