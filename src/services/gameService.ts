import { instance } from '../constants';

export const gameService = {
  start: () => {
    return instance.post('/game/start', {})
  },
  end: (payload) => {
    return instance.post('game/end', payload)
  }
}
