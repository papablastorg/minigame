import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { GameEngine } from '../../engine';
import styles from './Game.module.css';

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (gameEngineRef.current) {
      if (e.key === 'ArrowLeft') {
        gameEngineRef.current.store.player.isMovingLeft = true;
        gameEngineRef.current.store.player.isMovingRight = false;
      } else if (e.key === 'ArrowRight') {
        gameEngineRef.current.store.player.isMovingLeft = false;
        gameEngineRef.current.store.player.isMovingRight = true;
      }
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (gameEngineRef.current) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        gameEngineRef.current.store.player.isMovingLeft = false;
        gameEngineRef.current.store.player.isMovingRight = false;
      }
    }
  };
  console.log(gameState,'gameState');
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 75;
      }
    };

    const gameEngine = new GameEngine(
        canvas,
        ctx,
        (newScore) => {
          setScore(newScore);
          if (newScore >= 5000) {
            setBackgroundLevel(3);
          } else if (newScore >= 2500) {
            setBackgroundLevel(2);
          } else {
            setBackgroundLevel(1);
          }
        },
        () => setGameState('gameover')
    );

    gameEngineRef.current = gameEngine;

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
      gameEngineRef.current.store.player.isMovingLeft = true;
      gameEngineRef.current.store.player.isMovingRight = false;
    }
  };
  
  const handleRightButtonDown = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.store.player.isMovingLeft = false;
      gameEngineRef.current.store.player.isMovingRight = true;
    }
  };

  const handleButtonUp = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.store.player.isMovingLeft = false;
      gameEngineRef.current.store.player.isMovingRight = false;
    }
  };

  return (
        <div className={classNames(styles.gameContainer, {
        [styles.levelOne]: gameState === 'playing' && backgroundLevel === 1,
        [styles.levelTwo]: gameState === 'playing' && backgroundLevel === 2,
        [styles.levelThree]: gameState === 'playing' && backgroundLevel === 3,
        [styles.startScreen]: gameState === 'start' || gameState === 'gameover'
      })}>
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
        />
        {gameState === 'start' && (
            <div className={styles.overlay}>
              <img src="images/player_start_img.png" alt="Player" className={styles.startPlayer} />
              <h1>PapaJump</h1>
              <button onClick={startGame} className={styles.playButton}>
              PLAY 
              <span>3/3</span>
              <img src="images/ticket.png" alt="Player" className={styles.ticket} />
              </button>
            </div>
        )}
         {gameState === 'gameover' && (
            <div className={styles.overlay}>
              <img src="images/game_over.png" alt="Player" className={styles.startPlayer} />
              <h1>Game Over</h1>
              <p className={styles.gameOverScore}>Score: {score}</p>
              <button onClick={restartGame} className={styles.playButton}>
                PLAY 
                <span>2/3</span>
                <img src="images/ticket.png" alt="Player" className={styles.ticket} />
                </button>
            </div>
        )}
        
        {gameState === 'playing' && (
          <>
           <div className={styles.scoreBoard}>Score: {score}</div>
            <div className={styles.controls}>
              <div
                  className={classNames(styles.controlButton, styles.left)}
                  onMouseDown={handleLeftButtonDown}
                  onMouseUp={handleButtonUp}
                  onTouchStart={handleLeftButtonDown}
                  onTouchEnd={handleButtonUp}
              >
                <svg id="Flat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                  <path d="M228,128a12.00028,12.00028,0,0,1-12,12H68.9707l51.51465,51.51465a12.0001,12.0001,0,0,1-16.9707,16.9707l-72-72a11.99973,11.99973,0,0,1,0-16.9707l72-72a12.0001,12.0001,0,0,1,16.9707,16.9707L68.9707,116H216A12.00028,12.00028,0,0,1,228,128Z"/>
                </svg>
              </div>
              <div
                  className={classNames(styles.controlButton, styles.right)}
                  onMouseDown={handleRightButtonDown}
                  onMouseUp={handleButtonUp}
                  onTouchStart={handleRightButtonDown}
                  onTouchEnd={handleButtonUp}
              >
                <svg id="Flat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                  <path d="M228,128a12.00028,12.00028,0,0,1-12,12H68.9707l51.51465,51.51465a12.0001,12.0001,0,0,1-16.9707,16.9707l-72-72a11.99973,11.99973,0,0,1,0-16.9707l72-72a12.0001,12.0001,0,0,1,16.9707,16.9707L68.9707,116H216A12.00028,12.00028,0,0,1,228,128Z"/>
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
  );
};
