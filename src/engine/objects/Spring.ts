import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';
import springImage from '/images/jump_point.png';

export class Spring extends BaseObject {
   public x: number;
    public y: number;
    public width = 50;
    public height = 46;
    public state = 0;
    public store: Store = StoreInstance;
    public image: HTMLImageElement;

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;
        this.image = new Image();
        this.image.src = springImage;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;

        if (this.image.complete) {
            const cropY = 0;       
            const cropHeight = this.image.height;    
            const cropX = 0;         
            const cropWidth = this.image.width; 

            const scale = Math.min(this.width / cropWidth, this.height / cropHeight);
            const drawWidth = cropWidth * scale;
            const drawHeight = cropHeight * scale;
            const x = this.x + (this.width - drawWidth) / 2;
            const y = this.y + (this.height - drawHeight) / 2;

            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                x, y,
                drawWidth, drawHeight
            );
        } else {
            // Fallback rectangle if image is not loaded
            ctx.fillStyle = '#4169E1';  // Royal Blue color for spring
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    public update() {
        const p = this.store.platforms[0];  // Get the first platform

        if (p.type === 1 || p.type === 2) {  // Normal or moving platform
            const targetX = p.x + p.width / 2 - this.store.spring.width / 2;
            const targetY = p.y - p.height - 10;
            this.store.spring.x = targetX;
            this.store.spring.y = targetY;

            if (this.store.spring.y > this.height / 1.1) {
                this.store.spring.state = 0;
            }
        } else {
            this.store.spring.x = 0 - this.store.spring.width;
            this.store.spring.y = 0 - this.store.spring.height;
        }
    }
} 