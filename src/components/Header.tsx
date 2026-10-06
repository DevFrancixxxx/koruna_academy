import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sliders,
  Award,
  LogOut,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Search,
  Shield,
  User
} from 'lucide-react';
import type { UserSessionData, UserRole } from '../services/auth';
import type { Notification, Course } from '../services/db';

export interface HeaderProps {
  userSession: UserSessionData;
  userInitials: string;
  notifications: Notification[];
  onMarkAllNotificationsAsRead: () => void;
  onNotificationClick: (notif: Notification) => void;
  onDeleteNotification: (e: React.MouseEvent, id: string) => void;
  onTabChange: (tab: string) => void;
  onSignOutClick: () => void;
  formatNotificationTime?: (dateStr: string) => string;
  isImmersivePlayer?: boolean;
  studyingCourse?: Course | null;
  activeLessonIdx?: number;
  onBackFromStudy?: () => void;
  showNotifications?: boolean;
  setShowNotifications?: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  activeTab?: string;
  setActiveInnerTab?: (tab: string) => void;
}

const roleDisplayNames: Record<UserRole, string> = {
  employee: 'Employee',
  team_leader: 'Team Leader',
  trainer: 'Trainer',
  admin: 'Administrator'
};

const defaultFormatNotificationTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return '';
  }
};

// Shared tokens so the header carries a consistent visual identity
// on its own, independent of whatever global stylesheet is loaded.
const brand = '#a31555';

