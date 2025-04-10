import platformImage1 from '/images/static_platform.png';
import platformImage2 from '/images/move_platform.png';
import platformImage3 from '/images/broken_platform.png';
import platformImage4 from '/images/flash_platform.png';

import StoreInstance, { Store } from '../store/index.ts';
import { Star } from './Star.ts';

export class Platform {
   public x: number;
    public y: number;
    public width = 100;
    public height = 25;
    public flag = 0;
    public state = 0;
    public type: number;
    public vx = 1;
    public moved = 0;
    public image: HTMLImageElement;
    public types: number[];
    public store: Store = StoreInstance;
    public color: string;
    public object: Star | null = null;

    constructor(position: number, width: number, score: number, level: number, platformColor: string, object?: Star) {
        // console.log('Platform position',position);
        this.x = Math.random() * (width - this.width);
        this.y = position;
        this.image = new Image();
        this.color = platformColor;

        if (object) {
            this.object = object; // Сохраняем объект, если он передан
        }

        // Select platform image based on level
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
        if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
        else if (score >= 2000 && score < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
        else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
        else if (score >= 500 && score < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
        else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
        else this.types = [1];

        this.type = this.types[Math.floor(Math.random() * this.types.length)];

        if (this.type === 3 && this.store.player.broken < 1) {
            this.store.player.broken++;
        } else if (this.type === 3 && this.store.player.broken >= 1) {
            this.type = 1;
            this.store.player.broken = 0;
        }

        // Select platform image based on type
        if (this.type === 1) { // Normal platform
            this.image.src = platformImage1;
        } else if (this.type === 2) { // Moving platform
            this.image.src = platformImage2;
        } else if (this.type === 3) { // Breakable platform
            this.image.src = platformImage3;
        } else if (this.type === 4) { // Vanishable platform
            this.image.src = platformImage4;
        }

        this.moved = 0;
        this.vx = 1;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;
        if ((this.type === 3 && this.flag === 1) || (this.type === 4 && this.state === 1)) {
            return;
        }

        console.log({x: this.x, y: this.y});

        console.log('this.object',this.object);

        if (this.object) {
            console.log('ctx',ctx);
            // console.log('object',this.object);
            this.object.draw(ctx); // Вызываем метод draw у объекта
        }

        // If image is loaded, draw it
        if (!this.image.complete) {          
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
            // Fallback rectangle if image is not loaded
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}
