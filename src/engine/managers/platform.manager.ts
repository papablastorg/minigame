import { Manager } from '../interfaces.ts';
import { Platform } from '../objects/Platform.ts';
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
    this.store.platforms.forEach((p) => p.draw(ctx))

  }

  start() {
    this.jumpCount = 0;
    this.generatePlatforms();
  }

  private generatePlatforms() {
    this.platforms = [];
    const currentLevel = this.store.player.getCurrentLevel();
    for (let i = 0; i < this.platformCount; i++) {
        this.platforms.push(new Platform(this.position, this.width, this.store.player.score, currentLevel));
        this.position += (this.height / this.platformCount);
    } 
    this.store.platforms = this.platforms;
  }

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
