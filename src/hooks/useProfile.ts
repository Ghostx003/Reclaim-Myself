import { useLiveQuery } from 'dexie-react-hooks';
import { userRepository } from '../db/repositories/userRepository';
import { UserPreferences, UserProfile } from '../types';

export function useProfile() {
  const profile = useLiveQuery(async () => {
    return await userRepository.getProfile();
  });

  const saveName = async (name: string): Promise<UserProfile> => {
    return await userRepository.saveProfile(name);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>): Promise<UserProfile | null> => {
    return await userRepository.updatePreferences(prefs);
  };

  const clearProfile = async (): Promise<void> => {
    await userRepository.clearUser();
  };

  return {
    profile: profile ?? null,
    isLoading: profile === undefined,
    isOnboarded: Boolean(profile && profile.name && profile.name.trim().length > 0),
    saveName,
    updatePreferences,
    clearProfile,
  };
}
