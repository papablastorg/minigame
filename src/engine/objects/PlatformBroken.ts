import platform_broken from '/images/broken_platform.png';
import { BaseObject } from '../interfaces';
import { ImagePreloadService } from '../../services';

export class PlatformBroken extends BaseObject {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public appearance = false;
    public image: HTMLImageElement;

    constructor(name: string) {
        super(name);
        this.x = 0;
        this.y = 0;
        this.width = Math.min(Math.max(window.innerWidth * 0.2, 60), 120);
        this.height = Math.min(Math.max(window.innerHeight * 0.03, 15), 30);
        
        // Попытка получить изображение из кэша
        const cachedImage = ImagePreloadService.getImageFromCache('/images/broken_platform.png');
        
        if (cachedImage) {
            // Если изображение в кэше, используем его
            this.image = cachedImage;
        } else {
            // Иначе загружаем обычным способом
            this.image = new Image();
            this.image.src = platform_broken;
        }
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx || !this.appearance) return;

        if (this.image.complete) {
            const cropY = 8;       
            const cropHeight = 110;    
            const cropX = 3;         
            const cropWidth = 295; 

            ctx.drawImage(
                this.image,
                cropX, cropY,
                cropWidth, cropHeight,
                this.x, this.y,
                this.width, this.height
            );
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
