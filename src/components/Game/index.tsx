import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useMutation } from '@tanstack/react-query';
import { WebAppUser } from '@twa-dev/types';
import pointImage from '/images/PAPApoint.png';

import { GameEngine } from '../../engine';
import { useGameActions } from './useGameActions.ts';
import { useProfile } from '../../hooks/useProfile.ts';
import { profileService } from '../../services';
import { ProfileContext } from '../../context';
import { useTranslation } from 'react-i18next';

import styles from './Game.module.css';
import { ImagePreloader } from '../../common/ImagePreloader';
import { Loader } from '../../common/Loader';
import { Arrow } from '../icons/Arrow.tsx';

export interface GameProps {
  telegram: WebAppUser,
}

const mock = {
  telegramId: '11112222',
  firstname: 'Tilda',
  referral: '',
}

export const Game = ({ telegram }: GameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { setProfile, profile } = useContext(ProfileContext);
  const { data: incomeProfile, isLoading, isPending } = useProfile();
  const { start, end } = useGameActions();
  const { t } = useTranslation();

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
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = window.innerWidth;
        const logicalHeight = window.innerHeight - 60;
        
        // Устанавливаем размеры в DOM (CSS размер)
        canvas.style.width = `${logicalWidth}px`;
        canvas.style.height = `${logicalHeight}px`;
        
        // Устанавливаем физические размеры канваса с учётом DPI
        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;
        
        // Сбрасываем масштабирование контекста
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Масштабируем контекст, чтобы наша логическая система координат соответствовала размеру экрана
        ctx.scale(dpr, dpr);
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

  const isLoadingTest = false;

  const getActionInfo = useCallback(() => {
    const toInfo = (title: string, img: string, text: string, handler: () => void) => {
      return { title, img , text, handler }
    }
    switch (true) {
      case !profile: return toInfo('Auth', 'images/auth.png', 'Please wait authentication...', () => null);
      case gameState === 'start' : return toInfo('PapaJump', 'images/player_start_img.png', t('game.play'), startGame);
      case gameState === 'gameover' : return toInfo(t('game.gameOver'), 'images/game_over.png', t('game.play'), restartGame);
      default: return undefined;
    }
  }, [gameState, profile, startGame, t])

  const action = useMemo(() => {
    const info = getActionInfo();
    if (!info) return null;
    return (
      <div className={styles.overlay}>
        <div className={styles.startPlayer}>
          <ImagePreloader src={info?.img} alt="Player" />
        </div>
        <h1>{ info.title }</h1>
        {gameState === 'gameover' && 
        <p className={styles.gameOverScore}>
          <span className={styles.starStats}>
            $PAPApoint: <span>{stars} </span> <ImagePreloader src={pointImage} alt="point" />
            </span>
          </p>
        }
        {info.title === 'Auth' 
          ? <p className={styles.authText}>{info.text}</p> 
          : <button onClick={info.handler} className={styles.playButton}>
              { info.text }
              <span>3/3</span>
              <div className={styles.ticket}>
                <ImagePreloader src="images/ticket.png" alt="ticket" />
              </div>
            </button>
        }
      </div>
    )
  }, [gameState, getActionInfo, stars])

  return (
        <div className={classNames(styles.gameContainer, {
        [styles.levelOne]: gameState === 'playing' && backgroundLevel === 1,
        [styles.levelTwo]: gameState === 'playing' && backgroundLevel === 2,
        [styles.levelThree]: gameState === 'playing' && backgroundLevel === 3,
        [styles.startScreen]: gameState === 'start' || gameState === 'gameover'
      })}>
        {isLoadingTest && <div className={styles.loaderContainer}><Loader /></div>}
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
        />
        {action}
        {gameState === 'playing' && (
          <>
           <div className={styles.scoreBoard}>
              <span className={styles.starsCount}>
                <ImagePreloader src={pointImage} alt="point" />
                {stars} 
                </span>
            </div>
            <div className={styles.controls}>
              <button
                  className={classNames(styles.controlButton, styles.left)}
                  onMouseDown={handleLeftButtonDown}
                  onMouseUp={handleButtonUp}
                  onTouchStart={handleLeftButtonDown}
                  onTouchEnd={handleButtonUp}
              >
                <Arrow />
              </button>
              <button
                  className={classNames(styles.controlButton, styles.right)}
                  onMouseDown={handleRightButtonDown}
                  onMouseUp={handleButtonUp}
                  onTouchStart={handleRightButtonDown}
                  onTouchEnd={handleButtonUp}
              >
                <Arrow />
              </button>
            </div>
          </>
        )}
      </div>
  );
};
