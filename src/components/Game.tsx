import { useGame } from "../hooks/useGame";
import { useEffect, useRef } from "react";

const PLATFORM_HEIGHT = 10;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

export default function Game() {
  const { doodler, platforms, isGameOver, cameraOffset } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);


  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      ctx.clearRect(0, 0, 400, 600); // Очищаем экран

      // Камера (сдвигаем экран)
      ctx.save();
      ctx.translate(0, -cameraOffset);

      // Рисуем дудлера
      ctx.fillStyle = "blue";
      ctx.fillRect(doodler.x, doodler.y, 50, 50);

      // Рисуем платформы
      ctx.fillStyle = "green";
      platforms.forEach((p) => ctx.fillRect(p.x, p.y, 100, PLATFORM_HEIGHT));

      // Проверка состояния игры
      if (isGameOver) {
        ctx.fillStyle = "black";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", 120, 250);
      }

      ctx.restore();

      requestAnimationFrame(draw);
    };

    draw();
  }, [doodler, platforms, isGameOver, cameraOffset]);

  return (
    <div>
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} style={{  border: "1px solid red", background: "#eee" }} />
      {isGameOver && <button onClick={() => window.location.reload()}>Restart</button>}
    </div>
  );
}
