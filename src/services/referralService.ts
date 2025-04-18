import { instance } from '../constants'

export const referralService = {
  referrals: () => {
    return instance.get('/referral/top')
  },
}