import playerImage from '/images/papa.png';

export class Player {
    vy = 6;
    vx = 0;
    isMovingLeft = false;
    isMovingRight = false;
    isDead: boolean | string = false;
    width = 60;
    height = 60;
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
            // TODO: нужно удалить если хотим вместо квадрата добавить персонажа
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // TODO: нужно разкоментировать и улучшить если хотим добавить вместо кадрата персонажа
            // if (this.dir === "left") {
            //   ctx.scale(-1, 1);
            //   ctx.drawImage(this.image, -this.x - this.width, this.y, this.width, this.height);
            // } else {
            //   ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            // }
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