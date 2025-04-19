import { Player } from './objects/Player';
import { Base } from './objects/Base';
import { PlatformBroken } from './objects/PlatformBroken';
import { Spring } from './objects/Spring';
import { PlatformManager } from './managers';
import { Manager, BaseObject, Engine } from './interfaces.ts';
import StoreInstance, { Store } from './store/index.ts';
import { ImagePreloadService } from '../services';

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
    onStarsUpdate: (stars: number) => void,
    onGameOver: () => void
  ) {
    super();
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = window.innerWidth;
    this.height = window.innerHeight - 60;
    this.store.onGameOver = onGameOver;
    this.store.onScoreUpdate = onScoreUpdate;
    this.store.onStarsUpdate = onStarsUpdate;
  } 

  public start() {
    this.clear();
    super.start();
    console.log('start in engine');
    
    // Проверяем что изображения уже предзагружены
    if (!ImagePreloadService.areAllImagesLoaded()) {
      console.warn('Images are not preloaded yet! Game might have visual delays.');
    }
    
    this.store.player = new Player('player', this.width, this.height);
    this.store.platforms = [];
    this.store.base = new Base('base', this.width, this.height);
    this.store.platformBroken = new PlatformBroken('platformBroken');
    this.store.spring = new Spring('spring');
    this.register(this.store.player);
    this.register(this.store.base);
    this.register(this.store.platformBroken);
    this.register(new PlatformManager('platform', this.width, this.height));
    this.objects.forEach((o) => o.start());
    this.managers.forEach((m) => m.start());
  }

  public clear() {
    this.managers = new Map();
    this.objects = new Map();
  }

  public restart() {
    console.log('Restarting game...');
    
    // Сбрасываем состояние магазина перед очисткой движка
    this.store.starsCollected = 0;
    
    // Полностью очищаем все объекты и менеджеры
    this.clear();
    
    // Ждем один микротик чтобы система iOS успела обработать изменения
    setTimeout(() => {
      // Запускаем движок с чистого состояния
      this.start();
    }, 0);
  }

  public updateGame(deltaTime: number) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.managers.forEach((m) => {m.update(deltaTime); m.draw(this.ctx)});
    this.objects.forEach((o) => {o.update(deltaTime); o.draw(this.ctx)});
  }

  private register(entry: BaseObject | Manager) {
    if(entry instanceof BaseObject) this.objects.set(entry.name, entry);
    if(entry instanceof Manager) this.managers.set(entry.name, entry);
  }
}
