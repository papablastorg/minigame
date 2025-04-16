import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { WebAppUser } from '@twa-dev/types';

import { GameEngine } from '../../engine';
import { useGameActions } from './useGameActions.ts';
import { useProfile } from '../../hooks/useProfile.ts';
import { profileService } from '../../services';
import { ProfileContext } from '../../context';

import styles from './Game.module.css';

export interface GameProps {
  telegram: WebAppUser,
}

const mock = {
  telegramId: '11112222',
  firstname: 'Tilda',
  referral: '',
}

export const Game: React.FC<GameProps> = ({ telegram }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { setProfile, profile } = useContext(ProfileContext);
  const { data: incomeProfile, isLoading, isPending } = useProfile();
  const { start, end } = useGameActions();

  const { mutateAsync: makeProfile } = useMutation({
    mutationFn: profileService.make,
  });

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

  const authVerify = useCallback(async () => {
    if (!incomeProfile && !isLoading && !isPending) {
      const payload = { 
        telegramId: telegram?.id || mock.telegramId,
         firstname: telegram?.first_name || mock.firstname,
         referral: mock.referral,
        }
      const p = await makeProfile(payload);
      return setProfile(p);
    }
    setProfile(incomeProfile);
  }, [incomeProfile, isLoading, isPending, setProfile, makeProfile, telegram?.id, telegram?.first_name])

  useEffect(() => void authVerify(), [authVerify] );

  const handleGameOver = useCallback(() => {
    if (gameState === 'gameover') return;
    setGameState('gameover');
    end({ score, stars });
  }, [end, gameState, score, stars])

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    if (newScore >= 5000) setBackgroundLevel(3);
    else if (newScore >= 2500) setBackgroundLevel(2);
    else setBackgroundLevel(1);
  }, [])

  const handleStarsUpdate = useCallback((newStars: number) => {
    setStars(newStars);
  }, []);
  
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

   
    const gameEngine = new GameEngine(canvas, ctx, handleScoreUpdate, handleStarsUpdate, handleGameOver);

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
  }, [handleGameOver, handleScoreUpdate, handleStarsUpdate]);
  

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setStars(0);
    setBackgroundLevel(1);
    gameEngineRef.current?.start();
    start()
  },[start]);

  const restartGame = () => {
    setGameState('playing');
    setScore(0);
    setStars(0);
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

  const getActionInfo = useCallback(() => {
    const toInfo = (title: string, img: string, text: string, handler: () => void) => {
      return { title, img , text, handler }
    }
    switch (true) {
      case !profile: return toInfo('Auth', '', 'Please wait authentication...', () => null);
      case gameState === 'start' : return toInfo('PapaJump', 'images/player_start_img.png', 'PLAY', startGame);
      case gameState === 'gameover' : return toInfo('Game Over', 'images/game_over.png', 'PLAY', restartGame);
      default: return undefined;
    }
  }, [gameState, profile, startGame])

  const action = useMemo(() => {
    const info = getActionInfo();
    if (!info) return null;
    return (
      <div className={styles.overlay}>
        <img src={info?.img} alt="Player" className={styles.startPlayer} />
        <h1>{ info.title }</h1>
        {gameState === 'gameover' && 
        <p className={styles.gameOverScore}>
          Score: {score} 
          <span className={styles.starsCount}>Points: {stars} ⭐ </span>
          </p>
        }
        <button onClick={info.handler} className={styles.playButton}>
          { info.text }
          <span>3/3</span>
          <img src="images/ticket.png" alt="Player" className={styles.ticket} />
        </button>
      </div>
    )
  }, [gameState, getActionInfo, score, stars])

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
        {action}
        
        {gameState === 'playing' && (
          <>
           <div className={styles.scoreBoard}>
              <span>Score: {score}</span>
              <span className={styles.starsCount}>⭐ {stars}</span>
            </div>
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
