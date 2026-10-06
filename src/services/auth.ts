import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbService } from './db';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'employee' | 'team_leader' | 'trainer' | 'admin';

export interface UserSessionData {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
  department?: string;
}

interface AuthResult {
  success: boolean;
  data?: UserSessionData;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

const USER_ROLES: UserRole[] = ['employee', 'team_leader', 'trainer', 'admin'];

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

async function getSessionDataFromSupabaseUser(user: User): Promise<UserSessionData> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, email, role, department')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('Failed to load user profile; falling back to auth metadata:', error);
  }

  const metadata = user.user_metadata || {};
  const profileRole = profile?.role;
  const metadataRole = metadata.role;
  const role = isUserRole(profileRole)
    ? profileRole
    : isUserRole(metadataRole)
      ? metadataRole
      : 'employee';

  return {
    id: user.id,
    name: profile?.full_name || metadata.full_name || user.email?.split('@')[0] || 'User',
    role,
    email: profile?.email || user.email || '',
    department: profile?.department || metadata.department
  };
}

async function upsertUserProfile(
  userId: string,
  email: string,
  fullName: string,
  department: string,
  role: UserRole
): Promise<string | null> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: fullName,
      email,
      role,
      department
    }, { onConflict: 'id' });

  return error?.message || null;
}

export const DEFAULT_INACTIVITY_TIMEOUT_MINUTES = 15;
export const WARNING_BEFORE_TIMEOUT_SECONDS = 120;
export const SESSION_LAST_ACTIVE_KEY = 'koruna_session_last_active';
export const SESSION_TIMEOUT_PREF_KEY = 'koruna_session_timeout_pref';
export const SESSION_EXPIRED_FLAG_KEY = 'koruna_session_expired_notice';

