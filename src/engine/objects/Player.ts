import playerImage from '/images/papa.png';

import { BaseObject } from '../interfaces.ts';
import { Platform } from './Platform.ts';
import StoreInstance, { Store } from '../store/index.ts';
export class Player extends BaseObject {
    public vy = 6;
    public vx = 0;
    public isMovingLeft = false;
    public isMovingRight = false;
    public isDead: boolean | string = false;
    public width = 50;
    public height = 80;
    public dir = 'left';
    public x: number;
    public y: number;
    public image: HTMLImageElement;
    public score: number = 0;
    public store: Store = StoreInstance;
    public gravity: number;
    public flag: number = 0;
    public broken: number;
    public canvasHeight: number;
    public canvasWidth: number;

    constructor(name: string, width: number, height: number) {
        super(name);
        this.canvasHeight = height;
        this.canvasWidth = width;
        this.x = width / 2 - this.width / 2;
        this.y = height - this.height;
        this.image = new Image();
        this.image.src = playerImage;
        this.gravity = 0.2;
        this.broken = 0;
    }


    start() {
        this.flag = 0;
        this.dir = 'left';
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
            ctx.fillRect(this.x, this.y, this.canvasWidth, this.canvasHeight);
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

    public update() {
        // Movement
        if (this.store.player.isMovingLeft) {
            this.store.player.x += this.store.player.vx;
            this.store.player.vx -= 0.15;
        } else {
            this.store.player.x += this.store.player.vx;
            if (this.store.player.vx < 0) this.store.player.vx += 0.1;
        }

        if (this.store.player.isMovingRight) {
            this.store.player.x += this.store.player.vx;
            this.store.player.vx += 0.15;
        } else {
            this.store.player.x += this.store.player.vx;
            if (this.store.player.vx > 0) this.store.player.vx -= 0.1;
        }

        // Speed limits
        if (this.store.player.vx > 8) this.store.player.vx = 8;
        else if (this.store.player.vx < -8) this.store.player.vx = -8;

        // Jump on base
        if ((this.store.player.y + this.store.player.height) > this.store.base.y && this.store.base.y < this.canvasHeight) {
            this.store.player.jump();
        }

        // Game over
        if (this.store.base.y > this.canvasHeight && (this.store.player.y + this.store.player.height) > this.canvasHeight && this.store.player.isDead !== "lol") {
            this.store.player.isDead = true;
        }

        // Wrap around
        if (this.store.player.x > this.canvasWidth) this.store.player.x = 0 - this.store.player.width;
        else if (this.store.player.x < 0 - this.store.player.width) this.store.player.x = this.canvasWidth;

        // Gravity
        if (this.store.player.y >= (this.canvasHeight / 2) - (this.store.player.height / 2)) {
            this.store.player.y += this.store.player.vy;
            this.store.player.vy += this.gravity;
        } else {
            // Move platforms and base only when player is above middle
            this.store.platforms.forEach((p, i) => {
                p.y -= this.store.player.vy;
                if (p.y > this.canvasHeight) {
                    const currentLevel = this.getCurrentLevel();
                    this.store.platforms[i] = new Platform(p.y - this.canvasHeight, this.canvasWidth, this.score, this.broken, currentLevel);
                }
            });

            this.store.base.y -= this.store.player.vy;
            this.store.player.vy += this.gravity;

            if (this.store.player.vy >= 0) {
                this.store.player.y += this.store.player.vy;
                this.store.player.vy += this.gravity;
            }

            this.score += 1;
            this.store.onScoreUpdate(this.score);
        }

        // Platform collisions
        this.store.platforms.forEach(p => {
            const playerBottom = this.store.player.y + this.store.player.height;
            const playerLeft = this.store.player.x;
            const playerRight = this.store.player.x + this.store.player.width;
            const platformTop = p.y;
            const platformBottom = p.y + p.height;
            const platformLeft = p.x;
            const platformRight = p.x + p.width;

            if (this.store.player.vy > 0 && p.state === 0 &&
              playerBottom > platformTop &&
              playerBottom < platformBottom &&
              playerRight > platformLeft + 5 &&
              playerLeft < platformRight - 5) {
                if (p.type === 3 && p.flag === 0) {
                    p.flag = 1;
                    return;
                } else if (p.type === 4 && p.state === 0) {
                    this.store.player.jump();
                    p.state = 1;
                } else if (p.flag === 1) return;
                else {
                    this.store.player.jump();
                }
            }
        });

        if (this.store.player.isDead) {
            this.gameOver();
        }
    }

    public getCurrentLevel(): number {
        if (this.score >= 5000) return 3;
        if (this.score >= 2500) return 2;
        return 1;
    }

    private gameOver() {
        this.store.platforms.forEach(p => {
            p.y -= 12;
        });

        if (this.store.player.y > this.canvasHeight/2 && this.flag === 0) {
            this.store.player.y -= 8;
            this.store.player.vy = 0;
        } else if (this.store.player.y < this.canvasHeight / 2) {
            this.flag = 1;
        } else if (this.store.player.y + this.store.player.height > this.canvasHeight) {
            this.store.onGameOver();
            this.store.player.isDead = "lol";
        }
    }
}
