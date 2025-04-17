import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { profileService } from '../services/profileService';

export function useProfile(options = {}): UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: ['getProfile'],
    queryFn: () => profileService.me(),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
}
