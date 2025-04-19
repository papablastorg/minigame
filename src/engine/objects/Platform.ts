import StoreInstance, { Store } from '../store/index.ts';
import { BaseObject, ObjectSpacing, PlatformObjectSpacingConfig } from '../interfaces.ts';
import { Spring } from './Spring.ts';
import { Star } from './Star.ts';
import { ImagePreloadService } from '../../services';

export class Platform {
    // Базовые константы скорости
    private readonly BASE_MOVE_SPEED = 1;

    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public flag = 0;
    public state = 0;
    public type: number;
    public vx = 1;    
    public moved = 0;
    public image: HTMLImageElement;
    public types: number[] = [];
    public store: Store = StoreInstance;
    public attachedObjects: BaseObject[] = [];
    private objectSpacingConfig: PlatformObjectSpacingConfig = { default: { verticalSpacing: 0 } };
    private isImageLoaded: boolean = false;
    private lastPosition = { x: 0, y: 0 }; // Для отслеживания изменений позиции
    private checkedPlayerBroken: boolean = false; // Для безопасной проверки состояния игрока

    constructor(position: number, canvasWidth: number, score: number, level: number, objects?: BaseObject[]) {
        // Устанавливаем размеры платформы как процент от размеров канваса
        this.width = Math.min(Math.max(canvasWidth * 0.2, 60), 120); // 20% от ширины канваса, мин 60px, макс 120px
        this.height = Math.min(Math.max(window.innerHeight * 0.03, 15), 30); // 3% от высоты канваса, мин 15px, макс 30px
        
        this.x = Math.random() * (canvasWidth - this.width);
        this.y = position;
        this.lastPosition = { x: this.x, y: this.y };
        
        if (objects) this.attachedObjects = objects;
        this.setObjectSpacing("spring", { verticalSpacing: -8 });
        this.setObjectSpacing("star", { verticalSpacing: 0 });
        
        let imagePath = '';
        if (level === 1) imagePath = '/images/static_platform.png';
        else if (level === 2) imagePath = '/images/move_platform.png';
        else imagePath = '/images/broken_platform.png';

        const safeScore = score || 0;

        if (safeScore >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
        else if (safeScore >= 2000 && safeScore < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
        else if (safeScore >= 1000 && safeScore < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
        else if (safeScore >= 500 && safeScore < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
        else if (safeScore >= 100 && safeScore < 500) this.types = [1, 1, 1, 1, 2, 2];
        else this.types = [1];

        // Безопасное определение случайного типа платформы
        this.type = this.types[Math.floor(Math.random() * this.types.length)];
        
        // Мы откладываем проверку broken до первого обновления
        // Это предотвратит ошибки при рестарте на iOS/MacOS
        
        // Определение пути к изображению на основе типа платформы
        if (this.type === 1) imagePath = '/images/static_platform.png';
        else if (this.type === 2) imagePath = '/images/move_platform.png';
        else if (this.type === 3) imagePath = '/images/broken_platform.png';
        else if (this.type === 4) imagePath = '/images/flash_platform.png';
        
        // Попытка получить изображение из кэша
        const cachedImage = ImagePreloadService.getImageFromCache(imagePath);
        
        if (cachedImage) {
            // Если изображение в кэше, используем его
            this.image = cachedImage;
            this.isImageLoaded = true;
        } else {
            // Если нет в кэше, создаем новый экземпляр и загружаем
            this.image = new Image();
            this.image.onload = () => {
                this.isImageLoaded = true;
            };
            this.image.src = ImagePreloadService.normalizePath(imagePath);
        }
        
        this.moved = 0;
        this.vx = this.BASE_MOVE_SPEED;
        
        // Оптимизация для мобильных устройств: предварительное обновление позиций объектов
        setTimeout(() => {
            this.updateAttachedObjectsPosition();
        }, 0);
    }

    public attachObject(object: BaseObject) {
        this.attachedObjects.push(object);
        this.updateAttachedObjectsPosition();
    }

    public detachObject(object: BaseObject) {
        const index = this.attachedObjects.indexOf(object);
        if (index > -1) {
            this.attachedObjects.splice(index, 1);
        }
    }

    public setObjectSpacing(objectType: string, spacing: ObjectSpacing) {
        this.objectSpacingConfig[objectType] = spacing;
    }

    draw(ctx: CanvasRenderingContext2D | null) {
        if (!ctx) return;
        if ((this.type === 3 && this.flag === 1) || (this.type === 4 && this.state === 1)) return;

        // Улучшенная отрисовка платформ для мобильных устройств
        if (this.isImageLoaded) {
            const cropY = 8;
            const cropHeight = 110;
            const cropX = 3;
            const cropWidth = 295;
            
            try {
                ctx.drawImage(
                    this.image,
                    cropX, cropY,
                    cropWidth, cropHeight,
                    this.x, this.y,
                    this.width, this.height
                );
            } catch (e) {
                // Фоллбэк для ситуаций, когда изображение не может быть отрисовано
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else {
            // Фоллбэк, пока изображение загружается
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Оптимизированная отрисовка прикрепленных объектов
        this.attachedObjects.forEach(object => {
            if (object.name === 'star' || (object.name === 'spring' && (this.type === 1 || this.type === 2))) {
                object.draw(ctx);
            }
        });
    }

    private updateAttachedObjectsPosition() {
        this.attachedObjects.forEach(object => {
            if (this.isPositionable(object)) {
                const objectType = object.name;
                const spacing = this.objectSpacingConfig[objectType] || this.objectSpacingConfig.default;
                object.x = this.x + (this.width / 2) - (object.width / 2);
                object.y = this.y - object.height - spacing.verticalSpacing;             
                if (object instanceof Spring) object.state = 0;
            }
        });
    }

    private cleanupAttachedObjects() {
        // Оптимизация для убирания звезд с низкой прозрачностью
        for (let i = this.attachedObjects.length - 1; i >= 0; i--) {
            const obj = this.attachedObjects[i];
            // Если это звезда, которая была собрана и уже почти прозрачная - удаляем её
            if (obj instanceof Star && obj.state === 1 && obj.getOpacity() < 0.05) {
                this.attachedObjects.splice(i, 1);
            }
            
            // Удаляем объекты, если платформа вышла за границы экрана
            if (this.y > window.innerHeight) {
                if (obj instanceof Spring) obj.cleanup();
                this.attachedObjects.splice(i, 1);
            }
        }
    }

    private isPositionable(object: BaseObject): object is BaseObject & {
        x: number;
        y: number;
        width: number;
        height: number;
    } {
        return (
            'x' in object &&
            'y' in object &&
            'width' in object &&
            'height' in object &&
            typeof object.x === 'number' &&
            typeof object.y === 'number' &&
            typeof object.width === 'number' &&
            typeof object.height === 'number'
        );
    }

    update(deltaTime: number = 1) {
        // Ограничиваем deltaTime для предотвращения больших скачков
        const limitedDeltaTime = Math.min(deltaTime, 1.5);
        
        // Проверяем состояние игрока для платформ типа 3 только при обновлении
        // Этот код перемещен из конструктора для более безопасной работы при рестарте
        if (this.type === 3 && !this.checkedPlayerBroken) {
            this.checkedPlayerBroken = true;
            
            try {
                if (this.store.player && typeof this.store.player.broken === 'number') {
                    // Если у игрока уже достаточно сломанных платформ, меняем тип
                    if (this.store.player.broken >= 1) {
                        this.type = 1;
                        this.store.player.broken = 0;
                    } else {
                        // Иначе увеличиваем счетчик сломанных платформ
                        this.store.player.broken++;
                    }
                }
            } catch (e) {
                // Безопасно обработаем ошибки при проверке свойств игрока
                console.warn('Error checking player broken state:', e);
                this.type = 1; // Безопасно устанавливаем тип платформы
            }
        }
        
        if (this.type === 2) {
            if (this.x < 0 || this.x + this.width > window.innerWidth) this.vx *= -1;
            this.x += this.vx * limitedDeltaTime;
        }

        // Обновляем все прикрепленные объекты только если платформа изменила позицию
        const positionChanged = 
            Math.abs(this.x - this.lastPosition.x) > 0.1 || 
            Math.abs(this.y - this.lastPosition.y) > 0.1;

        if (positionChanged) {
            this.updateAttachedObjectsPosition();
            this.lastPosition = { x: this.x, y: this.y };
        }

        // Очищаем список от ненужных объектов для экономии памяти
        this.cleanupAttachedObjects();

        // Обновляем все прикрепленные объекты
        this.attachedObjects.forEach((obj) => {
            // Обновляем каждый объект с учетом limitedDeltaTime
            obj.update(limitedDeltaTime);
        });
    }
}
