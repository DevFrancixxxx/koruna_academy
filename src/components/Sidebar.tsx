import React from 'react';
import {
  Bell,
  SlidersHorizontal,
  X,
  LayoutDashboard,
  Award,
  Users,
  Settings,
  Home,
  GraduationCap,
  BookOpen,
  FileText,
  Megaphone,
  Trophy,
  Target,
  Rocket,
  User,
  ArrowLeft,
  Route,
  PieChart,
  Sliders,
  TrendingUp,
  PlusCircle,
  UserCheck,
  Shield
} from 'lucide-react';
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
  setActiveInnerTab?: (tab: string) => void;
  activeInnerTab?: string;
  userPerms?: {
    viewTeamReports?: boolean;
    editCourses?: boolean;
    manageUsers?: boolean;
    systemSettings?: boolean;
    [key: string]: boolean | undefined;
  };
  handleSignOutClick?: () => void;
}

interface NavParentItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const KORUNA_LIFE_NAV: NavParentItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'catalog', label: 'Koruna Academy', icon: GraduationCap },
  { id: 'knowledge_base', label: 'Knowledge Hub', icon: BookOpen },
  { id: 'feed', label: 'Koruna Feed', icon: Megaphone },
  { id: 'rewards', label: 'Recognition & Rewards', icon: Trophy },
  { id: 'engage', label: 'Clubs & Engagement', icon: Target },
  { id: 'career', label: 'My Career', icon: Rocket },
  { id: 'my_koruna', label: 'My Koruna', icon: User }
];

