import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { profileService } from '../services/profileService';

export function useProfile(options = {}): UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: ['getProfile'],
    queryFn: async () => {
      const response = await profileService.me();
      // Return only the data part of the response
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
}
