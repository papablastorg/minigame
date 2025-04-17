import { createContext, ReactNode, useMemo, useState } from 'react';

export interface ProfileContextProps {
  profile: Entities.Profile | undefined,
  setProfile: (_p: Entities.Profile) => void,
}
export const ProfileContext = createContext<ProfileContextProps>({
  profile: undefined,
  setProfile: (_p: Entities.Profile) => null,
})

export function ProfileContextProvider({ children }: { children?: ReactNode, }) {
  const [profile, setProfile] = useState();

  const value = useMemo(() =>
    ({ profile, setProfile }),[profile])

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
