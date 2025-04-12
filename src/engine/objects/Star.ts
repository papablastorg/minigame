import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';

export class Star extends BaseObject {
    public x: number;
    public y: number;
    public store: Store = StoreInstance;
    public state = 0;
    public width = 40;
    public height = 40;

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;
        this.width = 20;
        this.height = 20;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
        
        console.log('Drawing star at:', this.x, this.y);
        
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const x1 = this.x + this.width/2 * Math.cos(i * 4 * Math.PI / 5 - Math.PI/2);
            const y1 = this.y + this.width/2 * Math.sin(i * 4 * Math.PI / 5 - Math.PI/2);
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}