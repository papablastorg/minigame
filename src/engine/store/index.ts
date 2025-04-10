import { Player } from '../objects/Player';
import { Base } from '../objects/Base';
import { Spring } from '../objects/Spring';
import { Platform } from '../objects/Platform';
import { PlatformBroken } from '../objects/PlatformBroken';
import { Star } from '../objects/Star';

export class Store {
  // public stars: Star[] = [];
  public platforms: Platform[] = [];
  public player!: Player;
  public base!: Base;
  public platformBroken!: PlatformBroken;
  public spring!: Spring;
  public star!: Star;
  public onScoreUpdate!: (score: number) => void;
  public onGameOver!: () => void;
}

export default new Store();