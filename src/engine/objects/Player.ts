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
        this.vy = 6;
        this.vx = 0;
        this.x = this.canvasWidth / 2 - this.width / 2;
        this.y = this.canvasHeight - this.height;
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.gravity = this.BASE_GRAVITY;
        this.isDead = false;
        this.score = 0;
        this.broken = 0;
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
        if (this.isMovingLeft) {
            this.dir = "left";
        } else if (this.isMovingRight) {
            this.dir = "right";
        }

        const horizontalAccel = this.BASE_HORIZONTAL_ACCEL * deltaTime;
        const horizontalDecel = this.BASE_HORIZONTAL_DECEL * deltaTime;
        const maxHorizontalSpeed = this.BASE_MAX_HORIZONTAL_SPEED;
        
        // Movement с учетом deltaTime
        if (this.isMovingLeft) {
            this.x += this.vx * deltaTime;
            this.vx -= horizontalAccel;
        } else {
            this.x += this.vx * deltaTime;
            if (this.vx < 0) this.vx += horizontalDecel;
        }

        if (this.isMovingRight) {
            this.x += this.vx * deltaTime;
            this.vx += horizontalAccel;
        } else {
            this.x += this.vx * deltaTime;
            if (this.vx > 0) this.vx -= horizontalDecel;
        }

        // Speed limits
        if (this.vx > maxHorizontalSpeed) {
            this.vx = maxHorizontalSpeed;
        } else if (this.vx < -maxHorizontalSpeed){
            this.vx = -maxHorizontalSpeed;
        }

        // Jump on base
        if ((this.y + this.height) > this.store.base.y && this.store.base.y < this.canvasHeight) {
            this.jump();
        }

        // Game over
        if (this.store.base.y > this.canvasHeight && (this.y + this.height) > this.canvasHeight && this.isDead !== "lol") {
            this.isDead = true;
        }

        // Wrap around
        if (this.x > this.canvasWidth) this.x = 0 - this.width;
        else if (this.x < 0 - this.width) this.x = this.canvasWidth;

        // Гравитация с учетом deltaTime
        const gravity = this.BASE_GRAVITY * deltaTime;
        const maxFallSpeed = this.BASE_MAX_FALL_SPEED;

        // Gravity and platform movement
        if (this.y >= (this.canvasHeight / 2) - (this.height / 2)) {
            this.y += this.vy * deltaTime;
            this.vy = Math.min(this.vy + gravity, maxFallSpeed);
        } else {
            this.vy = Math.min(this.vy + gravity, maxFallSpeed);
            if (this.vy >= 0) {
                this.y += this.vy * deltaTime;
                this.vy = Math.min(this.vy + gravity, maxFallSpeed);
            }

            // Увеличение счета в зависимости от скорости обновления кадров
            this.score += 1 * deltaTime;
            this.store.onScoreUpdate(Math.floor(this.score));
        }

        // Platform collisions
        this.store.platforms.forEach(p => {
            const playerBottom = this.y + this.height;
            const playerLeft = this.x;
            const playerRight = this.x + this.width;
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
                this.y < star.y + star.height) {
                star.state = 1;
                this.store.starsCollected++;
                this.store.onStarsUpdate(this.store.starsCollected);
            }

            // Check for spring collisions
            const spring = p.attachedObjects.find(obj => obj instanceof Spring) as Spring | undefined;
            if (spring &&
                this.vy > 0 &&
                spring.state === 0 &&
                (playerLeft + 15 < spring.x + spring.width) &&
                (playerRight - 15 > spring.x) &&
                (playerBottom > spring.y) &&
                (playerBottom < spring.y + spring.height)) {
                spring.state = 1;
                this.jumpHigh();
                return;
            }

            // Platform collision check
            if (this.vy > 0 && p.state === 0 &&
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
                    this.jump();
                    p.state = 1;
                } else if (p.flag === 1) return;
                else {
                    this.land();
                    this.jump();
                    this.dir = this.dir === "right" ? "right_land" : "left_land";
                    setTimeout(() => {
                        this.dir = this.dir === "right_land" ? "right" : "left";
                    }, 200);
                }
            }
        });

        if (this.isDead) {
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

        if (this.y > this.canvasHeight/2 && this.flag === 0) {
            this.y -= this.BASE_PLAYER_MOVE_SPEED * deltaTime;
            this.vy = 0;
        } else if (this.y < this.canvasHeight / 2) {
            this.flag = 1;
        } else if (this.y + this.height > this.canvasHeight) {
            this.store.onGameOver();
            this.isDead = "lol";
        }
    }
}
