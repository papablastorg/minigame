import { BaseObject } from '../interfaces';
import StoreInstance, { Store } from '../store';
import pointImage from '/images/PAPApoint.png';
import { ImagePreloadService } from '../../services';

export class Star extends BaseObject {
    // Базовые константы анимации
    private readonly BASE_FADE_SPEED = 0.05; // Меняем на более подходящую скорость растворения
    private readonly BASE_FLOAT_SPEED = 3.5;
    private readonly BASE_FLOAT_AMPLITUDE = 4;

    public x: number;
    public y: number;
    public store: Store = StoreInstance;
    public state = 0;
    public width = 30;
    public height = 30;
    public image: HTMLImageElement;
    private opacity = 1;
    private floatSpeed: number;
    private floatAmplitude: number;
    private timeOffset: number = Math.random() * Math.PI * 2; // Случайная начальная фаза
    private animationTime: number = 0;

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;

        // Попытка получить изображение из кэша
        const cachedImage = ImagePreloadService.getImageFromCache('/images/PAPApoint.png');

        if (cachedImage) {
            // Если изображение в кэше, используем его
            this.image = cachedImage;
        } else {
            // Иначе загружаем обычным способом
            this.image = new Image();
            this.image.src = pointImage;
        }

        this.floatSpeed = this.BASE_FLOAT_SPEED;
        this.floatAmplitude = this.BASE_FLOAT_AMPLITUDE;
    }

    // Обновление состояния звезды с учетом времени
    update(deltaTime: number = 1) {
        if (this.state === 1) {
            // Ускоряем исчезновение для более быстрого эффекта
            this.opacity = Math.max(0, this.opacity - (this.BASE_FADE_SPEED * deltaTime));
        }
        
        this.animationTime += deltaTime * 0.1;
    }
    
    // Метод для получения текущей прозрачности звезды
    getOpacity(): number {
        return this.opacity;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;

        // Если звезда полностью прозрачна, не рисуем её
        if (this.opacity === 0 || this.state === 1 && this.opacity < 0.05) return;

        ctx.save();
        ctx.globalAlpha = this.opacity;

        let yOffset = Math.sin((Date.now() / 500) + this.timeOffset) * this.floatAmplitude;
        
        if (this.state === 1) {
            yOffset -= (1 - this.opacity) * 5;
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
            const y = this.y + (this.height - drawHeight) / 2 + yOffset;
            
            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                x, y,
                drawWidth, drawHeight
            );
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = i * 4 * Math.PI / 5 - Math.PI/2;
                const x1 = this.x + this.width/2 * Math.cos(angle);
                const y1 = this.y + this.width/2 * Math.sin(angle) + yOffset;
                if (i === 0) ctx.moveTo(x1, y1);
                else ctx.lineTo(x1, y1);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Добавляем пульсирующее мерцание независимо от состояния
            const pulseFactor = (Math.sin(Date.now() / 300) + 1) / 2;
            ctx.globalAlpha = pulseFactor * this.opacity;
            ctx.strokeStyle = '#FFFFFF';
            ctx.stroke();
        }
        
        ctx.restore();
    }
}