import playerImage from '/images/papa.png';

export class Player {
    vy = 6;
    vx = 0;
    isMovingLeft = false;
    isMovingRight = false;
    isDead: boolean | string = false;
    width = 50;
    height = 80;
    dir = "left";
    x: number;
    y: number;
    image: HTMLImageElement;

    constructor(width: number, height: number) {
        this.x = width / 2 - this.width / 2;
        this.y = height - this.height;
        this.image = new Image();
        this.image.src = playerImage;
    }


    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;

        if (this.image.complete) {
            ctx.save();
            // TODO: remove if we want to add a character instead of a square
            // TODO: uncomment and improve if we want to add a character instead of a square
            const cropX = 130;
            const cropY = 60;
            const cropWidth = 250;
            const cropHeight = 400;

            const aspectRatio = cropWidth / cropHeight;
            const drawHeight = this.height;
            const drawWidth = drawHeight * aspectRatio;

            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, drawWidth, drawHeight);

            // console.log('isMovingLeft',this.isMovingLeft);
            console.log('this.dir',this.dir);

            if (this.dir === "right") {
              ctx.scale(-1, 1);
                  ctx.drawImage(
                    this.image,
                    cropX, cropY,
                    cropWidth, cropHeight,
                    -this.x - drawWidth, this.y,
                    drawWidth, drawHeight
                );
            } else {
                ctx.drawImage(
                    this.image,
                    cropX, cropY,
                    cropWidth, cropHeight,
                    this.x, this.y,
                    drawWidth, drawHeight
                );
            }
            ctx.restore();
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    jump() {
        this.vy = -6;
        this.vx = 0;
    }

    jumpHigh() {
        this.vy = -9;
        this.vx = 0;
    }
}