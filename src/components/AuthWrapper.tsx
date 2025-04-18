import { ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { WebAppUser } from '@twa-dev/types';
import WebApp from '@twa-dev/sdk';
import { ProfileContext } from '../context';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../common/Loader';

interface AuthWrapperProps {
  children: ReactNode;
}

// Mock user for development environment
const mockUser = {
  telegramId: '11112222',
  firstname: 'Tilda',
  referral: '',
};

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { verifyAuth, isLoading, isPending } = useAuth();
  const { profile } = useContext(ProfileContext);
  const [authInProgress, setAuthInProgress] = useState(true);
  
  const authenticateUser = useCallback(async () => {
    try {
      // Get user data from Telegram WebApp or use mock in development
      const telegram = WebApp.initDataUnsafe.user as WebAppUser;
      
      await verifyAuth({
        telegramId: telegram?.id || mockUser.telegramId,
        firstname: telegram?.first_name || mockUser.firstname,
        referral: mockUser.referral,
      });
    } finally {
      setAuthInProgress(false);
    }
  }, [verifyAuth]);
  
  // Perform authentication on component mount
  useEffect(() => {
    void authenticateUser();
  }, [authenticateUser]);

  // Show loading state while authentication is in progress
  if ((isLoading || isPending || authInProgress) && !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader />
      </div>
    );
  }

  // Render children regardless of auth status - actual components will decide what to show
  return <>{children}</>;
};