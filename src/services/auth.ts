import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dbService } from './db';

export type UserRole = 'employee' | 'team_leader' | 'trainer' | 'admin';

export interface UserSessionData {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
  department?: string;
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
): Promise<{ success: boolean; data?: UserSessionData; error?: string }> {
  // Check if email already exists
  try {
    const users = await dbService.getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
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
      name: fullName,
      role: role,
      email: email,
      department,
      createdAt: new Date().toISOString().split('T')[0]
    };
    await dbService.saveUser(newUser);

    return {
      success: true,
      data: {
        id: newUser.id,
        name: fullName,
        role: role,
        email: email,
        department
      }
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
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
    try {
      await dbService.saveUser({
        id: data.user.id,
        name: fullName,
        role: role,
        email: email,
        department: department,
        createdAt: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to save user map to local storage:', err);
    }
  }

  return {
    success: true,
    data: {
      id: data.user?.id,
      name: fullName,
      role: role,
      email,
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
): Promise<{ success: boolean; data?: UserSessionData; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Demo mode fallback
    const emailLower = email.toLowerCase();
    const preset = DEMO_PRESETS[emailLower];
    return {
      success: true,
      data: {
        name: preset ? preset.name : (email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Jessica Taylor'),
        role: preset ? preset.role : 'employee',
        email,
        department: preset ? preset.department : 'Lending'
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

  // Fetch profile details
  let name = email.split('@')[0];
  let role: UserRole = 'employee';

  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      name = profile.full_name || name;
      role = (profile.role as UserRole) || role;
    }
  }

  return {
    success: true,
    data: {
      id: data.user?.id,
      name,
      role,
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

  const user = data.session.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    name: profile?.full_name || user.email?.split('@')[0] || 'User',
    role: (profile?.role as UserRole) || 'employee',
    email: user.email || '',
    department: profile?.department
  };
}

/**
 * Subscribe to authentication state changes (useful for OAuth redirects)
 */
export function subscribeToAuthChanges(callback: (user: UserSessionData | null) => void): () => void {
  if (!isSupabaseConfigured()) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      callback({
        id: user.id,
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        role: (profile?.role as UserRole) || 'employee',
        email: user.email || '',
        department: profile?.department
      });
    } else {
      callback(null);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}
