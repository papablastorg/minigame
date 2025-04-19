import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';

import { GameEngine } from '../../engine';
import { useGameActions } from './useGameActions.ts';
import { ProfileContext } from '../../context';
import { useTranslation } from 'react-i18next';

import styles from './Game.module.css';
import { ImagePreloader } from '../../common/ImagePreloader';
import { Loader } from '../../common/Loader';
import { Arrow } from '../icons/Arrow.tsx';
import { ImagePreloadService } from '../../services';

// Add inline styles to prevent text selection and other touch behaviors
const noSelectStyles: React.CSSProperties = {
  WebkitUserSelect: 'none',
  userSelect: 'none',
  WebkitTouchCallout: 'none',
  touchAction: 'manipulation',
};

// Вместо прямого импорта, используем константу с путем к изображению
const POINT_IMAGE_PATH = '/images/PAPApoint.png';

export const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [backgroundLevel, setBackgroundLevel] = useState(1);
  const gameEngineRef = useRef<GameEngine | null>(null);
  // Добавляем состояние для локального тестового режима
  const [isTestMode, setIsTestMode] = useState(false);
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
    // Отправляем данные на сервер только если не в тестовом режиме
    if (!isTestMode) {
      end({ score, stars });
    } else {
      console.log('Test mode: Game Over data not sent to server', { score, stars });
    }
  }, [end, gameState, score, stars, isTestMode]);

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
    // Отправляем данные на сервер только если не в тестовом режиме
    if (!isTestMode) {
      start();
    } else {
      console.log('Test mode: Game start not sent to server');
    }
  },[start, isTestMode]);

  const restartGame = useCallback(() => {
    // Подготавливаем UI состояния
    setGameState('playing');
    setScore(0);
    setStars(0);
    setBackgroundLevel(1);
    
    // Для полного и корректного рестарта необходимо полностью пересоздать игровой движок
    // и дать ему полностью свежее состояние
    
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Сначала полностью очищаем Store от старых ссылок на объекты
        if (gameEngineRef.current) {
          // Очистка и освобождение ресурсов
          try {
            gameEngineRef.current.store.player = null as any;
            gameEngineRef.current.store.platforms = [];
            gameEngineRef.current.store.starsCollected = 0;
          } catch (e) {
            console.warn("Error during store cleanup:", e);
          }
          
          // Важно - освобождаем ссылку на старый движок для GC
          gameEngineRef.current = null;
        }
        
        console.log("Creating a fresh game engine instance");
        
        // Создаем новый экземпляр игрового движка
        const newGameEngine = new GameEngine(
          canvas, 
          ctx, 
          handleScoreUpdate, 
          handleStarsUpdate, 
          handleGameOver
        );
        
        // Сохраняем ссылку
        gameEngineRef.current = newGameEngine;
        
        // Запускаем новый движок с чистого листа
        setTimeout(() => {
          // Запускаем в следующем тике, чтобы дать время на инициализацию
          newGameEngine.start();
          console.log("Fresh game engine started");
        }, 0);
      }
    }
  }, [handleGameOver, handleScoreUpdate, handleStarsUpdate]);

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
    
    // В тестовом режиме или при наличии профиля показываем экран запуска игры
    if (gameState === 'start') {
      // Если в тестовом режиме или профиль загружен, показываем кнопку старта
      if (isTestMode || profile) {
        const title = 'PapaJump';
        const text = t('game.play');
        const handler = startGame;
        return toInfo(title, 'images/player_start_img.png', text, handler);
      } else {
        // Профиль не загружен и не в тестовом режиме - показываем экран авторизации
        const title = 'Auth';
        const text = 'Please wait authentication...';
        const handler = () => null;
        return toInfo(title, 'images/player_start_img.png', text, handler);
      }
    } else if (gameState === 'gameover') {
      return toInfo(t('game.gameOver'), 'images/game_over.png', t('game.play'), restartGame);
    }
    
    return undefined;
  }, [gameState, profile, startGame, t, isTestMode, restartGame]);

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
            $PAPApoint: <span>{stars} </span> <ImagePreloader src={POINT_IMAGE_PATH} alt="point" />
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
      })} style={noSelectStyles}>
        {/* Добавляем переключатель тестового режима */}
        <div className={styles.testModeSwitch}>
          <input 
            type="checkbox" 
            id="testModeSwitch" 
            checked={isTestMode} 
            onChange={() => setIsTestMode(!isTestMode)} 
          />
          <label htmlFor="testModeSwitch">Тестовый режим</label>
        </div>
        
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
                <ImagePreloader src={POINT_IMAGE_PATH} alt="point" />
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
