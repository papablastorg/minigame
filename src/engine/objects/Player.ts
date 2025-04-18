import playerImage from '/images/player_jump2.png';
import playerImageJumped from '/images/player_jumped.png';
import playerImageFall from '/images/player_jump.png';

import { BaseObject } from '../interfaces.ts';
import { Spring } from './Spring.ts';
import { Star } from './Star.ts';
import StoreInstance, { Store } from '../store/index.ts';
import { ImagePreloadService } from '../../services';

export class Player extends BaseObject {
    // Базовые постоянные скорости и силы (для 60fps)
    private readonly BASE_JUMP_VELOCITY = -8;
    private readonly BASE_HIGH_JUMP_VELOCITY = -16;
    private readonly BASE_GRAVITY = 0.2;
    private readonly BASE_HORIZONTAL_ACCEL = 0.15;
    private readonly BASE_HORIZONTAL_DECEL = 0.1;
    private readonly BASE_MAX_HORIZONTAL_SPEED = 8;
    private readonly BASE_MAX_FALL_SPEED = 8;
    private readonly BASE_PLATFORM_MOVE_SPEED = 12;
    private readonly BASE_PLAYER_MOVE_SPEED = 8;

    public vy = 6;
    public vx = 0;
    public isMovingLeft = false;
    public isMovingRight = false;
    public isDead: boolean | string = false;
    public width = 50;
    public height = 80;
    public dir = "left";
    public x: number;
    public y: number;
    public image: HTMLImageElement;
    public imageJumped: HTMLImageElement;
    public imageFall: HTMLImageElement;
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

        // Использование предзагруженных изображений из кэша
        const cachedImage = ImagePreloadService.getImageFromCache('/images/player_jump2.png');
        const cachedImageJumped = ImagePreloadService.getImageFromCache('/images/player_jumped.png');
        const cachedImageFall = ImagePreloadService.getImageFromCache('/images/player_jump.png');

        // Если изображения есть в кэше, используем их
        if (cachedImage && cachedImageJumped && cachedImageFall) {
            this.image = cachedImage;
            this.imageJumped = cachedImageJumped;
            this.imageFall = cachedImageFall;
        } else {
            // Резервный вариант, если изображения не были предзагружены
            this.image = new Image();
            this.imageJumped = new Image();
            this.imageFall = new Image();
            this.image.src = playerImage;
            this.imageJumped.src = playerImageJumped;
            this.imageFall.src = playerImageFall;
        }

