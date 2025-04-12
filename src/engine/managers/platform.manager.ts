import { Manager, BaseObject } from '../interfaces.ts';
import { Platform } from '../objects/Platform.ts';
import { Spring } from '../objects/Spring.ts';
import { Star } from '../objects/Star.ts';
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
    this.generatePlatforms();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.store.platforms.forEach((p) => p.draw(ctx));
  }

  start() {
    this.jumpCount = 0;
    this.initialGeneratePlatform();
  }

  public getObjectsForPlatform(): BaseObject[] {
    const objects: BaseObject[] = [];
    const random = Math.random();
    const currentLevel = this.store.player.getCurrentLevel();

    let starChance = 0.3;
    let springChance = 0.05;
    if (currentLevel === 2) {
        starChance = 0.4;
        springChance = 0.04;
    } else if (currentLevel === 3) {
        starChance = 0.5;
        springChance = 0.03;
    }
    
    console.log('Random value:', random, 'Star chance:', starChance, 'Spring chance:', springChance);
    
    if (random < springChance) {
        const spring = new Spring('spring');
        objects.push(spring);
        console.log('Created spring');
    }
    else if (random < starChance) {
        const star = new Star('star');
        objects.push(star);
        console.log('Created star');
    }

    return objects;
  }

  private initialGeneratePlatform() {
    this.platforms = [];
    const currentLevel = this.store.player.getCurrentLevel();

    for (let i = 0; i < this.platformCount; i++) {
      const platform = new Platform(
        this.position,
        this.width,
        this.store.player.score,
        currentLevel,
        this.getObjectsForPlatform()
      );

      platform.setObjectSpacing("Spring", { verticalSpacing: -8 });
      platform.setObjectSpacing("Star", { verticalSpacing: -5 });
      this.platforms.push(platform);
      this.position += (this.height / this.platformCount);
    }

    this.store.platforms = this.platforms;
  }

  private generatePlatforms() {
    if (this.store.player.y <= (this.height / 2) - (this.store.player.height / 2)) {
      if (this.store.player.vy < 0) {
        this.store.platforms.forEach( (p, i) => {
          p.y -= this.store.player.vy;
          if (p.y > this.height) {
            const currentLevel = this.store.player.getCurrentLevel();
            this.store.platforms[i] = new Platform(
              p.y - this.height - (this.height / this.platformCount),
              this.width,
              this.store.player.score,
              currentLevel,
              this.getObjectsForPlatform()
            );
          }
        } );
        this.store.base.y -= this.store.player.vy;
      }
    }
  }

  private updatePlatforms() {
    this.platforms.forEach(p => {
      if (p.type === 2) {
        if (p.x < 0 || p.x + p.width > this.width) p.vx *= -1;
        p.x += p.vx;
      }
      p.update();
    });

    if (this.store.platformBroken.appearance) {
      this.store.platformBroken.y += 8;
      if (this.store.platformBroken.y > this.height) {
        this.store.platformBroken.appearance = false;
      }
    }
  }
}
