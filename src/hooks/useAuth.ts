import { useCallback, useContext } from 'react';
import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { ProfileContext } from '../context';
import { useProfile } from './useProfile';

interface AuthParams {
  telegramId: string | number;
  firstname: string;
  referral?: string;
}

export function useAuth() {
  const { setProfile } = useContext(ProfileContext);
  const { data: incomeProfile, isLoading, isPending } = useProfile();
  
  const { mutateAsync: makeProfile } = useMutation({
    mutationFn: profileService.make,
  });
  
  const verifyAuth = useCallback(async (params: AuthParams) => {
    if (!incomeProfile && !isLoading && !isPending) {
      const payload = {
        telegramId: params.telegramId,
        firstname: params.firstname,
        referral: params.referral || '',
      };
      const profile = await makeProfile(payload);
      setProfile(profile);
      return profile;
    }
    
    setProfile(incomeProfile);
    return incomeProfile;
  }, [incomeProfile, isLoading, isPending, makeProfile, setProfile]);
  
  return {
    verifyAuth,
    isLoading,
    isPending
  };
}