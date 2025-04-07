export abstract class Manager {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
  update() {}

  draw(_ctx: CanvasRenderingContext2D) {}


  start() {}
}


export abstract class BaseObject {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
  update() {}
  start() {}
  draw(ctx: CanvasRenderingContext2D) {}
}

export abstract class Engine {
  private animationFrameId: number = null;

  start() {
    if (this.animationFrameId === null) this.update();
  }

  update() {
    this.animationFrameId = requestAnimationFrame(this.update.bind(this));
  }
}
