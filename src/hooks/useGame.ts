import { useEffect, useState, useRef } from "react";

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -12;  // Сила прыжка
const PLATFORM_HEIGHT = 10;
const PLATFORM_WIDTH = 100;
const DODLER_SPEED = 5;  // Скорость движения дудлера
const MIN_PLATFORMS = 5;  // Минимальное количество платформ на старте

export function useGame() {
  const [doodler, setDoodler] = useState({
    x: 175,
    y: GAME_HEIGHT - 50,
    velocity: 0,
    speedX: 0,
  });
  const [platforms, setPlatforms] = useState(() => {
    const initialPlatforms = [];
    const firstPlatformY = GAME_HEIGHT - PLATFORM_HEIGHT;
    const firstPlatformX = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
    initialPlatforms.push({ x: firstPlatformX, y: firstPlatformY });

    for (let i = 1; i < MIN_PLATFORMS; i++) {
      const yPosition = GAME_HEIGHT - (i * 100);
      const xPosition = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
      initialPlatforms.push({ x: xPosition, y: yPosition });
    }
    return initialPlatforms;
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isOnPlatform, setIsOnPlatform] = useState(false);
  const [cameraOffset, setCameraOffset] = useState(0);

  const gameLoopRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setDoodler((d) => ({ ...d, speedX: -DODLER_SPEED }));
      if (e.key === "ArrowRight") setDoodler((d) => ({ ...d, speedX: DODLER_SPEED }));

      // Перезапуск игры по пробелу
      if (e.key === " " && isGameOver) {
        setIsGameOver(false);
        setDoodler({
          x: 175,
          y: GAME_HEIGHT - 50,
          velocity: 0,
          speedX: 0,
        });
        setPlatforms(() => {
          const initialPlatforms = [];
          const firstPlatformY = GAME_HEIGHT - PLATFORM_HEIGHT;
          const firstPlatformX = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
          initialPlatforms.push({ x: firstPlatformX, y: firstPlatformY });

          for (let i = 1; i < MIN_PLATFORMS; i++) {
            const yPosition = GAME_HEIGHT - (i * 100);
            const xPosition = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);
            initialPlatforms.push({ x: xPosition, y: yPosition });
          }
          return initialPlatforms;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setDoodler((d) => ({ ...d, speedX: 0 }));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    const updateGame = () => {
      if (isGameOver) return;

      // Обновляем состояние дудлера
      setDoodler((d) => {
        let newY = d.y + d.velocity;
        let newVelocity = d.velocity + GRAVITY;

        let isCollidingWithPlatform = false;

        // Проверка столкновения с платформами
        platforms.forEach((p) => {
          // Если дудлер падает и его нижняя часть касается платформы
          if (
            newY + 50 >= p.y &&  // нижняя часть дудлера
            newY + 50 <= p.y + PLATFORM_HEIGHT &&  // в пределах платформы по вертикали
            d.x + 50 > p.x &&  // дудлер находится слева от платформы
            d.x < p.x + PLATFORM_WIDTH  // дудлер находится справа от платформы
          ) {
            // Если дудлер падает вниз, то он отскакивает только при касании нижней части платформы
            if (d.velocity > 0) {  // Только при падении
              newVelocity = JUMP_STRENGTH;  // Применяем силу прыжка
              isCollidingWithPlatform = true;  // Обнаружено столкновение с платформой
              newY = p.y - 50;  // Устанавливаем дудлера на платформу
            }
          }
        });

        if (newY > GAME_HEIGHT) {
          setIsGameOver(true);
        }

        setIsOnPlatform(isCollidingWithPlatform);

        let newX = d.x + d.speedX;
        if (newX < 0) newX = GAME_WIDTH - 50;
        if (newX > GAME_WIDTH - 50) newX = 0;

        return { ...d, x: newX, y: newY, velocity: newVelocity };
      });

      // Платформы двигаются вниз только если дудлер в воздухе
      if (!isOnPlatform) {
        setPlatforms((prevPlatforms) => {
          const newPlatforms = prevPlatforms.map((p) => ({
            ...p,
            y: p.y + 2,
          }));

          if (newPlatforms[0].y > GAME_HEIGHT) {
            const lastPlatform = newPlatforms[newPlatforms.length - 1];
            const newPlatformY = lastPlatform.y - Math.random() * 100 - 100;
            const newPlatformX = Math.random() * (GAME_WIDTH - PLATFORM_WIDTH);

            newPlatforms.push({ x: newPlatformX, y: newPlatformY });
          }

          return newPlatforms;
        });
      }

      // Камера следит за дудлером
      setCameraOffset((prevOffset) => {
        const targetOffset = Math.max(0, doodler.y - GAME_HEIGHT / 2);
        return prevOffset + (targetOffset - prevOffset) * 0.1;  // плавное следование за дудлером
      });

      gameLoopRef.current = requestAnimationFrame(updateGame);
    };

    gameLoopRef.current = requestAnimationFrame(updateGame);
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [platforms, doodler, isGameOver, isOnPlatform]);

  return { doodler, platforms, isGameOver, cameraOffset };
}
