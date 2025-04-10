import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';

export class Star extends BaseObject {
    public x: number;
    public y: number;
    public store: Store = StoreInstance;
    public state = 0;
    public width = 40;
    public height = 40;

    constructor(name: string, x: number, y: number) {
        super(name);
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
    }

    draw(ctx: CanvasRenderingContext2D) {
        // console.log('Drawing star at', { x: this.x, y: this.y, state: this.state });
        if (ctx) {
            ctx.fillStyle = '#FFD700'; // Цвет звезды
            ctx.fillRect(this.x, this.y, this.width, this.height); // Рисуем квадрат
        }
    
    }
}