        this.gravity = this.BASE_GRAVITY;
        this.broken = 0;
    }

    start() {
        this.flag = 0;
        this.dir = 'left';
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;

        if (this.image.complete && this.imageJumped.complete && this.imageFall.complete) {
            ctx.save();
            let currentImage;
            if (this.vy < 0) currentImage = this.imageJumped;
            else if (this.vy > 0) currentImage = this.imageFall;
            else currentImage = this.image;

            let cropX = 130;
            let cropY = 13;
            const cropWidth = 245;
            const cropHeight = 400;

            const aspectRatio = cropWidth / cropHeight;
            const drawHeight = this.height;
            const drawWidth = drawHeight * aspectRatio;

            if (this.dir === 'left') cropX = 130;
            else if (this.dir === 'right') cropY = 13;
            else if (this.dir === 'right_land') cropY = 13;
            else if (this.dir === 'left_land') cropY = 13;

            const isRightDir = this.dir === 'right' || this.dir === 'right_land';
            if(isRightDir) ctx.scale(-1, 1);
            ctx.drawImage(
                currentImage,
                cropX, cropY,
                cropWidth, cropHeight,
                isRightDir ? (-this.x - drawWidth) : this.x,
                this.y,
                drawWidth, drawHeight
            );
            ctx.restore();
        } else {
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    jump() {
        this.vy = this.BASE_JUMP_VELOCITY;
    }

    jumpHigh() {
        this.vy = this.BASE_HIGH_JUMP_VELOCITY;
    }

    land() {
        // State is automatically reset when vy <= 0
    }

    public update(deltaTime: number) {
        // Update direction based on movement
        if (this.store.player.isMovingLeft) {
            this.store.player.dir = "left";
        } else if (this.store.player.isMovingRight) {
            this.store.player.dir = "right";
        }

        const horizontalAccel = this.BASE_HORIZONTAL_ACCEL * deltaTime;
        const horizontalDecel = this.BASE_HORIZONTAL_DECEL * deltaTime;
        const maxHorizontalSpeed = this.BASE_MAX_HORIZONTAL_SPEED;
        
        // Movement с учетом deltaTime
        if (this.store.player.isMovingLeft) {
            this.store.player.x += this.store.player.vx * deltaTime;
            this.store.player.vx -= horizontalAccel;
        } else {
            this.store.player.x += this.store.player.vx * deltaTime;
            if (this.store.player.vx < 0) this.store.player.vx += horizontalDecel;
        }

        if (this.store.player.isMovingRight) {
            this.store.player.x += this.store.player.vx * deltaTime;
            this.store.player.vx += horizontalAccel;
        } else {
            this.store.player.x += this.store.player.vx * deltaTime;
            if (this.store.player.vx > 0) this.store.player.vx -= horizontalDecel;
        }

        // Speed limits
        if (this.store.player.vx > maxHorizontalSpeed) this.store.player.vx = maxHorizontalSpeed;
        else if (this.store.player.vx < -maxHorizontalSpeed) this.store.player.vx = -maxHorizontalSpeed;

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

        // Гравитация с учетом deltaTime
        const gravity = this.BASE_GRAVITY * deltaTime;
        const maxFallSpeed = this.BASE_MAX_FALL_SPEED;

        // Gravity and platform movement
        if (this.store.player.y >= (this.canvasHeight / 2) - (this.store.player.height / 2)) {
            this.store.player.y += this.store.player.vy * deltaTime;
            this.store.player.vy = Math.min(this.store.player.vy + gravity, maxFallSpeed);
        } else {
            this.store.player.vy = Math.min(this.store.player.vy + gravity, maxFallSpeed);
            if (this.store.player.vy >= 0) {
                this.store.player.y += this.store.player.vy * deltaTime;
                this.store.player.vy = Math.min(this.store.player.vy + gravity, maxFallSpeed);
            }

            // Увеличение счета в зависимости от скорости обновления кадров
            this.score += 1 * deltaTime;
            this.store.onScoreUpdate(Math.floor(this.score));
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

            // Check for star collisions
            const star = p.attachedObjects.find(obj => obj instanceof Star) as Star | undefined;
            if (star && 
                star.state === 0 &&
                playerLeft < star.x + star.width &&
                playerRight > star.x &&
                playerBottom > star.y &&
                this.store.player.y < star.y + star.height) {
                star.state = 1;
                this.store.starsCollected++;
                this.store.onStarsUpdate(this.store.starsCollected);
            }

            // Check for spring collisions
            const spring = p.attachedObjects.find(obj => obj instanceof Spring) as Spring | undefined;
            if (spring &&
                this.store.player.vy > 0 &&
                spring.state === 0 &&
                (playerLeft + 15 < spring.x + spring.width) &&
                (playerRight - 15 > spring.x) &&
                (playerBottom > spring.y) &&
                (playerBottom < spring.y + spring.height)) {
                spring.state = 1;
                this.store.player.jumpHigh();
                return;
            }

            // Platform collision check
            if (this.store.player.vy > 0 && p.state === 0 &&
                playerBottom > platformTop &&
                playerBottom < platformBottom &&
                playerRight > platformLeft + 5 &&
                playerLeft < platformRight - 5) {
                if (p.type === 3 && p.flag === 0) {
                    p.flag = 1;
                    if (!this.store.platformBroken.appearance) {
                        this.store.platformBroken.x = p.x;
                        this.store.platformBroken.y = p.y;
                        this.store.platformBroken.appearance = true;
                    }
                    return;
                } else if (p.type === 4 && p.state === 0) {
                    this.store.player.jump();
                    p.state = 1;
                } else if (p.flag === 1) return;
                else {
                    this.store.player.land();
                    this.store.player.jump();
                    this.store.player.dir = this.store.player.dir === "right" ? "right_land" : "left_land";
                    setTimeout(() => {
                        this.store.player.dir = this.store.player.dir === "right_land" ? "right" : "left";
                    }, 200);
                }
            }
        });

        if (this.store.player.isDead) {
            this.gameOver(deltaTime);
        }
    }

    public getCurrentLevel(): number {
        if (this.score >= 5000) return 3;
        if (this.score >= 2500) return 2;
        return 1;
    }

    private gameOver(deltaTime: number) {
        const moveSpeed = this.BASE_PLATFORM_MOVE_SPEED * deltaTime;
        this.store.platforms.forEach(p => {
            p.y -= moveSpeed;
        });

        if (this.store.player.y > this.canvasHeight/2 && this.flag === 0) {
            this.store.player.y -= this.BASE_PLAYER_MOVE_SPEED * deltaTime;
            this.store.player.vy = 0;
        } else if (this.store.player.y < this.canvasHeight / 2) {
            this.flag = 1;
        } else if (this.store.player.y + this.store.player.height > this.canvasHeight) {
            this.store.onGameOver();
            this.store.player.isDead = "lol";
        }
    }
}
