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
  update() {}

  draw(_ctx: CanvasRenderingContext2D | null) {}


  start() {}
}

export abstract class BaseObject {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
  update() {}
  start() {}
  draw(_ctx: CanvasRenderingContext2D | null) {}
}

export abstract class Engine {
  private animationFrameId: number | null = null;

  start() {
    if (this.animationFrameId === null) this.update();
  }

  update() {
    this.animationFrameId = requestAnimationFrame(this.update.bind(this));
  }
}
