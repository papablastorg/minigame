import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';

export class Star extends BaseObject {
    public x: number;
    public y: number;
    public store: Store = StoreInstance;
    public state = 0;
    public width = 20;
    public height = 20;
    private opacity = 1;

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
        
        if (this.state === 1) {
            // Fade out effect when collected
            this.opacity = Math.max(0, this.opacity - 0.1);
            if (this.opacity === 0) return;
        }
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        
        // Draw star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = i * 4 * Math.PI / 5 - Math.PI/2;
            const x1 = this.x + this.width/2 * Math.cos(angle);
            const y1 = this.y + this.width/2 * Math.sin(angle);
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add sparkle effect
        if (this.state === 0) {
            const time = Date.now() / 1000;
            ctx.globalAlpha = (Math.sin(time * 3) + 1) / 2 * this.opacity;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
        
        ctx.restore();
    }
}