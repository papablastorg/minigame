import platformImage3 from '/images/3.png';

import  { BaseObject } from '../interfaces';

export class PlatformBrokenSubstitute extends BaseObject {
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
        this.image.src = platformImage3;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx || !this.appearance) return;

        if (this.image.complete) {
            const cropY = 210;
            const cropHeight = 90;
            const cropX = 80;
            const cropWidth = 350;

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
