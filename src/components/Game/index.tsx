import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import pointImage from '/images/PAPApoint.png';

import { GameEngine } from '../../engine';
import { useGameActions } from './useGameActions.ts';
import { ProfileContext } from '../../context';
import { useTranslation } from 'react-i18next';

import styles from './Game.module.css';
import { ImagePreloader } from '../../common/ImagePreloader';
import { Loader } from '../../common/Loader';
import { Arrow } from '../icons/Arrow.tsx';
import { ImagePreloadService } from '../../services';

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { profile } = useContext(ProfileContext);
  const { start, end } = useGameActions();
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

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

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkIfMobile();
  }, []);

  useEffect(() => {
    if (!isMobile && gameState === 'playing') {
      setShowKeyboardHint(true);
      const timer = setTimeout(() => {
        setShowKeyboardHint(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, gameState]);

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
      // Проверяем, есть ли изображение в кэше
      const cachedImage = ImagePreloadService.getImageFromCache(img);
      if (cachedImage) {
        console.log(`Image ${img} found in cache and ready to use`);
      }
      return { title, img, text, handler }
    }
    
    // Всегда используем изображение player_start_img.png для начального экрана,
    // даже если профиль еще не загружен
    if (gameState === 'start') {
      const title = profile ? 'PapaJump' : 'Auth';
      const text = profile ? t('game.play') : 'Please wait authentication...';
      const handler = profile ? startGame : () => null;
      return toInfo(title, 'images/player_start_img.png', text, handler);
    } else if (gameState === 'gameover') {
      return toInfo(t('game.gameOver'), 'images/game_over.png', t('game.play'), restartGame);
    }
    
    return undefined;
  }, [gameState, profile, startGame, t]);

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
              <span className={styles.countTicket}>3/3</span>
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
            {isMobile && (
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
            )}
            {!isMobile && showKeyboardHint && (
              <div className={styles.keyboardHint}>
                {t('game.keyboardHint')}
              </div>
            )}
          </>
        )}
      </div>
  );
};
