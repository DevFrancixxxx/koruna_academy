import React from 'react';
import { LogOut, X } from 'lucide-react';
import type { UserSessionData } from '../services/auth';
import type { Course } from '../services/db';

export interface SidebarProps {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  userSession: UserSessionData;
  activeTab: string;
  onTabChange: (tab: any) => void;
  studyingCourse: Course | null;
  setStudyingCourse: (course: Course | null) => void;
  setActiveInnerTab: (tab: string) => void;
  userPerms?: {
    viewTeamReports?: boolean;
    editCourses?: boolean;
    manageUsers?: boolean;
    systemSettings?: boolean;
    [key: string]: boolean | undefined;
  };
  handleSignOutClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  userSession,
  activeTab,
  onTabChange,
  studyingCourse,
  setStudyingCourse,
  setActiveInnerTab,
  userPerms,
  handleSignOutClick
}) => {
  return (
    <>
      {isMobileSidebarOpen && (
        <div className="koruna-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      <aside className={`koruna-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="koruna-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => {
            setStudyingCourse(null);
            if (userSession.role === 'trainer') {
              onTabChange('admin_suite');
              setActiveInnerTab('creator');
            } else {
              onTabChange('dashboard');
            }
            setIsMobileSidebarOpen(false);
          }}>
            <img
              src="/Wkorunalogo.png"
              alt="Koruna Academy Logo"
              style={{ height: '40px', width: 'auto', display: 'block' }}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.endsWith('/korunalogo.png')) {
                  img.src = '/logo.svg';
                }
              }}
            />
          </div>
          <button className="koruna-sidebar-close-btn" onClick={() => setIsMobileSidebarOpen(false)} title="Close Menu">
            <X size={20} />
          </button>
        </div>

        <nav className="koruna-sidebar-menu">
          {userSession.role === 'trainer' ? (
            <>
              <button
                className={`koruna-sidebar-item ${activeTab === 'dashboard' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/dashboard.png" alt="Dashboard" className="koruna-sidebar-item-icon" />
                <span>Trainer Dashboard</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab('creator');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/settings.png" alt="Trainer Suite" className="koruna-sidebar-item-icon" />
                <span>Trainer Suite</span>
              </button>
            </>
          ) : (
            <>
              <button
                className={`koruna-sidebar-item ${activeTab === 'dashboard' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/dashboard.png" alt="Dashboard" className="koruna-sidebar-item-icon" />
                <span>Dashboard</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'catalog' || studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('catalog');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/coursecatalog.png" alt="Course Catalogue" className="koruna-sidebar-item-icon" />
                <span>Course Catalogue</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'learning_path' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('learning_path');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/learningpath.png" alt="Learning Path" className="koruna-sidebar-item-icon" />
                <span>Learning Path</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'progress' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('progress');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/progress.png" alt="My Progress" className="koruna-sidebar-item-icon" />
                <span>My Progress</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'certificates' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('certificates');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/certificate.png" alt="My Certificates" className="koruna-sidebar-item-icon" />
                <span>My Certificates</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'skills' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('skills');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/skills.png" alt="Skills Dashboard" className="koruna-sidebar-item-icon" />
                <span>Skills Dashboard</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'career' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('career');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/careerpath.png" alt="Career Path" className="koruna-sidebar-item-icon" />
                <span>Career Path</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'knowledge_base' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('knowledge_base');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <img src="/sidebaricons/notificationbell.png" alt="Knowledge Base" className="koruna-sidebar-item-icon" />
                <span>Knowledge Base</span>
              </button>
            </>
          )}

          {/* Team Leader & Admin only: View team reports */}
          {userPerms?.viewTeamReports && (
            <button
              className={`koruna-sidebar-item ${activeTab === 'team_reports' && !studyingCourse ? 'active' : ''}`}
              onClick={() => { setStudyingCourse(null); onTabChange('team_reports'); setActiveInnerTab('overview'); setIsMobileSidebarOpen(false); }}
            >
              <img src="/sidebaricons/progress.png" alt="Team Reports" className="koruna-sidebar-item-icon" />
              <span>Team Reports</span>
            </button>
          )}

          {/* Trainer & Admin only: Admin Suite */}
          {(userPerms?.editCourses || userPerms?.manageUsers || userPerms?.systemSettings) && (
            <button
              className={`koruna-sidebar-item ${activeTab === 'admin_suite' && !studyingCourse ? 'active' : ''}`}
              onClick={() => {
                setStudyingCourse(null);
                onTabChange('admin_suite');
                setActiveInnerTab(userPerms?.editCourses ? 'creator' : 'users');
                setIsMobileSidebarOpen(false);
              }}
            >
              <img src="/sidebaricons/settings.png" alt="Admin Suite" className="koruna-sidebar-item-icon" />
              <span>Admin Suite</span>
            </button>
          )}
        </nav>

        <div className="koruna-sidebar-footer">
          <button className="koruna-sidebar-signout-btn" onClick={handleSignOutClick}>
            <LogOut size={16} />
            <span>Sign out portal</span>
          </button>
        </div>
      </aside>
    </>
  );
};
