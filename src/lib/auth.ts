import { useState, useEffect } from 'react';
import { User } from './types';

export const DEFAULT_MOCK_USER: User = {
  id: 'usr_8829104',
  name: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'user',
  followedPairs: ['GOLDM / GOLDPETAL', 'GOLDM / GOLDTEN'],
  alertChannel: 'email',
  theme: 'dark',
  onboardingDone: true,
  createdAt: '2026-04-12T10:00:00Z',
  textSize: 'normal',
  quietHoursStart: '23:30',
  quietHoursEnd: '08:00',
  minNetEdgeBps: 3.5,
  minLiquidityScore: 65
};

export const DEFAULT_ADMIN_USER: User = {
  id: 'usr_admin_001',
  name: 'Devika Sharma (Chief Risk Officer)',
  email: 'risk-desk@goldlens.internal',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  followedPairs: ['GOLDM / GOLDPETAL', 'GOLDM / GOLDTEN', 'GOLDTEN / GOLDGUINEA', 'GOLDGUINEA / GOLDPETAL', 'GOLDM / GOLDGUINEA'],
  alertChannel: 'email',
  theme: 'dark',
  onboardingDone: true,
  createdAt: '2026-01-01T00:00:00Z',
  textSize: 'normal',
  minNetEdgeBps: 2.0,
  minLiquidityScore: 50
};

type AuthListener = (user: User | null) => void;
const listeners = new Set<AuthListener>();

// Initialize user state from localStorage if available, otherwise default to Signed In user
const STORAGE_KEY = 'goldlens_auth_state_v1';

function loadInitialUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'null') return null;
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_MOCK_USER;
}

let currentUser: User | null = loadInitialUser();

function notify() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener(currentUser));
}

export function getUser(): User | null {
  return currentUser;
}

export async function signOut(): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  currentUser = null;
  notify();
}

export function setDemoMode(mode: 'signed_out' | 'user' | 'admin'): void {
  if (mode === 'signed_out') {
    currentUser = null;
  } else if (mode === 'admin') {
    currentUser = { ...DEFAULT_ADMIN_USER };
  } else {
    currentUser = { ...DEFAULT_MOCK_USER };
  }
  notify();
}

export function updateUser(partial: Partial<User>): User | null {
  if (!currentUser) return null;
  currentUser = {
    ...currentUser,
    ...partial
  };
  notify();
  return currentUser;
}

export function toggleFollowPair(pair: string): boolean {
  if (!currentUser) return false;
  const current = currentUser.followedPairs || [];
  const exists = current.includes(pair);
  const updated = exists ? current.filter((p) => p !== pair) : [...current, pair];
  updateUser({ followedPairs: updated });
  return !exists;
}

export function useUser(): {
  user: User | null;
  role: 'guest' | 'user' | 'admin';
  signOut: () => Promise<void>;
  updateUser: (partial: Partial<User>) => User | null;
  setDemoMode: (mode: 'signed_out' | 'user' | 'admin') => void;
  toggleFollowPair: (pair: string) => boolean;
} {
  const [user, setUser] = useState<User | null>(currentUser);

  useEffect(() => {
    const handler: AuthListener = (updatedUser) => {
      setUser(updatedUser);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const role = !user ? 'guest' : user.role;

  return {
    user,
    role,
    signOut,
    updateUser,
    setDemoMode,
    toggleFollowPair
  };
}
