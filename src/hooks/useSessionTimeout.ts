import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getSessionTimeoutMinutes,
  setSessionTimeoutMinutes,
  recordSessionActivity,
  getLastSessionActivity,
  setSessionExpiredFlag,
  WARNING_BEFORE_TIMEOUT_SECONDS,
  SESSION_LAST_ACTIVE_KEY
} from '../services/auth';

interface UseSessionTimeoutOptions {
  isActive: boolean;
  onSessionExpired: (reason: string) => void;
  customTimeoutMinutes?: number;
  warningThresholdSeconds?: number;
}

export interface UseSessionTimeoutReturn {
  showWarningModal: boolean;
  remainingSeconds: number;
  totalTimeoutMinutes: number;
  extendSession: () => void;
  logoutNow: () => void;
  updateTimeoutSetting: (minutes: number) => void;
}

export function useSessionTimeout({
  isActive,
  onSessionExpired,
  customTimeoutMinutes,
  warningThresholdSeconds = WARNING_BEFORE_TIMEOUT_SECONDS
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const [timeoutMinutes, setTimeoutMinutesState] = useState<number>(
    customTimeoutMinutes || getSessionTimeoutMinutes()
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    timeoutMinutes * 60
  );
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(getLastSessionActivity());
  const throttleTimerRef = useRef<number | null>(null);

  // Helper to record activity safely with throttling (max once every 3s)
  const handleUserActivity = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    // Throttle writing to localStorage & state to avoid performance drops
    if (now - lastActivityRef.current > 3000) {
      lastActivityRef.current = recordSessionActivity();
      
      // If warning modal is currently shown and remaining time is plenty, hide modal
      const totalSeconds = timeoutMinutes * 60;
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, totalSeconds - elapsedSeconds);

      if (remaining > warningThresholdSeconds) {
        setShowWarningModal(false);
      }
    }
  }, [isActive, timeoutMinutes, warningThresholdSeconds]);

  // Explicit session extension (triggered from modal "Extend Session" button or manual action)
  const extendSession = useCallback(() => {
    const now = recordSessionActivity();
    lastActivityRef.current = now;
    setShowWarningModal(false);
    setRemainingSeconds(timeoutMinutes * 60);
  }, [timeoutMinutes]);

  // Manual immediate logout
  const logoutNow = useCallback(() => {
    setShowWarningModal(false);
    setSessionExpiredFlag(false);
    onSessionExpired('user_logout');
  }, [onSessionExpired]);

  // Preference updater
  const updateTimeoutSetting = useCallback((minutes: number) => {
    if (minutes > 0) {
      setTimeoutMinutesState(minutes);
      setSessionTimeoutMinutes(minutes);
      extendSession();
    }
  }, [extendSession]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!isActive) return;

    // Record initial activity on hook activation
    lastActivityRef.current = recordSessionActivity();

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    const throttledListener = () => {
      if (throttleTimerRef.current !== null) return;
      throttleTimerRef.current = window.setTimeout(() => {
        throttleTimerRef.current = null;
        handleUserActivity();
      }, 1000);
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, throttledListener, { passive: true });
    });

    // Cross-tab synchronization via localStorage 'storage' event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_LAST_ACTIVE_KEY && e.newValue) {
        const remoteTime = parseInt(e.newValue, 10);
        if (!isNaN(remoteTime) && remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          // Hide modal if activity occurred in another tab
          const remaining = Math.max(
            0,
            timeoutMinutes * 60 - Math.floor((Date.now() - remoteTime) / 1000)
          );
          if (remaining > warningThresholdSeconds) {
            setShowWarningModal(false);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, throttledListener);
      });
      window.removeEventListener('storage', handleStorageChange);
      if (throttleTimerRef.current !== null) {
        clearTimeout(throttleTimerRef.current);
        throttleTimerRef.current = null;
      }
    };
  }, [isActive, handleUserActivity, timeoutMinutes, warningThresholdSeconds]);

  // Core countdown & timeout check interval (runs every 1 second)
  useEffect(() => {
    if (!isActive) {
      setShowWarningModal(false);
      return;
    }

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const lastActive = getLastSessionActivity();
      lastActivityRef.current = Math.max(lastActivityRef.current, lastActive);

      const totalDurationSeconds = timeoutMinutes * 60;
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const secondsLeft = Math.max(0, totalDurationSeconds - elapsedSeconds);

      setRemainingSeconds(secondsLeft);

      if (secondsLeft <= 0) {
        // Session fully expired
        clearInterval(intervalId);
        setShowWarningModal(false);
        setSessionExpiredFlag(true, 'Your session has expired due to inactivity. Please sign in again.');
        onSessionExpired('inactivity');
      } else if (secondsLeft <= warningThresholdSeconds) {
        // Warning threshold reached
        setShowWarningModal(true);
      } else {
        if (showWarningModal) {
          setShowWarningModal(false);
        }
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isActive, timeoutMinutes, warningThresholdSeconds, showWarningModal, onSessionExpired]);

  return {
    showWarningModal,
    remainingSeconds,
    totalTimeoutMinutes: timeoutMinutes,
    extendSession,
    logoutNow,
    updateTimeoutSetting
  };
}
