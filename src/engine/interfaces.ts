export interface ObjectSpacing {
    verticalSpacing: number;
}

export interface PlatformObjectSpacingConfig {
    [key: string]: ObjectSpacing;
    default: ObjectSpacing;
}

export abstract class Manager {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
  update(deltaTime: number) {}

  draw(_ctx: CanvasRenderingContext2D | null) {}


  start() {}
}

export abstract class BaseObject {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
  update(deltaTime: number) {}
  start() {}
  draw(_ctx: CanvasRenderingContext2D | null) {}
}

export abstract class Engine {
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  start() {
    this.lastTime = performance.now();
    if (this.animationFrameId === null) this.update();
  }

  update(timestamp = performance.now()) {
    const deltaTime = (timestamp - this.lastTime) / 16.67; // нормализуем к ~60 FPS
    this.lastTime = timestamp;
    this.updateGame(deltaTime);
    this.animationFrameId = requestAnimationFrame(this.update.bind(this));
  }

  updateGame(deltaTime: number) {
    // Переопределяется в дочернем классе
  }
}
