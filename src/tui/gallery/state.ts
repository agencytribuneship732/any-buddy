import type { Bones, ProfileData } from '@/types.js';
import { ORIGINAL_SALT } from '@/constants.js';
import { roll } from '@/generation/index.js';
import { getProfiles, getActiveProfile } from '@/config/index.js';
import { isNodeRuntime } from '@/patcher/salt-ops.js';

export interface GalleryEntry {
  name: string;
  isDefault: boolean;
  isActive: boolean;
  bones: Bones;
  profile: ProfileData | null;
}

export interface GalleryState {
  entries: GalleryEntry[];
  selectedIndex: number;
}

export function buildGalleryEntries(userId: string, binaryPath: string): GalleryEntry[] {
  const useNodeHash = isNodeRuntime(binaryPath);
  const profiles = getProfiles();
  const active = getActiveProfile();

  const defaultBones = roll(userId, ORIGINAL_SALT, { useNodeHash }).bones;
  const defaultEntry: GalleryEntry = {
    name: 'Original',
    isDefault: true,
    isActive: active === null,
    bones: defaultBones,
    profile: null,
  };

  const profileEntries: GalleryEntry[] = Object.entries(profiles).map(([name, profile]) => ({
    name,
    isDefault: false,
    isActive: name === active,
    bones: roll(userId, profile.salt, { useNodeHash }).bones,
    profile,
  }));

  return [defaultEntry, ...profileEntries];
}

export function selectedEntry(state: GalleryState): GalleryEntry {
  return state.entries[state.selectedIndex];
}

export function activeEntryIndex(entries: GalleryEntry[]): number {
  const idx = entries.findIndex((e) => e.isActive);
  return idx >= 0 ? idx : 0;
}
