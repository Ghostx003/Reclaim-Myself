import { db } from '../database';
import { UserPreferences, UserProfile } from '../../types';
import { DEFAULT_USER_PREFERENCES } from '../../constants';

const DEFAULT_USER_ID = 'default_user';

export const userRepository = {
  async getProfile(): Promise<UserProfile | null> {
    const user = await db.users.get(DEFAULT_USER_ID);
    return user || null;
  },

  async saveProfile(name: string, preferences?: Partial<UserPreferences>): Promise<UserProfile> {
    const existing = await this.getProfile();
    const now = new Date().toISOString();

    const profile: UserProfile = {
      id: DEFAULT_USER_ID,
      name: name.trim(),
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      preferences: {
        ...DEFAULT_USER_PREFERENCES,
        ...(existing ? existing.preferences : {}),
        ...(preferences || {}),
      },
    };

    await db.users.put(profile);
    return profile;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserProfile | null> {
    const profile = await this.getProfile();
    if (!profile) return null;

    profile.preferences = {
      ...profile.preferences,
      ...preferences,
    };
    profile.updatedAt = new Date().toISOString();

    await db.users.put(profile);
    return profile;
  },

  async clearUser(): Promise<void> {
    await db.users.delete(DEFAULT_USER_ID);
  },
};
