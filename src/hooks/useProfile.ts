import { useQuery } from '@tanstack/react-query';

import { profileService } from '../services';

export function useProfile() {
  return useQuery(({
    queryKey: ['profile'],
    queryFn: () => profileService.me().then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  }) )
}
