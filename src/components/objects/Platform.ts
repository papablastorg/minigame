import platformImage1 from '/images/1.png';
import platformImage2 from '/images/2.png';
import platformImage3 from '/images/3.png';

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

        // Выбираем изображение платформы в зависимости от уровня
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
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;

        // Если изображение загружено, рисуем его
        if (this.image.complete) {
            // TODO: нужно удалить если хотим вместо прямоугольников другие платформы
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // TODO: нужно расскоментировать если хотим вместо прямоугольников другие платформы
            // ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Если изображение еще не загружено, рисуем прямоугольник
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}