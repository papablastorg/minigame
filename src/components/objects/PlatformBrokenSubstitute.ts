import platformImage3 from '/images/3.png';

export class PlatformBrokenSubstitute {
    x: number;
    y: number;
    width = 100;
    height = 15;
    appearance = false;
    image: HTMLImageElement;

    constructor() {
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