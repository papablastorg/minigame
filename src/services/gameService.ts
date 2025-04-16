import { instance } from '../constants';
import { GameEndPayload } from '../types/game';

export const gameService = {
  start: () => {
    return instance.post('/game/start', {})
  },
  end: (payload: GameEndPayload) => {
    return instance.post('game/end', payload)
  }
}