export interface HeaderActionsProps {
  userSession: UserSessionData;
  userInitials: string;
  notifications: Notification[];
  onMarkAllNotificationsAsRead: () => void;
  onNotificationClick: (notif: Notification) => void;
  onDeleteNotification: (e: React.MouseEvent, id: string) => void;
  onTabChange: (tab: string) => void;
  onSignOutClick: () => void;
  formatNotificationTime?: (dateStr: string) => string;
  showNotifications?: boolean;
  setShowNotifications?: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab?: string;
  setActiveInnerTab?: (tab: string) => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  userSession,
  userInitials,
  notifications,
  onMarkAllNotificationsAsRead,
  onNotificationClick,
  onDeleteNotification,
  onTabChange,
  onSignOutClick,
  formatNotificationTime = defaultFormatNotificationTime,
  showNotifications: propShowNotifications,
  setShowNotifications: propSetShowNotifications,
  activeTab,
  setActiveInnerTab
}) => {
  const [internalShowNotifications, setInternalShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  const isNotificationsControlled = propShowNotifications !== undefined && propSetShowNotifications !== undefined;
  const showNotifications = isNotificationsControlled ? propShowNotifications : internalShowNotifications;
  const setShowNotifications = isNotificationsControlled ? propSetShowNotifications : setInternalShowNotifications;

  const notificationsMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const handleNotificationsToggle = () => {
    const nextShowNotifications = !showNotifications;
    setShowNotifications(nextShowNotifications);

    if (nextShowNotifications && unreadCount > 0) {
      void onMarkAllNotificationsAsRead();
    }
  };

  // Close dropdowns when clicking outside, or on Escape.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
        setShowViewMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="kh-header-right">
      {/* View Mode Switcher Pill */}
      {(userSession.role === 'admin' || userSession.role === 'trainer') && (
        <div style={{ position: 'relative' }} ref={viewMenuRef}>
          <button
            className="kh-view-pill"
            onClick={() => setShowViewMenu((prev) => !prev)}
          >
            <span>{activeTab === 'admin_suite' ? 'Admin View' : 'Employee View'}</span>
            <ChevronDown size={14} />
          </button>

          {showViewMenu && (
            <div className="kh-dropdown" style={{ right: 0, width: '185px', padding: '0.4rem', marginTop: '4px' }}>
              <button
                className="kh-profile-item"
                style={{ fontWeight: activeTab === 'admin_suite' ? 700 : 500, color: activeTab === 'admin_suite' ? '#a31555' : '#334155' }}
                onClick={() => {
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('overview');
                  setShowViewMenu(false);
                }}
              >
                <Shield size={14} /> Admin View
              </button>
              <button
                className="kh-profile-item"
                style={{ fontWeight: activeTab !== 'admin_suite' ? 700 : 500, color: activeTab !== 'admin_suite' ? '#a31555' : '#334155' }}
                onClick={() => {
                  onTabChange('dashboard');
                  setShowViewMenu(false);
                }}
              >
                <User size={14} /> Employee View
              </button>
            </div>
          )}
        </div>
      )}
      {/* Notifications */}
      <div style={{ position: 'relative' }} ref={notificationsMenuRef}>
        <button
          className="kh-bell-btn"
          onClick={handleNotificationsToggle}
          aria-label="Notifications"
          aria-expanded={showNotifications}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="kh-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {showNotifications && (
          <div className="kh-dropdown kh-notif-dropdown" role="menu">
            <div className="kh-dropdown-header">
              <span className="kh-dropdown-title">Notifications</span>
              {unreadCount > 0 && (
                <button className="kh-text-btn" onClick={onMarkAllNotificationsAsRead}>
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="kh-notif-empty">
                <Bell size={28} style={{ opacity: 0.3 }} />
                <span>You're all caught up!</span>
              </div>
            ) : (
              <ul className="kh-notif-list">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`kh-notif-item ${!notif.isRead ? 'kh-notif-item-unread' : ''}`}
                    onClick={() => {
                      setShowNotifications(false);
                      onNotificationClick(notif);
                    }}
                  >
                    <div className="kh-notif-icon"><Bell size={13} /></div>
                    <div className="kh-notif-content">
                      <span className="kh-notif-item-title">{notif.title}</span>
                      <span className="kh-notif-item-message">{notif.message}</span>
                      <span className="kh-notif-item-time">{formatNotificationTime(notif.createdAt)}</span>
                    </div>
                    {!notif.isRead && <span className="kh-notif-dot" />}
                    <button
                      className="kh-notif-delete"
                      onClick={(e) => onDeleteNotification(e, notif.id)}
                      aria-label="Delete notification"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="kh-profile-wrap" ref={profileMenuRef}>
        <button
          className="kh-profile-trigger"
          onClick={() => setShowProfileMenu((prev) => !prev)}
          aria-expanded={showProfileMenu}
        >
          <div className="kh-avatar-sm" style={{ backgroundColor: brand }}>{userInitials}</div>
          <ChevronDown size={15} className={`kh-chevron ${showProfileMenu ? 'kh-chevron-open' : ''}`} />
        </button>

        {showProfileMenu && (
          <div className="kh-dropdown kh-profile-dropdown" role="menu">
            <div className="kh-profile-info">
              <div className="kh-profile-name">{userSession.name}</div>
              <div className="kh-profile-email">{userSession.email}</div>
              <div className="kh-profile-meta-row">
                <span className="kh-role-badge">{roleDisplayNames[userSession.role] || userSession.role}</span>
                {userSession.department && <span className="kh-dept">{userSession.department}</span>}
              </div>
            </div>

            <button
              className="kh-profile-item"
              onClick={() => { onTabChange('progress'); setShowProfileMenu(false); }}
            >
              <Sliders size={15} /> My Profile & Progress
            </button>
            <button
              className="kh-profile-item"
              onClick={() => { onTabChange('certificates'); setShowProfileMenu(false); }}
            >
              <Award size={15} /> My Certificates
            </button>
            <div className="kh-profile-divider" />
            <button
              className="kh-profile-item kh-profile-item-danger"
              onClick={() => { setShowProfileMenu(false); onSignOutClick(); }}
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        )}
      </div>

      <style>{`
        .kh-header {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex; justify-content: space-between; align-items: center;
          height: 54px;
          padding: 0 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #eef0f4;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
          flex-shrink: 0;
          width: 100%;
        }
        .kh-header-right { display: flex; align-items: center; gap: 0.6rem; }
        .kh-search-wrap { position: relative; width: 360px; max-width: 45vw; }
        .kh-search-input {
          width: 100%; height: 36px; padding: 0 1rem 0 2.4rem;
          border-radius: 999px; border: 1px solid #e2e8f0;
          background: #ffffff; font-size: 0.825rem; color: #0f172a;
          outline: none; box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .kh-search-input:focus { border-color: ${brand}; box-shadow: 0 0 0 3px rgba(163,21,85,0.1); }
        .kh-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }

        .kh-view-pill {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.4rem 0.85rem; border-radius: 999px;
          background: #fdf2f8; color: ${brand}; border: 1px solid #fbcfe8;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          transition: all 0.15s ease;
        }
        .kh-view-pill:hover { background: #fce7f3; }

        .kh-bell-btn {
          position: relative;
          width: 32px; height: 32px; border-radius: 50%;
          background-color: #f8fafc; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #475569; transition: background-color 0.15s ease;
        }
        .kh-bell-btn:hover { background-color: #f1f5f9; }
        .kh-bell-badge {
          position: absolute; top: -2px; right: -2px;
          min-width: 15px; height: 15px; padding: 0 3px;
          border-radius: 9999px; background-color: ${brand};
          color: #ffffff; font-size: 0.6rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #ffffff;
        }

        .kh-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: #ffffff; border-radius: 12px;
          border: 1px solid #eef0f4;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
          z-index: 100; overflow: hidden;
          animation: kh-drop-in 0.16s ease;
        }
        @keyframes kh-drop-in {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kh-notif-dropdown { width: 340px; max-width: 90vw; }
        .kh-dropdown-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9;
        }
        .kh-dropdown-title { font-size: 0.9rem; font-weight: 700; color: #0f172a; }
        .kh-text-btn {
          border: none; background: transparent; color: ${brand};
          font-size: 0.78rem; font-weight: 600; cursor: pointer; padding: 0.2rem;
        }
        .kh-text-btn:hover { text-decoration: underline; }

        .kh-notif-empty {
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
          padding: 2.25rem 1rem; color: #94a3b8; font-size: 0.85rem;
        }
        .kh-notif-list { list-style: none; margin: 0; padding: 0.35rem; max-height: 360px; overflow-y: auto; }
        .kh-notif-item {
          position: relative;
          display: flex; align-items: flex-start; gap: 0.6rem;
          padding: 0.65rem 0.6rem; border-radius: 10px; cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .kh-notif-item:hover { background-color: #f8fafc; }
        .kh-notif-item-unread { background-color: #fdf2f8; }
        .kh-notif-item-unread:hover { background-color: #fce7f3; }
        .kh-notif-icon {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          background-color: #f1f5f9; color: #64748b;
          display: flex; align-items: center; justify-content: center; margin-top: 0.1rem;
        }
        .kh-notif-content { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; min-width: 0; }
        .kh-notif-item-title { font-size: 0.83rem; font-weight: 700; color: #0f172a; }
        .kh-notif-item-message {
          font-size: 0.79rem; color: #64748b; line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .kh-notif-item-time { font-size: 0.72rem; color: #94a3b8; margin-top: 0.1rem; }
        .kh-notif-dot { width: 7px; height: 7px; border-radius: 50%; background-color: ${brand}; margin-top: 0.4rem; flex-shrink: 0; }
        .kh-notif-delete {
          border: none; background: transparent; color: #cbd5e1; cursor: pointer;
          padding: 0.3rem; border-radius: 6px; opacity: 0; transition: opacity 0.15s ease, color 0.15s ease, background-color 0.15s ease;
        }
        .kh-notif-item:hover .kh-notif-delete { opacity: 1; }
        .kh-notif-delete:hover { color: #dc2626; background-color: #fee2e2; }

        .kh-profile-wrap { position: relative; }
        .kh-profile-trigger {
          display: flex; align-items: center; gap: 0.3rem;
          border: none; background: transparent; cursor: pointer; padding: 0.15rem;
          border-radius: 9999px;
        }
        .kh-avatar-sm {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #ffffff; font-weight: 700; font-size: 0.78rem; flex-shrink: 0;
          transition: box-shadow 0.15s ease;
        }
        .kh-profile-trigger:hover .kh-avatar-sm { box-shadow: 0 0 0 3px rgba(163,21,85,0.15); }
        .kh-chevron { color: #94a3b8; transition: transform 0.15s ease; }
        .kh-chevron-open { transform: rotate(180deg); }

        .kh-profile-dropdown { width: 260px; padding: 0.5rem; }
        .kh-profile-info { padding: 0.65rem 0.6rem 0.85rem 0.6rem; border-bottom: 1px solid #f1f5f9; margin-bottom: 0.35rem; }
        .kh-profile-name { font-size: 0.92rem; font-weight: 700; color: #0f172a; }
        .kh-profile-email { font-size: 0.78rem; color: #64748b; margin-top: 0.1rem; }
        .kh-profile-meta-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .kh-role-badge {
          font-size: 0.68rem; font-weight: 700; color: ${brand};
          background-color: #fdf2f8; padding: 0.15rem 0.5rem; border-radius: 9999px;
        }
        .kh-dept { font-size: 0.74rem; color: #94a3b8; }

        .kh-profile-item {
          width: 100%; display: flex; align-items: center; gap: 0.6rem;
          border: none; background: transparent; cursor: pointer;
          padding: 0.55rem 0.6rem; border-radius: 8px;
          font-size: 0.85rem; font-weight: 500; color: #334155;
          transition: background-color 0.15s ease;
          text-align: left;
        }
        .kh-profile-item:hover { background-color: #f8fafc; }
        .kh-profile-item-danger { color: #dc2626; }
        .kh-profile-item-danger:hover { background-color: #fef2f2; }
        .kh-profile-divider { height: 1px; background-color: #f1f5f9; margin: 0.35rem 0.2rem; }

        .kh-bell-btn:focus-visible, .kh-profile-trigger:focus-visible,
        .kh-back-btn:focus-visible, .kh-text-btn:focus-visible, .kh-profile-item:focus-visible {
          outline: 2px solid ${brand}; outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .kh-dropdown { animation: none; }
        }
      `}</style>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = (props) => {
  if (props.isImmersivePlayer) {
    if (props.studyingCourse && props.activeLessonIdx !== undefined && props.activeLessonIdx >= props.studyingCourse.lessons.length) {
      return null;
    }

    return (
      <header className="kh-study-header">
        <button className="kh-back-btn" onClick={props.onBackFromStudy}>
          <ArrowLeft size={15} />
          Go Back
        </button>

        <div className="kh-study-crumb">
          {props.studyingCourse?.title} <span className="kh-study-crumb-sep">/</span>{' '}
          <span className="kh-study-crumb-active">
            {props.studyingCourse && props.activeLessonIdx !== undefined && props.activeLessonIdx < props.studyingCourse.lessons.length
              ? props.studyingCourse.lessons[props.activeLessonIdx].moduleTitle || 'Module'
              : 'Final Assessment'}
          </span>
        </div>

        <div className="kh-avatar-sm" style={{ backgroundColor: brand }}>{props.userInitials}</div>

        <style>{`
          .kh-study-header {
            position: sticky;
            top: 0;
            z-index: 100;
            display: flex; justify-content: space-between; align-items: center;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-bottom: 1px solid #eef0f4;
            padding: 0 1.5rem; width: 100%; height: 48px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04); flex-shrink: 0;
          }
          .kh-back-btn {
            display: inline-flex; align-items: center; gap: 0.4rem;
            height: 30px; padding: 0 0.75rem; border-radius: 6px;
            font-size: 0.78rem; font-weight: 600;
            border: 1px solid #e2e8f0; background: #ffffff; color: #334155;
            cursor: pointer; transition: border-color 0.15s ease, background-color 0.15s ease;
          }
          .kh-back-btn:hover { background-color: #f8fafc; border-color: #cbd5e1; }
          .kh-study-crumb { font-size: 0.82rem; color: #64748b; font-weight: 600; }
          .kh-study-crumb-sep { color: #cbd5e1; margin: 0 0.15rem; }
          .kh-study-crumb-active { color: #0f172a; }
          .kh-avatar-sm {
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #ffffff; font-weight: 700; font-size: 0.78rem; flex-shrink: 0;
          }
        `}</style>
      </header>
    );
  }

  return (
    <header className="kh-header">
      <div className="kh-search-wrap">
        <Search size={16} className="kh-search-icon" />
        <input
          type="text"
          placeholder="Search courses, skills, certificates..."
          value={props.searchQuery || ''}
          onChange={(e) => props.setSearchQuery?.(e.target.value)}
          className="kh-search-input"
        />
      </div>
      <HeaderActions {...props} />
    </header>
  );
};

export const PageHeader = Header;