export function getSessionTimeoutMinutes(): number {
  try {
    const saved = localStorage.getItem(SESSION_TIMEOUT_PREF_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return DEFAULT_INACTIVITY_TIMEOUT_MINUTES;
}

export function setSessionTimeoutMinutes(minutes: number): void {
  try {
    localStorage.setItem(SESSION_TIMEOUT_PREF_KEY, minutes.toString());
  } catch (e) {
    // Ignore storage errors
  }
}

export function recordSessionActivity(): number {
  const now = Date.now();
  try {
    localStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
  } catch (e) {
    // Ignore storage errors
  }
  return now;
}

export function getLastSessionActivity(): number {
  try {
    const saved = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return Date.now();
}

export function setSessionExpiredFlag(expired: boolean, reason?: string): void {
  try {
    if (expired) {
      localStorage.setItem(SESSION_EXPIRED_FLAG_KEY, reason || 'Your session expired due to inactivity. Please sign in again.');
    } else {
      localStorage.removeItem(SESSION_EXPIRED_FLAG_KEY);
    }
  } catch (e) {
    // Ignore storage errors
  }
}

export function getSessionExpiredFlag(): string | null {
  try {
    return localStorage.getItem(SESSION_EXPIRED_FLAG_KEY);
  } catch (e) {
    return null;
  }
}


/**
 * Sign up a new user with Supabase Auth & Role
 */
export async function signUpUser(
  email: string,
  pass: string,
  fullName: string,
  department: string,
  role: UserRole = 'employee'
): Promise<AuthResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedFullName = fullName.trim();

  // Check if email already exists
  try {
    const users = await dbService.getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      return { success: false, error: 'This email address is already registered.' };
    }
  } catch (err) {
    console.error('Failed to query users directory for email duplicate check:', err);
  }

  if (!isSupabaseConfigured()) {
    // Demo mode fallback
    const newUser = {
      id: `u-${Date.now()}`,
      name: normalizedFullName,
      role: role,
      email: normalizedEmail,
      department,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await dbService.saveUser(newUser);

    return {
      success: true,
      data: {
        id: newUser.id,
        name: normalizedFullName,
        role: role,
        email: normalizedEmail,
        department
      }
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: pass,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: normalizedFullName,
        department: department,
        role: role
      }
    }
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Save profile mapping details in local storage for consistency
  if (data.user?.id) {
    if (data.session) {
      const profileError = await upsertUserProfile(data.user.id, normalizedEmail, normalizedFullName, department, role);
      if (profileError) {
        return {
          success: false,
          error: `Account was created, but the profile could not be saved: ${profileError}`
        };
      }
    }

    try {
      await dbService.saveUser({
        id: data.user.id,
        name: normalizedFullName,
        role: role,
        email: normalizedEmail,
        department: department,
        createdAt: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to save user map to local storage:', err);
    }
  }

  if (!data.session) {
    return {
      success: true,
      requiresEmailConfirmation: true
    };
  }

  return {
    success: true,
    data: {
      id: data.user?.id,
      name: normalizedFullName,
      role: role,
      email: normalizedEmail,
      department
    }
  };
}

const DEMO_PRESETS: Record<string, { name: string; role: UserRole; department: string }> = {
  'alex.rivera@koruna.com': { name: 'Alex Rivera', role: 'employee', department: 'Lending' },
  'sarah.chen@koruna.com': { name: 'Sarah Chen', role: 'team_leader', department: 'Operations' },
  'dr.vance@koruna.com': { name: 'Dr. Marcus Vance', role: 'trainer', department: 'Content Development' },
  'admin.learning@koruna.com': { name: 'Global Admin', role: 'admin', department: 'IT & Administration' }
};

/**
 * Sign in existing user with Email & Password
 */
export async function signInUser(
  email: string,
  pass: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    // Demo mode fallback
    const emailLower = email.toLowerCase();
    const preset = DEMO_PRESETS[emailLower];
    const role: UserRole = preset ? preset.role : (emailLower.includes('admin') ? 'admin' : 'employee');
    return {
      success: true,
      data: {
        id: emailLower,
        name: preset ? preset.name : (email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Jessica Taylor'),
        role,
        email,
        department: preset ? preset.department : 'IT & Administration'
      }
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    const userSession = await getSessionDataFromSupabaseUser(data.user);
    return {
      success: true,
      data: userSession
    };
  }

  return {
    success: true,
    data: {
      name: email.split('@')[0],
      role: 'employee',
      email
    }
  };
}

/**
 * Sign in with Single Sign-On (SSO / OAuth)
 */
export async function signInWithSSO(
  provider: 'google' | 'azure' = 'google',
  metadata?: { role?: UserRole; department?: string; fullName?: string; email?: string }
): Promise<{ success: boolean; data?: UserSessionData; error?: string }> {
  if (!isSupabaseConfigured()) {
    const name = metadata?.fullName || (provider === 'google' ? 'Google Learner' : 'Jordan Taylor (SSO)');
    const role = metadata?.role || 'employee';
    const email = metadata?.email || (provider === 'google' ? 'google.user@koruna.com' : 'jordan.taylor@koruna.com');
    const department = metadata?.department || 'Software Engineering';

    return {
      success: true,
      data: {
        name,
        role,
        email,
        department
      }
    };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: provider === 'google' ? 'google' : 'azure',
    options: {
      redirectTo: window.location.origin,
      data: metadata ? {
        full_name: metadata.fullName,
        role: metadata.role,
        department: metadata.department
      } : undefined
    } as any
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}

/**
 * Get active Supabase session
 */
export async function getCurrentUserSession(): Promise<UserSessionData | null> {
  if (!isSupabaseConfigured()) return null;

  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  return getSessionDataFromSupabaseUser(data.session.user);
}

/**
 * Subscribe to authentication state changes (useful for OAuth redirects)
 */
export function subscribeToAuthChanges(callback: (user: UserSessionData | null) => void): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback(await getSessionDataFromSupabaseUser(session.user));
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
