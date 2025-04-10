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
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.store.platforms.forEach((p) => p.draw(ctx));
  }

  start() {
    this.jumpCount = 0;
    this.generatePlatforms();
  }

  public getObjectsForPlatform(): BaseObject[] {
    const objects: BaseObject[] = [];
    const random = Math.random();
    const currentLevel = this.store.player.getCurrentLevel();
    
    // Calculate star spawn chance based on level
    let starChance = 0.3; // Base chance 30%
    let springChance = 0.05; // Base chance 5%
    if (currentLevel === 2) {
        starChance = 0.4; // 40% chance on level 2
        springChance = 0.04; // 4% chance on level 2
    } else if (currentLevel === 3) {
        starChance = 0.5; // 50% chance on level 3
        springChance = 0.03; // 3% chance on level 3
    }
    
    // First check for spring (5% chance)
    if (random < springChance) {
        const spring = new Spring('spring');
        objects.push(spring);
    }
    // If no spring spawned, check for star (chance increases with level)
    else if (random < starChance) {
        const star = new Star('star');
        objects.push(star);
    }
    // Otherwise no object spawns

    return objects;
  }

  private generatePlatforms() {
    this.platforms = [];
    const currentLevel = this.store.player.getCurrentLevel();
    
    for (let i = 0; i < this.platformCount; i++) {
      // Get objects that should spawn on this platform based on spawn rates
      const platformObjects = this.getObjectsForPlatform();

      const platform = new Platform(
        this.position,
        this.width,
        this.store.player.score,
        currentLevel,
        platformObjects
      );
      
      platform.setObjectSpacing("Spring", { verticalSpacing: -8 });
      platform.setObjectSpacing("Star", { verticalSpacing: -5 });
      this.platforms.push(platform);
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
