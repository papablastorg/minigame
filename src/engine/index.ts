import { Player } from './objects/Player';
import { Base } from './objects/Base';
import { PlatformBroken } from './objects/PlatformBroken';
import { PlatformManager } from './managers';
import { Manager, BaseObject, Engine } from './interfaces.ts';
import StoreInstance, { Store } from './store/index.ts';
import { Spring } from './objects/Spring.ts';
import { Star } from './objects/Star.ts';

export class GameEngine extends Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private objects: Map<string, BaseObject> = new Map();
  private managers: Map<string, Manager> = new Map();
  public store: Store = StoreInstance;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    onScoreUpdate: (score: number) => void,
    onGameOver: () => void
  ) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    this.store.onGameOver = onGameOver;
    this.store.onScoreUpdate = onScoreUpdate;
  }

  public start() {
    this.clear();
    super.start();
    console.log('start in engine')
    this.store.star = new Star('star', 0, 0); 
    this.store.player = new Player('player', this.canvas.width, this.canvas.height);
    this.store.platforms = [];
    // this.store.stars = [];
    this.store.base = new Base('base', this.canvas.width, this.canvas.height);
    this.store.platformBroken = new PlatformBroken('platformBroken');
    this.store.spring = new Spring('spring');
    this.register(this.store.star);
    this.register(this.store.spring);
    this.register(this.store.player);
    this.register(this.store.base);
    this.register(this.store.platformBroken);
    this.register(new PlatformManager('platform', this.canvas.width, this.canvas.height));
    this.objects.forEach((o) => o.start());
    this.managers.forEach((m) => m.start());
  }

  public clear() {
    this.managers = new Map();
    this.objects = new Map();
  }

  public restart() {
    this.start();
  }


  public update() {
    super.update();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.managers.forEach((m) => {m.update(); m.draw(this.ctx)});
    this.objects.forEach((o) => {o.update(); o.draw(this.ctx)});
  }

  private register(entry: BaseObject | Manager) {
    if(entry instanceof BaseObject) this.objects.set(entry.name, entry);
    if(entry instanceof Manager) this.managers.set(entry.name, entry);
  }
}
