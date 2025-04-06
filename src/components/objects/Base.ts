export class Base {
    height = 5;
    width: number;
    x = 0;
    y: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.y = height - this.height;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}