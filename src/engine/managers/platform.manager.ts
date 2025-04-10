import { Manager } from '../interfaces.ts';
import { Platform } from '../objects/Platform.ts';
// import { Star } from '../objects/Star.ts';
import StoreInstance, { Store } from '../store/index.ts';

export class PlatformManager extends Manager {
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
  update() {
    this.updatePlatforms();
  }

  draw(ctx: CanvasRenderingContext2D) {
    // this.store.stars.forEach((s) => s.draw(ctx)); 
    // if(this.store.star) {
    //   this.store.star.draw(ctx);
    // }
    this.store.platforms.forEach((p) => p.draw(ctx))
    // console.log('draw stars',this.store.stars);  
    console.log('draw platforms',this.store.platforms);
  }

  start() {
    this.jumpCount = 0;
    this.generatePlatforms();
    // this.createStars();
  }

  private generatePlatforms() {
    this.platforms = [];
    const currentLevel = this.store.player.getCurrentLevel();
    for (let i = 0; i < this.platformCount; i++) {
        this.platforms.push(new Platform(this.position, this.width, this.store.player.score, currentLevel, '#8B4513'));
        this.position += (this.height / this.platformCount);
    } 
    this.store.platforms = this.platforms;
  }

//   private createStars() {
//     const platforms = this.store.platforms; // Получаем все платформы
//     const starsToDraw = 3; // Количество звезд для отрисовки
//     let drawnStars = 0; // Счетчик отрисованных звезд

//     // Ищем подходящие платформы
//     for (const p of platforms) {
//         if (p.type !== 4 && drawnStars < starsToDraw) {
//             const star = new Star(); // Создаем новую звезду
//             const targetX = p.x + p.width / 2 - star.width / 2;
//             const targetY = p.y - p.height - 10;
//             star.x = targetX;
//             star.y = targetY;

//             this.store.stars.push(star); // Добавляем звезду в массив звезд
//             drawnStars++; // Увеличиваем счетчик отрисованных звезд
//         }
//     }
// }

  private updatePlatforms() {
    this.platforms.forEach(p => {
      if (p.type === 2) {
          if (p.x < 0 || p.x + p.width > this.width) p.vx *= -1;
          p.x += p.vx;
      }
  });

    if (this.store.platformBroken.appearance) {
        this.store.platformBroken.y += 8;
        if (this.store.platformBroken.y > this.height) {
            this.store.platformBroken.appearance = false;
        }
    }
  }
}
