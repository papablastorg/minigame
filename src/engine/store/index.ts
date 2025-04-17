import { Player } from '../objects/Player';
import { Base } from '../objects/Base';
import { Spring } from '../objects/Spring';
import { Platform } from '../objects/Platform';
import { PlatformBroken } from '../objects/PlatformBroken';

export class Store {
  public platforms: Platform[] = [];
  public player!: Player;
  public base!: Base;
  public platformBroken!: PlatformBroken;
  public spring!: Spring;
  public starsCollected: number = 0;
  public onScoreUpdate!: (score: number) => void;
  public onStarsUpdate!: (stars: number) => void;
  public onGameOver!: () => void;
}

export default new Store();