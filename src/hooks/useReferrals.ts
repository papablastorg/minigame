import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { referralService } from '../services/referralService';

export function useReferrals(options = {}): UseQueryResult<any, Error> {
  return useQuery<any, Error>({
    queryKey: ['getReferrals'],
    queryFn: () => referralService.referrals(),
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: false,
    ...options,
  });
}
