import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useLeaderboard(options = {}): UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: ['getLeaderboard'],
    queryFn: async () => {
      const response = await profileService.leaderboard();
      return response.data;
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
}