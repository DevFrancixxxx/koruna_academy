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
  Settings
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
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'overview', label: 'Admin Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'User Directory', icon: Users },
  { id: 'creator', label: 'Course Creator', icon: PlusCircle },
  { id: 'inventory', label: 'Course Inventory', icon: BookOpen },
  { id: 'document_inventory', label: 'Document Inventory', icon: FileText },
  { id: 'certificate_templates', label: 'Certificate Templates', icon: Award },
  { id: 'assignments', label: 'Assignments', icon: UserCheck },
  { id: 'permissions', label: 'Permissions Matrix', icon: Shield },
  { id: 'settings', label: 'Platform Settings', icon: Settings },
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
  return (
    <>
      {ADMIN_NAV_ITEMS.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === 'admin_suite' && activeInnerTab === item.id && !studyingCourse;

        return (
          <button
            key={item.id}
            className={`koruna-sidebar-item ${isActive ? 'active' : ''}`}
            onClick={() => {
              setStudyingCourse(null);
              onTabChange('admin_suite');
              setActiveInnerTab?.(item.id);
              setIsMobileSidebarOpen(false);
            }}
          >
            <IconComponent size={18} className="koruna-sidebar-item-icon" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </>
  );
};
