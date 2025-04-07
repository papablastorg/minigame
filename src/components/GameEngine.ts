import { Player } from './objects/Player';
import { Platform } from './objects/Platform';
import { Base } from './objects/Base';
import { PlatformBrokenSubstitute } from './objects/PlatformBrokenSubstitute';

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;
    private gravity: number;
    private platformCount: number;
    private platforms: Platform[] = [];
    public player: Player;
    private base: Base;
    private position: number;
    private flag: number;
    private dir: string;
    private broken: number;
    private score = 0;
    private onScoreUpdate: (score: number) => void;
    private onGameOver: () => void;
    private animationFrameId: number | null = null;
    private platformBrokenSubstitute: PlatformBrokenSubstitute;
    private jumpCount = 0;

    constructor(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        onScoreUpdate: (score: number) => void,
        onGameOver: () => void
    ) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = canvas.width;
        this.height = canvas.height;
        this.gravity = 0.2;
        this.platformCount = 10;
        this.position = 0;
        this.flag = 0;
        this.dir = "left";
        this.broken = 0;
        this.onScoreUpdate = onScoreUpdate;
        this.onGameOver = onGameOver;
        this.base = new Base(canvas.width, canvas.height);
        this.player = new Player(canvas.width, canvas.height);
        this.platformBrokenSubstitute = new PlatformBrokenSubstitute();
        this.generatePlatforms();
    }

    public start() {
        if (this.animationFrameId === null) {
            this.gameLoop();
        }
    }

    public restart() {
        this.score = 0;
        this.position = 0;
        this.flag = 0;
        this.dir = "left";
        this.broken = 0;
        this.jumpCount = 0;
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.base = new Base(this.canvas.width, this.canvas.height);
        this.platformBrokenSubstitute = new PlatformBrokenSubstitute();
        this.platforms = [];
        this.generatePlatforms();
        this.start();
    }

    private gameLoop = () => {
        this.update();
        this.draw();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    private generatePlatforms() {
        this.platforms = [];
        this.position = 0;
        const currentLevel = this.getCurrentLevel();
        for (let i = 0; i < this.platformCount; i++) {
            this.platforms.push(new Platform(this.position, this.width, this.score, this.broken, currentLevel));
            this.position += (this.height / this.platformCount);
        }
    }

    private getCurrentLevel(): number {
        if (this.score >= 5000) return 3;
        if (this.score >= 2500) return 2;
        return 1;
    }

    public handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') {
            this.dir = "left";
            this.player.isMovingLeft = true;
        } else if (e.key === 'ArrowRight') {
            this.dir = "right";
            this.player.isMovingRight = true;
        }
    }

    public handleKeyUp(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') {
            this.dir = "left";
            this.player.isMovingLeft = false;
        } else if (e.key === 'ArrowRight') {
            this.dir = "right";
            this.player.isMovingRight = false;
        }
    }

    private updatePlayer() {
        if (this.player.dir === "left") {
            this.player.dir = "left";
        } else if (this.player.dir === "right") {
            this.player.dir = "right";
        }

        // Movement
        if (this.player.isMovingLeft) {
            this.player.x += this.player.vx;
            this.player.vx -= 0.15;
        } else {
            this.player.x += this.player.vx;
            if (this.player.vx < 0) this.player.vx += 0.1;
        }

        if (this.player.isMovingRight) {
            this.player.x += this.player.vx;
            this.player.vx += 0.15;
        } else {
            this.player.x += this.player.vx;
            if (this.player.vx > 0) this.player.vx -= 0.1;
        }

        // Speed limits
        if (this.player.vx > 8) this.player.vx = 8;
        else if (this.player.vx < -8) this.player.vx = -8;

        // Jump on base
        if ((this.player.y + this.player.height) > this.base.y && this.base.y < this.height) {
            this.player.jump();
        }

        // Game over
        if (this.base.y > this.height && (this.player.y + this.player.height) > this.height && this.player.isDead !== "lol") {
            this.player.isDead = true;
        }

        // Wrap around
        if (this.player.x > this.width) this.player.x = 0 - this.player.width;
        else if (this.player.x < 0 - this.player.width) this.player.x = this.width;

        // Gravity
        if (this.player.y >= (this.height / 2) - (this.player.height / 2)) {
            this.player.y += this.player.vy;
            this.player.vy += this.gravity;
        } else {
            // Move platforms and base only when player is above middle
            this.platforms.forEach((p, i) => {
                p.y -= this.player.vy;
                if (p.y > this.height) {
                    const currentLevel = this.getCurrentLevel();
                    this.platforms[i] = new Platform(p.y - this.height, this.width, this.score, this.broken, currentLevel);
                }
            });

            this.base.y -= this.player.vy;
            this.player.vy += this.gravity;

            if (this.player.vy >= 0) {
                this.player.y += this.player.vy;
                this.player.vy += this.gravity;
            }

            this.score += 1;
            this.onScoreUpdate(this.score);
        }

        // Platform collisions
        this.platforms.forEach(p => {
            const playerBottom = this.player.y + this.player.height;
            const playerLeft = this.player.x;
            const playerRight = this.player.x + this.player.width;
            const platformTop = p.y;
            const platformBottom = p.y + p.height;
            const platformLeft = p.x;
            const platformRight = p.x + p.width;

            if (this.player.vy > 0 && p.state === 0 &&
                playerBottom > platformTop &&
                playerBottom < platformBottom &&
                playerRight > platformLeft + 5 &&
                playerLeft < platformRight - 5) {
                if (p.type === 3 && p.flag === 0) {
                    p.flag = 1;
                    return;
                } else if (p.type === 4 && p.state === 0) {
                    this.player.jump();
                    p.state = 1;
                } else if (p.flag === 1) return;
                else {
                    this.player.jump();
                }
            }
        });

        if (this.player.isDead) {
            this.gameOver();
        }
    }

    private updatePlatforms() {
        this.platforms.forEach(p => {
            if (p.type === 2) {
                if (p.x < 0 || p.x + p.width > this.width) p.vx *= -1;
                p.x += p.vx;
            }

            if (p.flag === 1 && !this.platformBrokenSubstitute.appearance && this.jumpCount === 0) {
                this.platformBrokenSubstitute.x = p.x;
                this.platformBrokenSubstitute.y = p.y;
                this.platformBrokenSubstitute.appearance = true;
                this.jumpCount++;
            }
        });

        if (this.platformBrokenSubstitute.appearance) {
            this.platformBrokenSubstitute.y += 8;
            if (this.platformBrokenSubstitute.y > this.height) {
                this.platformBrokenSubstitute.appearance = false;
            }
        }
    }

    private gameOver() {
        this.platforms.forEach(p => {
            p.y -= 12;
        });

        if (this.player.y > this.height/2 && this.flag === 0) {
            this.player.y -= 8;
            this.player.vy = 0;
        } else if (this.player.y < this.height / 2) {
            this.flag = 1;
        } else if (this.player.y + this.player.height > this.height) {
            this.onGameOver();
            this.player.isDead = "lol";
        }
    }

    public update() {
        this.updatePlatforms();
        this.updatePlayer();
    }

    public draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.platforms.forEach(p => p.draw(this.ctx));
        this.platformBrokenSubstitute.draw(this.ctx);
        this.player.draw(this.ctx);
        this.base.draw(this.ctx);
    }
}