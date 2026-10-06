import React from 'react';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  BookOpen,
  FileText,
  Award,
  UserCheck,
  Shield,
  Settings,
  ChevronDown,
  Search,
  X,
  LibraryBig,
  LockKeyhole
} from 'lucide-react';
import type { Course } from '../../services/db';

export interface AdminSidebarProps {
  activeTab: string;
  activeInnerTab: string;
  studyingCourse: Course | null;
  setStudyingCourse: (course: Course | null) => void;
  onTabChange: (tab: any) => void;
  setActiveInnerTab?: (tab: string) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

interface AdminNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

interface AdminNavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: AdminNavItem[];
}

const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: 'control',
    label: 'Control',
    icon: LayoutDashboard,
    items: [
      { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard, description: 'KPIs and activity' },
      { id: 'assignments', label: 'Assignments', icon: UserCheck, description: 'Course enrollment', badge: 'Live' },
      { id: 'settings', label: 'Platform Settings', icon: Settings, description: 'Global options' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: LibraryBig,
    items: [
      { id: 'creator', label: 'Course Creator', icon: PlusCircle, description: 'Build learning content' },
      { id: 'inventory', label: 'Course Inventory', icon: BookOpen, description: 'Published courses' },
      { id: 'document_inventory', label: 'Document Inventory', icon: FileText, description: 'Policies and SOPs' },
      { id: 'certificate_templates', label: 'Certificate Templates', icon: Award, description: 'Completion design' },
    ],
  },
  {
    id: 'people',
    label: 'People & Access',
    icon: LockKeyhole,
    items: [
      { id: 'users', label: 'User Directory', icon: Users, description: 'Accounts and roles' },
      { id: 'permissions', label: 'Permissions Matrix', icon: Shield, description: 'Role capabilities' },
    ],
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  activeInnerTab,
  studyingCourse,
  setStudyingCourse,
  onTabChange,
  setActiveInnerTab,
  setIsMobileSidebarOpen,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({
    control: true,
    content: true,
    people: true,
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredGroups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: normalizedSearch
      ? group.items.filter((item) =>
        `${item.label} ${item.description}`.toLowerCase().includes(normalizedSearch)
      )
      : group.items,
  })).filter((group) => group.items.length > 0);

  const handleGroupToggle = (groupId: string) => {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const handleNavClick = (itemId: string) => {
    setStudyingCourse(null);
    onTabChange('admin_suite');
    setActiveInnerTab?.(itemId);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="admin-sidebar-shell">
      <div className="admin-sidebar-search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search admin tools"
          aria-label="Search admin tools"
        />
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear admin search">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="admin-sidebar-groups">
        {filteredGroups.map((group) => {
          const GroupIcon = group.icon;
          const isOpen = normalizedSearch ? true : openGroups[group.id];

          return (
            <section key={group.id} className="admin-sidebar-group">
              <button
                type="button"
                className="admin-sidebar-group-toggle"
                onClick={() => handleGroupToggle(group.id)}
                aria-expanded={isOpen}
              >
                <span>
                  <GroupIcon size={14} />
                  {group.label}
                </span>
                <ChevronDown size={14} className={isOpen ? 'is-open' : ''} />
              </button>

              {isOpen && (
                <div className="admin-sidebar-group-items">
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === 'admin_suite' && activeInnerTab === item.id && !studyingCourse;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`koruna-sidebar-item admin-sidebar-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="admin-sidebar-item-icon-wrap">
                          <IconComponent size={17} className="koruna-sidebar-item-icon" />
                        </span>
                        <span className="admin-sidebar-item-copy">
                          <span className="admin-sidebar-item-label">{item.label}</span>
                          <span className="admin-sidebar-item-description">{item.description}</span>
                        </span>
                        {item.badge && <span className="admin-sidebar-badge">{item.badge}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="admin-sidebar-empty">No admin tools found.</div>
      )}
    </div>
  );
};
