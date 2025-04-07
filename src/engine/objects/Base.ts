import { BaseObject } from "../interfaces.ts";

export class Base extends BaseObject {
    public height = 5;
    public width: number;
    public x = 0;
    public y: number;
    public name: string;

    constructor(name: string, width: number, height: number) {
        super(name);
        this.name = name
        this.width = width;
        this.y = height - this.height;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
