import { Manager, BaseObject } from '../interfaces.ts';
import { Platform } from '../objects/Platform.ts';
import { Spring } from '../objects/Spring.ts';
import { Star } from '../objects/Star.ts';
import StoreInstance, { Store } from '../store/index.ts';

export class PlatformManager extends Manager {
  // Базовые константы скорости
  private readonly BASE_BROKEN_PLATFORM_FALL_SPEED = 8;

  public platforms: Platform[] = [];
  public position: number = 0;
  public platformCount: number = 10;
  public width: number;
  public height: number;
  public store: Store = StoreInstance;
  public jumpCount: number = 0;

  constructor(name: string, width: number, height: number) {
    super(name);
    this.width = width;
    this.height = height;
  }

  update(deltaTime: number) {
    this.updatePlatforms(deltaTime);
    this.generatePlatforms(deltaTime);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.store.platforms.forEach((p) => p.draw(ctx));
  }

  start() {
    this.jumpCount = 0;
    this.position = 0;
    this.platforms = [];
    this.initialGeneratePlatform();
  }

  public getObjectsForPlatform(): BaseObject[] {
    const objects: BaseObject[] = [];
    const random = Math.random();
    const currentLevel = this.store.player?.getCurrentLevel?.() || 1;

    let starChance = 0.3;
    let springChance = 0.05;
    if (currentLevel === 2) {
        starChance = 0.5;
        springChance = 0.04;
    } else if (currentLevel === 3) {
        starChance = 0.6;
        springChance = 0.03;
    }
  
    if (random < springChance) {
        const spring = new Spring('spring');
        objects.push(spring);
    }
    else if (random < starChance) {
        const star = new Star('star');
        objects.push(star);
    }

    return objects;
  }

  private initialGeneratePlatform() {
    this.platforms = [];
    const currentLevel = this.store.player?.getCurrentLevel?.() || 1;
    const playerScore = this.store.player?.score || 0;

    for (let i = 0; i < this.platformCount; i++) {
      const platform = new Platform(
        this.position,
        this.width,
        playerScore,
        currentLevel,
        this.getObjectsForPlatform()
      );

      platform.setObjectSpacing("spring", { verticalSpacing: -8 });
      platform.setObjectSpacing("star", { verticalSpacing: 0 });
      this.platforms.push(platform);
      this.position += (this.height / this.platformCount);
    }

    this.store.platforms = this.platforms;
  }

  private generatePlatforms(deltaTime: number) {
    // Ограничиваем deltaTime для предотвращения больших скачков на мобильных устройствах
    const limitedDeltaTime = Math.min(deltaTime, 1.5);
    
    if (this.store.player.y <= (this.height / 2) - (this.store.player.height / 2)) {
      if (this.store.player.vy < 0) {
        // Более стабильное перемещение платформ с ограниченной дельтой
        const platformMovement = this.store.player.vy * limitedDeltaTime;
        
        this.store.platforms.forEach((p, i) => {
          p.y -= platformMovement;
          
          // Синхронизируем перемещение прикрепленных объектов
          p.attachedObjects.forEach(obj => {
            if ('y' in obj && typeof obj.y === 'number') {
              obj.y -= platformMovement;
            }
          });
          
          // Перепроверяем, что платформа действительно вышла за границы
          // и создаем новую с задержкой, чтобы избежать проблем при рестарте
          if (p.y > this.height) {
            const currentLevel = this.store.player.getCurrentLevel();
            
            // Используем requestAnimationFrame для создания новых платформ с небольшой задержкой
            // Это помогает со стабильностью на мобильных устройствах
            setTimeout(() => {
              if (this.store.platforms[i]) {
                this.store.platforms[i] = new Platform(
                  p.y - this.height - (this.height / this.platformCount),
                  this.width,
                  this.store.player.score,
                  currentLevel,
                  this.getObjectsForPlatform()
                );
                // Настраиваем вертикальное расположение объектов
                this.store.platforms[i].setObjectSpacing("spring", { verticalSpacing: -8 });
                this.store.platforms[i].setObjectSpacing("star", { verticalSpacing: 0 });
              }
            }, 0);
          }
        });
        this.store.base.y -= platformMovement;
      }
    }
  }

  private updatePlatforms(deltaTime: number) {
    this.platforms.forEach(p => {
      if (p.type === 2) {
        if (p.x < 0 || p.x + p.width > this.width) p.vx *= -1;
        p.x += p.vx * deltaTime;
      }
      p.update(deltaTime);
    });

    if (this.store.platformBroken.appearance) {
      this.store.platformBroken.y += this.BASE_BROKEN_PLATFORM_FALL_SPEED * deltaTime;
      if (this.store.platformBroken.y > this.height) {
        this.store.platformBroken.appearance = false;
      }
    }
  }
}
