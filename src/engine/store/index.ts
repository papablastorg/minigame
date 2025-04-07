import { Player } from '../objects/Player';
import { Base } from '../objects/Base';
import { Platform } from '../objects/Platform';
import { PlatformBrokenSubstitute } from '../objects/PlatformBrokenSubstitute';

export class Store {
  public platforms: Platform[] = [];
  public player: Player;
  public base: Base;
  public platformBrokenSubstitute: PlatformBrokenSubstitute;
  public onScoreUpdate: (score: number) => void;
  public onGameOver: () => void;
}

export default new Store();