const KORUNA_ACADEMY_NAV: NavParentItem[] = [
  { id: 'catalog', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'catalog_courses', label: 'Course Catalogue', icon: BookOpen },
  { id: 'learning_path', label: 'Learning Path', icon: Route },
  { id: 'progress', label: 'My Progress', icon: PieChart },
  { id: 'certificates', label: 'My Certificates', icon: Award },
  { id: 'skills', label: 'Skills Dashboard', icon: Sliders },
  { id: 'career_path', label: 'Career Path', icon: TrendingUp }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  userSession,
  activeTab,
  onTabChange,
  studyingCourse,
  setStudyingCourse,
  setActiveInnerTab,
  activeInnerTab = 'courses',
  userPerms: _userPerms
}) => {
  const isAcademyMode = [
    'catalog',
    'catalog_courses',
    'learning_path',
    'progress',
    'certificates',
    'skills',
    'career_path'
  ].includes(activeTab);

  const handleItemClick = (id: string) => {
    setStudyingCourse(null);
    onTabChange(id);
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {isMobileSidebarOpen && (
        <div className="koruna-sidebar-backdrop" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      <aside className={`koruna-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="koruna-sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          {userSession.role === 'trainer' ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
              onClick={() => {
                setStudyingCourse(null);
                onTabChange('admin_suite');
                setActiveInnerTab?.('creator');
                setIsMobileSidebarOpen(false);
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Trainer Suite
              </span>
              <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                LMS CONTROL CENTER
              </span>
            </div>
          ) : isAcademyMode ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => {
                setStudyingCourse(null);
                onTabChange('catalog');
                setIsMobileSidebarOpen(false);
              }}
            >
              <GraduationCap size={22} style={{ color: '#db2777' }} />
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Koruna Academy
              </span>
            </div>
          ) : (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
              onClick={() => {
                setStudyingCourse(null);
                onTabChange('dashboard');
                setIsMobileSidebarOpen(false);
              }}
            >
              <img
                src="/Wkorunalogo.png"
                alt="Koruna Life Logo"
                className="koruna-sidebar-logo-img"
                style={{ height: '28px', width: 'auto', display: 'block' }}
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src.endsWith('/korunalogo.png')) {
                    img.src = '/logo.svg';
                  }
                }}
              />
            </div>
          )}
          <button className="koruna-sidebar-close-btn" onClick={() => setIsMobileSidebarOpen(false)} title="Close Menu">
            <X size={20} />
          </button>
        </div>

        <nav className="koruna-sidebar-menu">
          {userSession.role === 'admin' || userSession.role === 'trainer' || activeTab === 'admin_suite' ? (
            <>
              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'overview' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('overview');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <LayoutDashboard size={18} className="koruna-sidebar-item-icon" />
                <span>Admin Dashboard</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'users' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('users');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <Users size={18} className="koruna-sidebar-item-icon" />
                <span>User Directory</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'creator' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('creator');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <PlusCircle size={18} className="koruna-sidebar-item-icon" />
                <span>Course Creator</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'inventory' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('inventory');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <BookOpen size={18} className="koruna-sidebar-item-icon" />
                <span>Course Inventory</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'document_inventory' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('document_inventory');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <FileText size={18} className="koruna-sidebar-item-icon" />
                <span>Document Inventory</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'certificate_templates' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('certificate_templates');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <Award size={18} className="koruna-sidebar-item-icon" />
                <span>Certificate Templates</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'assignments' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('assignments');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <UserCheck size={18} className="koruna-sidebar-item-icon" />
                <span>Assignments</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'permissions' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('permissions');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <Shield size={18} className="koruna-sidebar-item-icon" />
                <span>Permissions Matrix</span>
              </button>

              <button
                className={`koruna-sidebar-item ${activeTab === 'admin_suite' && activeInnerTab === 'settings' && !studyingCourse ? 'active' : ''}`}
                onClick={() => {
                  setStudyingCourse(null);
                  onTabChange('admin_suite');
                  setActiveInnerTab?.('settings');
                  setIsMobileSidebarOpen(false);
                }}
              >
                <Settings size={18} className="koruna-sidebar-item-icon" />
                <span>Platform Settings</span>
              </button>
            </>
          ) : isAcademyMode ? (
            <>
              {/* BUTTON TO RETURN TO KORUNA LIFE HOMEPAGE */}
              <button
                className="koruna-sidebar-item"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  color: '#e2e8f0',
                  marginBottom: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => handleItemClick('dashboard')}
              >
                <ArrowLeft size={16} className="koruna-sidebar-item-icon" style={{ color: '#db2777' }} />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>← Return to Koruna Life</span>
              </button>

              {/* KORUNA ACADEMY SIDEBAR MENU */}
              {KORUNA_ACADEMY_NAV.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id && !studyingCourse;

                return (
                  <button
                    key={item.id}
                    className={`koruna-sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <IconComponent size={18} className="koruna-sidebar-item-icon" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {/* KORUNA LIFE SIDEBAR MENU */}
              {KORUNA_LIFE_NAV.map((item) => {
                const IconComponent = item.icon;
                const isActive = (activeTab === item.id || (item.id === 'catalog' && (activeTab === 'learn' || studyingCourse))) && !studyingCourse;

                return (
                  <button
                    key={item.id}
                    className={`koruna-sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <IconComponent size={18} className="koruna-sidebar-item-icon" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* BOTTOM SIDEBAR FOOTER: Notifications & Profile & Settings */}
        <div className="koruna-sidebar-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', padding: '0.6rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            className={`koruna-sidebar-item ${activeTab === 'notifications' && !studyingCourse ? 'active' : ''}`}
            onClick={() => {
              setStudyingCourse(null);
              onTabChange('notifications');
              setIsMobileSidebarOpen(false);
            }}
          >
            <Bell size={18} className="koruna-sidebar-item-icon" style={{ strokeWidth: 1.75 }} />
            <span>Notifications</span>
          </button>

          <button
            className={`koruna-sidebar-item ${(activeTab === 'settings' || activeTab === 'profile') && !studyingCourse ? 'active' : ''}`}
            onClick={() => {
              setStudyingCourse(null);
              onTabChange('settings');
              setIsMobileSidebarOpen(false);
            }}
          >
            <SlidersHorizontal size={18} className="koruna-sidebar-item-icon" style={{ strokeWidth: 1.75 }} />
            <span>Profile & Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};

