import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';
import springImage from '/images/jump_point.png';
import { ImagePreloadService } from '../../services';

export class Spring extends BaseObject {
    public x: number;
    public y: number;
    public width = 50;
    public height = 46;
    public state = 0;
    public store: Store = StoreInstance;
    public image: HTMLImageElement;
    private animationTimer: number | null = null;
    private initialPositionSet = false; // флаг для отслеживания инициализации позиции

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;

        // Попытка получить изображение из кэша
        const cachedImage = ImagePreloadService.getImageFromCache('/images/jump_point.png');

        if (cachedImage) {
            // Если изображение в кэше, используем его
            this.image = cachedImage;
        } else {
            // Иначе загружаем обычным способом
            this.image = new Image();
            this.image.src = springImage;
        }
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;
        
        // Не рисовать пружину, если её позиция ещё не инициализирована правильно
        if (!this.initialPositionSet && (this.x === 0 && this.y === 0)) {
            return;
        }
        
        // Если позиция не (0,0), считаем что пружина правильно размещена
        if (this.x !== 0 || this.y !== 0) {
            this.initialPositionSet = true;
        }

        if (this.image.complete) {
            const cropY = 0;       
            const cropHeight = this.image.height;    
            const cropX = 0;         
            const cropWidth = this.image.width; 

            const scale = Math.min(this.width / cropWidth, this.height / cropHeight);
            const drawWidth = cropWidth * scale;
            const drawHeight = cropHeight * scale;
            const x = this.x + (this.width - drawWidth) / 2;
            const y = this.y + (this.height - drawHeight) / 2;

            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                x, y,
                drawWidth, drawHeight
            );
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    // Принимаем deltaTime для совместимости, но не используем его здесь,
    // так как пружина использует setTimeout для анимации
    update(deltaTime: number = 1) {
        // If spring is in compressed state, schedule reset
        if (this.state === 1 && !this.animationTimer) {
            this.animationTimer = window.setTimeout(() => {
                this.state = 0;
                this.animationTimer = null;
            }, 200);
        }
    }

    // Cleanup timer when spring is removed/reset
    cleanup() {
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
    }
}