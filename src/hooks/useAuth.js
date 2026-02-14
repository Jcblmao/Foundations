import { useState, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';

export function useAuth() {
  const [user, setUser] = useState(pb.authStore.record);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a valid session
    if (pb.authStore.isValid) {
      setUser(pb.authStore.record);
    }
    setLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(record);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
      return authData;
    } catch (err) {
      console.error('Google sign-in failed:', err);
      throw err;
    }
  }, []);

  const signOut = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOut
  };
}
