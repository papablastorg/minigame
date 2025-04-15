import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { WebAppUser } from '@twa-dev/types';

import { GameEngine } from '../../engine';
import { useGameActions } from './useGameActions.ts';
import { useProfile } from '../../hooks/useProfile.ts';
import { profileService } from '../../services';
import { ProfileContext } from '../../context';
import './Game.css';

export interface GameProps {
  telegram: WebAppUser,
}

const mock = {
  telegramId: 'qweewq123321',
  firstname: 'Bob',
}

export const Game: React.FC = ({ telegram }: GameProps = mock) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { setProfile } = useContext(ProfileContext);
  const { data: profile, isLoading, isPending } = useProfile();
  const { mutate: makeProfile } = useMutation({
    mutationFn: profileService.make,
  });

  const authVerify = useCallback(async () => {
    if (!profile && !isLoading && !isPending) {
      const p = await makeProfile(telegram);
      setProfile(p);
    }
  }, [isLoading, isPending, makeProfile, profile, setProfile, telegram])

  useEffect(() => void authVerify(), [authVerify] );

  const { start, end } = useGameActions();

  const handleGameOver = useCallback(() => {
    if (gameState === 'gameover') return;
    setGameState('gameover')
    end({ score });
  }, [end, gameState, score])

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
    if (newScore >= 5000) setBackgroundLevel(3);
    else if (newScore >= 2500) setBackgroundLevel(2);
    else setBackgroundLevel(1);
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameEngine = new GameEngine(canvas, ctx, handleScoreUpdate, handleGameOver);

    gameEngineRef.current = gameEngine;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;

      if (x < rect.width / 2) {
        gameEngine.store.player.isMovingLeft = true;
        gameEngine.store.player.isMovingRight = false;
      } else {
        gameEngine.store.player.isMovingLeft = false;
        gameEngine.store.player.isMovingRight = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      gameEngine.store.player.isMovingLeft = false;
      gameEngine.store.player.isMovingRight = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleGameOver, handleScoreUpdate]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBackgroundLevel(1);
    gameEngineRef.current?.start();
    start()
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

  const getActionInfo = useCallback(() => {
    const toInfo = (title: string, info: string, handler: () => void) => {
      return { title, info, handler }
    }
    switch (true) {
      case !profile: return toInfo('', 'Please wait authentication...', () => null);
      case gameState === 'start' : return toInfo('PapaJump', 'PLAY', startGame);
      case gameState === 'gameover' : return toInfo('Game Over', 'PLAY', restartGame);
      default: return undefined;
    }
  }, [gameState, profile, startGame])

  const action = useMemo(() => {
    const info = getActionInfo();
    if (!info) return null;
    return (
      <div className="overlay">
        <img src="images/player_start_img.png" alt="Player" className="start-player" />
        <h1>{ info.title }</h1>
        <button onClick={info.handler} className="play-button">
          { info.info }
          <span>3/3</span>
          <img src="images/ticket.png" alt="Player" className="ticket" />
        </button>
      </div>
    )
  }, [getActionInfo])

  return (
      <div className={classNames('game-container', {
        'level-1': gameState === 'playing' && backgroundLevel === 1,
        'level-2': gameState === 'playing' && backgroundLevel === 2,
        'level-3': gameState === 'playing' && backgroundLevel === 3,
        'start-screen': gameState === 'start' || gameState === 'gameover'
      })}>
        <canvas
            ref={canvasRef}
            width={422}
            height={552}
        />
        {action}
        {gameState === 'playing' && (
          <>
           <div className="score-board">Score: {score}</div>
            <div className="controls">
              <div
                  className="control-button left"
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
                  className="control-button right"
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
