import { instance } from '../constants'

export const profileService = {
  me: () => {
    return instance.get('/profile')
  },
  make: (payload) => {
    return instance.post('/profile', payload);
  }
}
