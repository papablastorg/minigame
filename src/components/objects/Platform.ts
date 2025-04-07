import platformImage1 from '/images/1.png';
import platformImage2 from '/images/2.png';
import platformImage3 from '/images/3.png';
import platformImage4 from '/images/platforma.png';

export class Platform {
    x: number;
    y: number;
    width = 100;
    height = 15;
    flag = 0;
    state = 0;
    type: number;
    vx = 1;
    moved = 0;
    image: HTMLImageElement;

    constructor(position: number, width: number, score: number, broken: number, level: number) {
        this.x = Math.random() * (width - this.width);
        this.y = position;
        this.image = new Image();

        // Select platform image based on level
        if (level === 1) {
            this.image.src = platformImage1;
        } else if (level === 2) {
            this.image.src = platformImage2;
        } else {
            this.image.src = platformImage3;
        }

        // Platform types
        // 1: Normal
        // 2: Moving
        // 3: Breakable
        // 4: Vanishable
        if (score >= 5000) this.type = [2, 3, 3, 3, 4, 4, 4, 4][Math.floor(Math.random() * 8)];
        else if (score >= 2000) this.type = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4][Math.floor(Math.random() * 11)];
        else if (score >= 1000) this.type = [2, 2, 2, 3, 3, 3, 3, 3][Math.floor(Math.random() * 8)];
        else if (score >= 500) this.type = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3][Math.floor(Math.random() * 13)];
        else if (score >= 100) this.type = [1, 1, 1, 1, 2, 2][Math.floor(Math.random() * 6)];
        else this.type = 1;

        if (this.type === 3 && broken < 1) {
            broken++;
        } else if (this.type === 3 && broken >= 1) {
            this.type = 1;
            broken = 0;
        }

        // Select platform image based on type
        if (this.type === 1) { // Normal platform
            this.image.src = platformImage1;
        } else if (this.type === 2) { // Moving platform
            this.image.src = platformImage2;
        } else if (this.type === 3) { // Breakable platform
            this.image.src = platformImage3;
        } else if (this.type === 4) { // Vanishable platform
            this.image.src = platformImage4;
        }

        this.moved = 0;
        this.vx = 1;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;

        // If platform is broken, don't draw it
        if (this.type === 3 && this.flag === 1) {
            return;
        }

        // If image is loaded, draw it
        if (this.image.complete) {          
            // TODO: remove if we want to use different platforms instead of rectangles
            // ctx.fillStyle = '#8B4513';
            // ctx.fillRect(this.x, this.y, this.width, this.height);
            // TODO: uncomment if we want to use different platforms instead of rectangles
            const cropY = 210;       
            const cropHeight = 90;    
            const cropX = 80;         
            const cropWidth = 350; 

            // const aspectRatio = cropWidth / cropHeight;
            // const drawHeight = this.height;
            // const drawWidth = drawHeight * aspectRatio;

            // const aspectRatio = cropWidth / cropHeight;
            // const drawWidth = this.width;
            // const drawHeight = drawWidth / aspectRatio;
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            // Fallback rectangle if image is not loaded
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}