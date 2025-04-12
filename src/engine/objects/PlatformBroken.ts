import platform_broken from '/images/broken_platform.png';

import  { BaseObject } from '../interfaces';

export class PlatformBroken extends BaseObject {
    public x: number;
    public y: number;
    public width = 100;
    public height = 15;
    public appearance = false;
    public image: HTMLImageElement;

    constructor(name: string) {
        super(name)
        this.x = 0;
        this.y = 0;
        this.image = new Image();
        this.image.src = platform_broken;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx || !this.appearance) return;

        if (this.image.complete) {
            const cropY = 8;       
            const cropHeight = 110;    
            const cropX = 3;         
            const cropWidth = 295; 

            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
