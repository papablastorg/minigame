import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';
import pointImage from '/images/PAPApoint.png';

export class Star extends BaseObject {
    public x: number;
    public y: number;
    public store: Store = StoreInstance;
    public state = 0;
    public width = 30;
    public height = 30;
    public image: HTMLImageElement;
    private opacity = 1;
    private floatSpeed: number = 3.5;
    private floatAmplitude: number = 4;
    private timeOffset: number = Math.random() * Math.PI * 2; // Случайная начальная фаза

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;
        this.image = new Image();
        this.image.src = pointImage;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;

        if (this.state === 1) {
            this.opacity = Math.max(0, this.opacity - 0.1);
            if (this.opacity === 0) return;
        }

        ctx.save();
        ctx.globalAlpha = this.opacity;

        let yOffset = 0;
        if (this.state === 0) {
            yOffset = Math.sin((Date.now() / 1000 + this.timeOffset) * this.floatSpeed) * this.floatAmplitude;
        }

        if (this.image.complete) {
            const cropY = 0;       
            const cropHeight = this.image.height;    
            const cropX = 0;         
            const cropWidth = this.image.width; 

            const scale = Math.min(this.width / cropWidth, this.height / cropHeight);
            const drawWidth = cropWidth * scale;
            const drawHeight = cropHeight * scale;
            const x = this.x + (this.width - drawWidth) / 2;
            const y = this.y + (this.height - drawHeight) / 2 + yOffset;

            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                x, y,
                drawWidth, drawHeight
            );
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
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
            if (this.state === 0) {
                const time = Date.now() / 1000;
                ctx.globalAlpha = (Math.sin(time * 3) + 1) / 2 * this.opacity;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
}