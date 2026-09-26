import React from 'react';
import {
  Trash2,
  RefreshCw,
  Plus,
  PlusCircle,
  Award,
  Search,
  BookOpen,
  Users,
  Shield,
  X,
  Video,
  Layers,
  FileText,
  CheckCircle2,
  Tv,
  UserPlus,
  Building,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import type { UserSessionData, UserRole } from '../services/auth';
import { dbService, type Course, type Lesson, type QuizQuestion, type UserProgress, type Department, type SystemSettings, type RolePermissions, type DatabaseUser } from '../services/db';
import { CourseCard } from './courses/CourseCard';
import { ContentCreatorView } from './admin/ContentCreatorView';

interface AdminSuiteProps {
  userSession: UserSessionData;
  userPerms: RolePermissions['permissions'] | undefined;
  activeInnerTab: string;
  setActiveInnerTab: (tab: string) => void;
  courses: Course[];
  users: DatabaseUser[];
  departments: Department[];
  permissions: RolePermissions[];
  settings: SystemSettings;
  teamProgress: Record<string, UserProgress[]>;
  editingCourseId: string | null;
  assignedUserEmails: string[];
  setAssignedUserEmails: React.Dispatch<React.SetStateAction<string[]>>;
  courseForm: {
    title: string;
    category: string;
    code: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    imgBg: string;
    attachments?: { name: string; url: string; size: number }[];
    contentType?: 'course' | 'document';
    requiresCertification?: boolean;
    documentContent?: string;
    acknowledgmentText?: string;
  };
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  courseLessons: Omit<Lesson, 'id'>[];
  setCourseLessons: React.Dispatch<React.SetStateAction<any[]>>;
  courseQuiz: QuizQuestion[];
  setCourseQuiz: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  courseModules: { id: string; title: string }[];
  setCourseModules: React.Dispatch<React.SetStateAction<{ id: string; title: string }[]>>;
  adminUserForm: {
    name: string;
    email: string;
    role: UserRole;
    department: string;
  };
  setAdminUserForm: React.Dispatch<React.SetStateAction<any>>;
  newDeptName: string;
  setNewDeptName: (name: string) => void;
  handleSaveCourse: (e: React.FormEvent) => Promise<void>;
  handleStartEditCourse: (course: Course) => void;
  handleDeleteCourse: (id: string) => Promise<void>;
  handleAssignCourse: (courseId: string, email: string) => Promise<void>;
  handleCreateUser: (e: React.FormEvent) => Promise<void>;
  handleAddDept: (e: React.FormEvent) => void;
  handleUpdateUserDept: (email: string, dept: string) => Promise<void>;
  handleUpdateUserRole: (email: string, role: UserRole) => Promise<void>;
  handleDeleteUser: (email: string) => Promise<void>;
  handlePermissionToggle: (role: UserRole, permissionKey: keyof RolePermissions['permissions']) => void;
  handleSaveSettings: (updatedSettings: Partial<SystemSettings>) => void;
  addQuizQuestionField: () => void;
  removeQuizQuestionField: (idx: number) => void;
  setEditingCourseId: (id: string | null) => void;
  showToast: (msg: string) => void;
  loadPlatformData: () => Promise<void>;
}

/**
 * Scoped stylesheet for the Admin Suite.
 * Aligned with Koruna Home Page design language (brand colors, centered grid, rounded cards, pill tabs).
 */
const AdminSuiteStyles = () => (
  <style>{`
    .as-root {
      --as-ink: #0f172a;
      --as-ink-soft: #475569;
      --as-ink-faint: #94a3b8;
      --as-line: #e2e8f0;
      --as-surface: #ffffff;
      --as-bg: #f8fafc;
      --as-primary: #a31555;
      --as-primary-dark: #7a0f40;
      --as-primary-soft: #fdf2f8;
      --as-primary-line: #fbcfe8;
      --as-accent: #db2777;
      --as-accent-soft: #fdf2f8;
      --as-good: #16a34a;
      --as-good-soft: #f0fdf4;
      --as-warn: #ea580c;
      --as-warn-soft: #fff7ed;
      --as-bad: #dc2626;
      --as-bad-soft: #fef2f2;
      --as-radius-lg: 18px;
      --as-radius-md: 12px;
      --as-radius-sm: 8px;
      --as-shadow-1: 0 2px 8px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
      --as-shadow-2: 0 10px 30px -5px rgba(15, 23, 42, 0.08);
      font-family: Inter, system-ui, -apple-system, sans-serif;
      color: var(--as-ink);
      width: 100%;
      max-width: 1280px;
      margin: 0 auto;
      padding: 1.25rem 1.5rem 3rem 1.5rem;
    }

    .as-root * { box-sizing: border-box; }

    /* ---------- layout shells ---------- */
    .as-page { display: flex; flex-direction: column; gap: 1.1rem; }
    .as-card {
      background: var(--as-surface);
      border: 1px solid var(--as-line);
      border-radius: var(--as-radius-lg);
      box-shadow: var(--as-shadow-1);
    }
    .as-card--pad { padding: 1.15rem 1.35rem; }
    @media (max-width: 640px) { .as-card--pad { padding: 0.9rem; } }

    .as-section { display: flex; flex-direction: column; gap: 1.1rem; animation: as-fade 0.18s ease-out; }
    @keyframes as-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* ---------- Home-style Hero Masthead ---------- */
    .as-masthead {
      background: linear-gradient(135deg, var(--as-primary) 0%, var(--as-primary-dark) 100%);
      border-radius: 20px;
      padding: 1.25rem 1.75rem;
      color: #ffffff;
      box-shadow: 0 10px 25px -5px rgba(163, 21, 85, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .as-masthead-title { display: flex; align-items: center; gap: 0.85rem; }
    .as-masthead-badge {
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(6px);
      color: #fff; padding: 0.55rem; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .as-masthead h2 { margin: 0; font-size: 1.35rem; font-weight: 700; letter-spacing: -0.01em; color: #ffffff; }
    .as-masthead p { color: rgba(255, 255, 255, 0.88); font-size: 0.85rem; margin: 0.2rem 0 0 0; }

    /* ---------- Home-style Pill Tab Bar ---------- */
    .as-tabbar {
      display: flex;
      gap: 0.45rem;
      overflow-x: auto;
      padding: 0.25rem 0;
      scrollbar-width: none;
    }
    .as-tabbar::-webkit-scrollbar { display: none; }
    .as-tab {
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.5rem 1rem; border-radius: 999px;
      font-weight: 600; font-size: 0.825rem; white-space: nowrap;
      border: 1px solid var(--as-line); background: #ffffff; color: var(--as-ink-soft);
      cursor: pointer; transition: all 0.15s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .as-tab:hover { background: var(--as-primary-soft); color: var(--as-primary); border-color: var(--as-primary-line); }
    .as-tab.is-active { background: var(--as-primary); color: #ffffff; border-color: var(--as-primary); box-shadow: 0 4px 12px rgba(163, 21, 85, 0.25); }
    .as-tab .as-tab-count {
      background: var(--as-primary-soft); color: var(--as-primary);
      padding: 1px 7px; border-radius: 999px; font-size: 0.72rem; font-weight: 700;
    }
    .as-tab.is-active .as-tab-count { background: rgba(255,255,255,0.25); color: #ffffff; }

    /* ---------- Home-style Buttons ---------- */
    .as-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.45rem;
      height: 38px; padding: 0 1.05rem; border-radius: 10px;
      font-weight: 600; font-size: 0.825rem; cursor: pointer;
      border: 1px solid transparent; transition: all 0.15s ease;
      white-space: nowrap;
    }
    .as-btn:active { transform: scale(0.98); }
    .as-btn:disabled { cursor: not-allowed; opacity: 0.6; }
    .as-btn--primary { background: linear-gradient(135deg, var(--as-primary) 0%, var(--as-primary-dark) 100%); color: #fff; box-shadow: 0 4px 14px rgba(163, 21, 85, 0.3); }
    .as-btn--primary:hover { opacity: 0.95; box-shadow: 0 6px 18px rgba(163, 21, 85, 0.4); }
    .as-btn--accent { background: linear-gradient(135deg, var(--as-accent) 0%, #be185d 100%); color: #fff; box-shadow: 0 4px 14px rgba(219, 39, 119, 0.3); }
    .as-btn--outline { background: var(--as-surface); border-color: #cbd5e1; color: var(--as-ink-soft); }
    .as-btn--outline:hover { background: #f8fafc; border-color: #94a3b8; color: var(--as-ink); }
    .as-btn--hero-outline { background: rgba(255, 255, 255, 0.15); border-color: rgba(255, 255, 255, 0.35); color: #ffffff; }
    .as-btn--hero-outline:hover { background: rgba(255, 255, 255, 0.25); border-color: rgba(255, 255, 255, 0.6); }
    .as-btn--ghost { background: transparent; border-color: transparent; color: var(--as-ink-soft); }
    .as-btn--sm { height: 32px; padding: 0 0.8rem; font-size: 0.78rem; }
    .as-btn--full { width: 100%; }
    .as-icon-btn {
      width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent;
      display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
      color: var(--as-bad); transition: background 0.15s ease;
    }
    .as-icon-btn:hover { background: var(--as-bad-soft); }
    .as-icon-btn:disabled { color: #cbd5e1; cursor: not-allowed; }
    .as-icon-btn:disabled:hover { background: transparent; }

    /* ---------- Form Primitives ---------- */
    .as-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .as-label { font-size: 0.75rem; font-weight: 600; color: var(--as-ink-soft); }
    .as-input, .as-select, .as-textarea {
      height: 38px; border-radius: var(--as-radius-sm); border: 1px solid var(--as-line);
      font-size: 0.825rem; padding: 0 0.85rem; width: 100%; color: var(--as-ink);
      background: #f8fafc; transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    }
    .as-input:focus, .as-select:focus, .as-textarea:focus {
      outline: none; background: #ffffff; border-color: var(--as-primary);
      box-shadow: 0 0 0 3px rgba(163, 21, 85, 0.12);
    }
    .as-textarea { height: auto; min-height: 72px; padding: 0.6rem 0.85rem; line-height: 1.45; resize: vertical; }
    .as-select--auto { width: auto; height: 32px; padding: 0 1.8rem 0 0.6rem; font-size: 0.78rem; }

    .as-form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
    @media (max-width: 560px) { .as-form-grid-2 { grid-template-columns: 1fr; } }

    /* ---------- Layout Grids ---------- */
    .as-split-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; align-items: start; }
    @media (max-width: 920px) { .as-split-2 { grid-template-columns: 1fr; } }

    .as-metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.85rem; }
    @media (max-width: 760px) { .as-metric-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
    @media (max-width: 480px) { .as-metric-grid { grid-template-columns: 1fr; } }

    .as-course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 0.95rem; }
    @media (max-width: 480px) { .as-course-grid { grid-template-columns: 1fr; } }

    .as-module-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 0.6rem; }

    /* ---------- Action Row ---------- */
    .as-actions-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    @media (max-width: 560px) { .as-actions-row { width: 100%; } .as-actions-row .as-btn { flex: 1; } }

    /* ---------- Metric Card ---------- */
    .as-metric {
      display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1.15rem;
      background: var(--as-surface); border: 1px solid var(--as-line); border-radius: var(--as-radius-md);
      box-shadow: var(--as-shadow-1);
    }
    .as-metric-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .as-metric-value { font-size: 1.3rem; font-weight: 700; line-height: 1.1; }
    .as-metric-label { font-size: 0.75rem; color: var(--as-ink-faint); font-weight: 600; }

    /* ---------- Filter / Search Bar ---------- */
    .as-filterbar {
      display: flex; justify-content: space-between; align-items: center;
      gap: 0.85rem; flex-wrap: wrap; padding: 0.75rem 1.15rem;
    }
    .as-search { position: relative; flex: 1; min-width: 200px; }
    .as-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
    .as-search input { padding-left: 2.3rem; height: 36px; font-size: 0.825rem; }
    .as-chip-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .as-chip {
      padding: 0.35rem 0.75rem; border-radius: 999px; font-size: 0.76rem; font-weight: 600;
      border: 1px solid var(--as-line); background: var(--as-surface); color: var(--as-ink-soft);
      cursor: pointer; transition: all 0.15s ease;
    }
    .as-chip.is-active { background: var(--as-primary); border-color: var(--as-primary); color: #fff; }

    /* ---------- Pill / Badge ---------- */
    .as-pill { padding: 3px 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; }
    .as-badge-count { padding: 2px 7px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; background: var(--as-primary-soft); color: var(--as-primary); }

    /* ---------- Responsive Table ---------- */
    .as-table-wrap { overflow-x: auto; border-radius: var(--as-radius-md); border: 1px solid var(--as-line); }
    .as-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.825rem; min-width: 600px; }
    .as-table thead tr { background: #f8fafc; border-bottom: 1px solid var(--as-line); }
    .as-table th {
      padding: 0.6rem 0.95rem; color: var(--as-ink-soft); font-weight: 700; font-size: 0.72rem;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .as-table td { padding: 0.6rem 0.95rem; border-bottom: 1px solid #f1f2f6; vertical-align: middle; }
    .as-table tbody tr:last-child td { border-bottom: none; }
    .as-table tbody tr:nth-child(even) { background: #fafbfd; }
    .as-scroll-hint { display: none; font-size: 0.72rem; color: var(--as-ink-faint); padding: 0.35rem 0.95rem 0; }
    @media (max-width: 700px) { .as-scroll-hint { display: block; } }

    /* ---------- Upload Dropzone ---------- */
    .as-dropzone {
      border: 2px dashed #cbd5e1; border-radius: var(--as-radius-md); padding: 0.95rem;
      text-align: center; background: #f8fafc; position: relative; cursor: pointer;
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .as-dropzone:hover { border-color: var(--as-primary); background: var(--as-primary-soft); }
    .as-dropzone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

    /* ---------- Item Cards ---------- */
    .as-item-card { background: #f8fafc; border: 1px solid var(--as-line); border-radius: var(--as-radius-md); padding: 0.85rem 0.95rem; }

    /* ---------- Sticky Save Bar ---------- */
    .as-sticky-save { display: none; }
    @media (max-width: 760px) {
      .as-sticky-save {
        display: flex; position: sticky; bottom: 0; z-index: 20;
        background: rgba(255,255,255,0.92); backdrop-filter: blur(6px);
        border-top: 1px solid var(--as-line); padding: 0.5rem 0; margin: 0 -0.1rem;
      }
    }

    /* ---------- Modal ---------- */
    .as-modal-backdrop {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
      z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .as-modal {
      background: var(--as-surface); border-radius: 20px; border: 1px solid var(--as-line);
      width: 100%; max-width: 920px; max-height: 88vh; display: flex; flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(15,23,42,0.3); overflow: hidden;
    }
    @media (max-width: 640px) {
      .as-modal-backdrop { padding: 0; align-items: flex-end; }
      .as-modal { max-height: 94vh; border-radius: 20px 20px 0 0; }
    }
    .as-modal-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--as-line); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; background: #f8fafc; }
    .as-modal-body { padding: 1rem 1.25rem; overflow-y: auto; flex: 1; }
    .as-modal-footer { padding: 0.85rem 1.25rem; border-top: 1px solid var(--as-line); background: #f8fafc; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

    /* ---------- Certificate Preview ---------- */
    .as-cert-frame { width: 100%; border-radius: var(--as-radius-md); box-shadow: var(--as-shadow-2); position: relative; overflow: hidden; background: #fff; border: 1px solid var(--as-line); }
    .as-cert-overlay { position: absolute; text-align: center; display: flex; align-items: center; justify-content: center; }

    /* ---------- Utility ---------- */
    .as-muted { color: var(--as-ink-faint); }
    .as-flex-between { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    .as-empty-state { grid-column: 1 / -1; background: var(--as-surface); border-radius: var(--as-radius-lg); border: 1px dashed #cbd5e1; padding: 2.25rem 1rem; text-align: center; color: var(--as-ink-faint); }
  `}</style>
);

export const AdminSuite: React.FC<AdminSuiteProps> = ({
  userSession,
  userPerms: _userPerms,
  activeInnerTab,
  setActiveInnerTab,
  courses,
  users,
  departments,
  permissions,
  settings,
  editingCourseId,
  assignedUserEmails,
  setAssignedUserEmails,
  courseForm,
  setCourseForm,
  courseLessons,
  setCourseLessons,
  courseQuiz,
  setCourseQuiz,
  courseModules,
  setCourseModules,
  adminUserForm,
  setAdminUserForm,
  newDeptName,
  setNewDeptName,
  handleSaveCourse,
  handleStartEditCourse,
  handleDeleteCourse,
  handleAssignCourse,
  handleCreateUser,
  handleAddDept,
  handleUpdateUserDept,
  handleUpdateUserRole,
  handleDeleteUser,
  handlePermissionToggle,
  handleSaveSettings,
  addQuizQuestionField,
  removeQuizQuestionField,
  setEditingCourseId,
  showToast,
  loadPlatformData
}) => {
  const [certHeader, setCertHeader] = React.useState('Koruna Financial Academy');
  const [trainerSig, setTrainerSig] = React.useState(userSession.name || 'Dr. Marcus Vance');
  const [adminSig, setAdminSig] = React.useState('Global Admin');
  const [sampleRecipient, setSampleRecipient] = React.useState('Jessica Taylor');
  const [sampleCourseTitle, setSampleCourseTitle] = React.useState('Mortgage Level 2: Underwriting Processes');
  const [assignmentSearchQuery, setAssignmentSearchQuery] = React.useState('');

  // Derived lists for courses vs documents
  const coursesOnly = courses.filter(c => c.contentType !== 'document');
  const documentsOnly = courses.filter(c => c.contentType === 'document');

  // Dedicated inventory states for courses
  const [isInventoryModalOpen, setIsInventoryModalOpen] = React.useState(false);
  const [inventorySearchQuery, setInventorySearchQuery] = React.useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = React.useState('All');

  // Dedicated inventory states for documents
  const [docSearchQuery, setDocSearchQuery] = React.useState('');
  const [docCategoryFilter, setDocCategoryFilter] = React.useState('All');

  // Dedicated user directory states
  const [userSearchQuery, setUserSearchQuery] = React.useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [addUserModalTab, setAddUserModalTab] = React.useState<'user' | 'dept'>('user');

  // Delete course notice modal state
  const [courseToDelete, setCourseToDelete] = React.useState<{ id: string; title: string; contentType?: string } | null>(null);

  // Filtered users for user directory table
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.department && u.department.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
    u.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Categories list derived from courses
  const categories = ['All', ...Array.from(new Set(coursesOnly.map(c => c.category)))];

  // Categories list derived from documents
  const docCategories = ['All', ...Array.from(new Set(documentsOnly.map(c => c.category)))];

  // Filtered courses for course inventory view/modal
  const filteredCourses = coursesOnly.filter(course => {
    const matchesSearch =
      course.title.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(inventorySearchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(inventorySearchQuery.toLowerCase());
    const matchesCategory =
      inventoryCategoryFilter === 'All' || course.category === inventoryCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered documents for document inventory view
  const filteredDocs = documentsOnly.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      (doc.documentContent && doc.documentContent.toLowerCase().includes(docSearchQuery.toLowerCase()));
    const matchesCategory =
      docCategoryFilter === 'All' || doc.category === docCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetCourseFormState = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      category: 'Mortgage',
      code: '',
      level: 'Beginner',
      description: '',
      imgBg: '#e0f2fe',
      imageUrl: '',
      attachments: [],
      contentType: 'course',
      requiresCertification: true,
      documentContent: '',
      acknowledgmentText: 'I have read, understood, and agree to the policies and terms outlined in this document.'
    });
    setCourseLessons([{ title: 'Lesson 1: Introduction', content: 'Enter lesson text here.' }]);
    setCourseQuiz([]);
  };

  return (
    <div className="as-root">
      <AdminSuiteStyles />
      <div className="as-page">
        {userSession.role !== 'trainer' && activeInnerTab !== 'overview' && (
          <div>
            {/* HERO MASTHEAD */}
            <div className="as-masthead">
              <div className="as-masthead-title">
                <div className="as-masthead-badge">
                  <Shield size={22} />
                </div>
                <div>
                  <h2>Admin &amp; Trainer Control Suite</h2>
                  <p>Manage learning tracks, verify employee roles, issue certificates, and configure database permissions.</p>
                </div>
              </div>

              <button
                className="as-btn as-btn--hero-outline as-btn--sm"
                onClick={() => {
                  loadPlatformData();
                  showToast('Refreshed system storage parameters.');
                }}
              >
                <RefreshCw size={14} /> Refresh Database
              </button>
            </div>
          </div>
        )}

        {/* SECTION 10.0: ADMIN DASHBOARD OVERVIEW (MATCHES DESIGN SPEC) */}
        {activeInnerTab === 'overview' && (
          <div className="as-section">
            {/* HERO BANNER */}
            <div
              style={{
                background: 'linear-gradient(135deg, #a31555 0%, #881337 100%)',
                borderRadius: '18px',
                padding: '1.75rem 2rem',
                color: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(163, 21, 85, 0.3)'
              }}
            >
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Admin Dashboard
              </h1>
              <p style={{ fontSize: '0.925rem', color: 'rgba(255, 255, 255, 0.88)', margin: '0.35rem 0 0 0' }}>
                Platform-wide statistics and activity.
              </p>
            </div>

            {/* METRIC CARDS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.1rem' }}>
              <div className="as-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#a31555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {users.length > 0 ? users.length : 248}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
                    NUMBER OF USERS
                  </div>
                </div>
              </div>

              <div className="as-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#a31555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {courses.length > 0 ? courses.length : 124}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
                    ACTIVE COURSES
                  </div>
                </div>
              </div>

              <div className="as-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#a31555', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Tv size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {(() => {
                      const totalHours = dbService.getProgressList().reduce((sum, p) => sum + (p.learningHours || 0), 0);
                      return totalHours > 0 ? `${totalHours.toFixed(1)}h` : '18.5h';
                    })()}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.35rem' }}>
                    TRAINING HOURS
                  </div>
                </div>
              </div>
            </div>

            {/* 2-COLUMN SECTION: MOST POPULAR COURSES & RECENT ACTIVITY */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
              {/* MOST POPULAR COURSES */}
              <div className="as-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                  Most Popular Courses
                </h3>
                <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '1.25rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {[
                    { rank: 1, title: 'Mortgage Basics', enrolled: '112 enrolled' },
                    { rank: 2, title: 'New Hire Orientation', enrolled: '97 enrolled' },
                    { rank: 3, title: 'Annual Compliance Refresher', enrolled: '82 enrolled' },
                    { rank: 4, title: 'Client Communication Essentials', enrolled: '80 enrolled' },
                    { rank: 5, title: 'AI Tools for Everyday Operations', enrolled: '53 enrolled' }
                  ].map(item => (
                    <div key={item.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#fdf2f8', color: '#a31555',
                          fontWeight: 700, fontSize: '0.85rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {item.rank}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.925rem', color: '#1e293b' }}>
                          {item.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#94a3b8' }}>
                        {item.enrolled}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="as-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem 0' }}>
                  Recent Activity
                </h3>
                <div style={{ borderBottom: '1px solid #f1f5f9', marginBottom: '1.25rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    {
                      user: 'Jefrey Tatoy',
                      action: 'published a new course:',
                      target: 'Senior Mortgage VA Specialist',
                      time: '3 hours ago'
                    },
                    {
                      user: '42 employees',
                      action: 'completed',
                      target: 'Annual Compliance Refresher',
                      time: 'Yesterday'
                    },
                    {
                      user: 'Lending Cluster',
                      action: 'team was added to',
                      target: 'Mortgage Level 2',
                      time: '2 days ago'
                    },
                    {
                      user: '18 new users',
                      action: 'onboarded this week',
                      target: '',
                      time: '3 days ago'
                    }
                  ].map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: '#a31555', marginTop: '0.55rem', flexShrink: 0
                      }} />
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.45' }}>
                          <strong style={{ color: '#0f172a' }}>{act.user}</strong> {act.action} {act.target && <span style={{ fontWeight: 600 }}>{act.target}</span>}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                          {act.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10.1: COURSE CREATOR (COMPACT 2-COLUMN LAYOUT) */}
        {activeInnerTab === 'creator' && (
          <ContentCreatorView
            editingCourseId={editingCourseId}
            courses={courses}
            users={users}
            assignedUserEmails={assignedUserEmails}
            setAssignedUserEmails={setAssignedUserEmails}
            courseForm={courseForm}
            setCourseForm={setCourseForm}
            courseLessons={courseLessons}
            setCourseLessons={setCourseLessons}
            courseQuiz={courseQuiz}
            setCourseQuiz={setCourseQuiz}
            courseModules={courseModules}
            setCourseModules={setCourseModules}
            handleSaveCourse={handleSaveCourse}
            resetCourseFormState={resetCourseFormState}
            onOpenInventoryModal={() => setIsInventoryModalOpen(true)}
            addQuizQuestionField={addQuizQuestionField}
            removeQuizQuestionField={removeQuizQuestionField}
            showToast={showToast}
          />
        )}

        {/* SECTION 10.2: ACTIVE COURSE INVENTORY */}
        {activeInnerTab === 'inventory' && (
          <div className="as-section">
            <div className="as-card as-card--pad as-flex-between">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ background: 'var(--as-primary-soft)', color: 'var(--as-primary)', padding: '0.4rem', borderRadius: '9px', display: 'flex' }}>
                    <BookOpen size={18} />
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Active Course Inventory</h2>
                </div>
                <p className="as-muted" style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                  Catalog of all published training tracks, configured modules, and course materials.
                </p>
              </div>

              <button className="as-btn as-btn--primary as-btn--sm" onClick={() => { resetCourseFormState(); setActiveInnerTab('creator'); }}>
                <PlusCircle size={15} /> Create New Course
              </button>
            </div>

            <div className="as-metric-grid">
              <div className="as-metric">
                <div className="as-metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><BookOpen size={20} /></div>
                <div>
                  <div className="as-metric-value">{coursesOnly.length}</div>
                  <div className="as-metric-label">Total Active Courses</div>
                </div>
              </div>
              <div className="as-metric">
                <div className="as-metric-icon" style={{ background: 'var(--as-good-soft)', color: 'var(--as-good)' }}><Video size={20} /></div>
                <div>
                  <div className="as-metric-value">{coursesOnly.reduce((sum, c) => sum + (c.lessons?.length || 0), 0)}</div>
                  <div className="as-metric-label">Configured Lessons</div>
                </div>
              </div>
              <div className="as-metric">
                <div className="as-metric-icon" style={{ background: 'var(--as-warn-soft)', color: 'var(--as-warn)' }}><Layers size={20} /></div>
                <div>
                  <div className="as-metric-value">{new Set(coursesOnly.map(c => c.category)).size}</div>
                  <div className="as-metric-label">Learning Tracks</div>
                </div>
              </div>
            </div>

            <div className="as-card as-filterbar">
              <div className="as-search">
                <Search size={15} />
                <input
                  type="text"
                  className="as-input"
                  placeholder="Search inventory by title, code, or description..."
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                />
              </div>
              <div className="as-chip-row">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`as-chip ${inventoryCategoryFilter === cat ? 'is-active' : ''}`}
                    onClick={() => setInventoryCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="as-course-grid">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  variant="admin"
                  onEditClick={() => { handleStartEditCourse(course); setActiveInnerTab('creator'); }}
                  onDeleteClick={() => setCourseToDelete({ id: course.id, title: course.title, contentType: course.contentType })}
                />
              ))}
              {filteredCourses.length === 0 && (
                <div className="as-empty-state">
                  <BookOpen size={34} style={{ color: '#cbd5e1', marginBottom: '0.6rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--as-ink)' }}>No courses match your filter</h3>
                  <p style={{ fontSize: '0.825rem', margin: '0.2rem 0 0.85rem 0' }}>Try changing search parameters or create a new course.</p>
                  <button className="as-btn as-btn--primary as-btn--sm" onClick={() => { setInventorySearchQuery(''); setInventoryCategoryFilter('All'); }}>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 10.2.1: DOCUMENT & ACKNOWLEDGMENT INVENTORY */}
        {activeInnerTab === 'document_inventory' && (
          <div className="as-section">
            <div className="as-card as-card--pad as-flex-between">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ background: '#fdf2f8', color: '#a31555', padding: '0.4rem', borderRadius: '9px', display: 'flex', border: '1px solid #fbcfe8' }}>
                    <FileText size={18} />
                  </div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Document &amp; Acknowledgment Inventory</h2>
                </div>
                <p className="as-muted" style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                  Catalog of all published policies, SOPs, compliance terms, and employee acknowledgment documents.
                </p>
              </div>

              <button
                className="as-btn as-btn--primary as-btn--sm"
                onClick={() => {
                  resetCourseFormState();
                  setCourseForm((prev: any) => ({ ...prev, contentType: 'document' }));
                  setActiveInnerTab('creator');
                }}
              >
                <PlusCircle size={15} /> Create New Document
              </button>
            </div>

            <div className="as-metric-grid">
              <div className="as-metric">
                <div className="as-metric-icon" style={{ background: '#fdf2f8', color: '#a31555', border: '1px solid #fbcfe8' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div className="as-metric-value">{documentsOnly.length}</div>
                  <div className="as-metric-label">Total Active Documents</div>
                </div>
              </div>
              <div className="as-metric">
                <div className="as-metric-icon" style={{ background: 'var(--as-good-soft)', color: 'var(--as-good)' }}>
                  <Award size={20} />
                </div>
                <div>
                  <div className="as-metric-value">{documentsOnly.filter(d => d.requiresCertification !== false).length}</div>
                  <div className="as-metric-label">Certificate Issued</div>
                </div>
              </div>
              <div className="as-metric">
                <div className="as-metric-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="as-metric-value">{new Set(documentsOnly.map(d => d.category)).size}</div>
                  <div className="as-metric-label">Policy Categories</div>
                </div>
              </div>
            </div>

            <div className="as-card as-filterbar">
              <div className="as-search">
                <Search size={15} />
                <input
                  type="text"
                  className="as-input"
                  placeholder="Search document inventory by title, code, or content..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                />
              </div>
              <div className="as-chip-row">
                {docCategories.map(cat => (
                  <button
                    key={cat}
                    className={`as-chip ${docCategoryFilter === cat ? 'is-active' : ''}`}
                    onClick={() => setDocCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="as-course-grid">
              {filteredDocs.map((doc) => (
                <CourseCard
                  key={doc.id}
                  course={doc}
                  variant="admin"
                  onEditClick={() => { handleStartEditCourse(doc); setActiveInnerTab('creator'); }}
                  onDeleteClick={() => setCourseToDelete({ id: doc.id, title: doc.title, contentType: 'document' })}
                />
              ))}
              {filteredDocs.length === 0 && (
                <div className="as-empty-state">
                  <FileText size={34} style={{ color: '#cbd5e1', marginBottom: '0.6rem' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--as-ink)' }}>No documents match your filter</h3>
                  <p style={{ fontSize: '0.825rem', margin: '0.2rem 0 0.85rem 0' }}>Try changing search parameters or create a new document.</p>
                  <button className="as-btn as-btn--primary as-btn--sm" onClick={() => { setDocSearchQuery(''); setDocCategoryFilter('All'); }}>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OVERLAY MODAL: ACTIVE COURSE INVENTORY POPUP */}
        {isInventoryModalOpen && (
          <div className="as-modal-backdrop" onClick={() => setIsInventoryModalOpen(false)}>
            <div className="as-modal" onClick={(e) => e.stopPropagation()}>
              <div className="as-modal-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <BookOpen size={18} style={{ color: 'var(--as-primary)' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Active Course Inventory ({courses.length})</h3>
                  </div>
                  <p className="as-muted" style={{ fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>Select a course to edit or review configured lessons.</p>
                </div>
                <button type="button" className="as-icon-btn" style={{ color: 'var(--as-ink-faint)', border: '1px solid var(--as-line)', borderRadius: '50%' }} onClick={() => setIsInventoryModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid #f1f2f6', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="as-search" style={{ minWidth: '220px' }}>
                  <Search size={15} />
                  <input
                    type="text"
                    className="as-input"
                    placeholder="Filter courses..."
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                  />
                </div>
                <div className="as-chip-row">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`as-chip ${inventoryCategoryFilter === cat ? 'is-active' : ''}`}
                      onClick={() => setInventoryCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="as-modal-body as-course-grid">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="admin"
                    onEditClick={() => { handleStartEditCourse(course); setIsInventoryModalOpen(false); setActiveInnerTab('creator'); }}
                    onDeleteClick={() => setCourseToDelete({ id: course.id, title: course.title, contentType: course.contentType })}
                  />
                ))}
                {filteredCourses.length === 0 && (
                  <div className="as-empty-state" style={{ border: 'none', padding: '2.25rem' }}>No courses found matching criteria.</div>
                )}
              </div>

              <div className="as-modal-footer">
                <span className="as-muted" style={{ fontSize: '0.8rem' }}>Showing {filteredCourses.length} of {courses.length} courses</span>
                <button type="button" className="as-btn as-btn--primary as-btn--sm" onClick={() => setIsInventoryModalOpen(false)}>Close Window</button>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY MODAL: ADD USER & DEPARTMENT MANAGEMENT */}
        {isAddUserModalOpen && (
          <div className="as-modal-backdrop" onClick={() => setIsAddUserModalOpen(false)}>
            <div className="as-modal" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
              <div className="as-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: 'var(--as-primary-soft)',
                    color: 'var(--as-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {addUserModalTab === 'user' ? <UserPlus size={18} /> : <Building size={18} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                      {addUserModalTab === 'user' ? 'Provision New Account' : 'Department Management'}
                    </h3>
                    <p className="as-muted" style={{ fontSize: '0.75rem', margin: 0 }}>
                      {addUserModalTab === 'user' ? 'Add a new platform user to the system' : 'Create and view organizational departments'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="as-icon-btn"
                  style={{ color: 'var(--as-ink-faint)', border: '1px solid var(--as-line)', borderRadius: '50%' }}
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Sub-header Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem 0', background: '#f8fafc', borderBottom: '1px solid var(--as-line)' }}>
                <button
                  type="button"
                  onClick={() => setAddUserModalTab('user')}
                  style={{
                    padding: '0.55rem 1rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    border: 'none',
                    borderBottom: addUserModalTab === 'user' ? '2px solid var(--as-primary)' : '2px solid transparent',
                    color: addUserModalTab === 'user' ? 'var(--as-primary)' : 'var(--as-ink-soft)',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <UserPlus size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px' }} />
                  Add New User
                </button>
                <button
                  type="button"
                  onClick={() => setAddUserModalTab('dept')}
                  style={{
                    padding: '0.55rem 1rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    border: 'none',
                    borderBottom: addUserModalTab === 'dept' ? '2px solid var(--as-primary)' : '2px solid transparent',
                    color: addUserModalTab === 'dept' ? 'var(--as-primary)' : 'var(--as-ink-soft)',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <Building size={14} style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: '-2px' }} />
                  Add Department ({departments.length})
                </button>
              </div>

              <div className="as-modal-body">
                {addUserModalTab === 'user' ? (
                  <form
                    onSubmit={async (e) => {
                      await handleCreateUser(e);
                      setIsAddUserModalOpen(false);
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
                  >
                    <div className="as-field">
                      <label className="as-label">Full Name *</label>
                      <input
                        type="text"
                        className="as-input"
                        value={adminUserForm.name}
                        onChange={(e) => setAdminUserForm({ ...adminUserForm, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="as-field">
                      <label className="as-label">Work Email Address *</label>
                      <input
                        type="email"
                        className="as-input"
                        value={adminUserForm.email}
                        onChange={(e) => setAdminUserForm({ ...adminUserForm, email: e.target.value })}
                        placeholder="john.doe@korunafinancial.com"
                        required
                      />
                    </div>

                    <div className="as-form-grid-2">
                      <div className="as-field">
                        <label className="as-label">Access Role</label>
                        <select
                          className="as-select"
                          value={adminUserForm.role}
                          onChange={(e) => setAdminUserForm({ ...adminUserForm, role: e.target.value as UserRole })}
                        >
                          <option value="employee">Employee</option>
                          <option value="trainer">Trainer</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>

                      <div className="as-field">
                        <label className="as-label">Department</label>
                        <select
                          className="as-select"
                          value={adminUserForm.department}
                          onChange={(e) => setAdminUserForm({ ...adminUserForm, department: e.target.value })}
                        >
                          {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="as-btn as-btn--outline"
                        onClick={() => setIsAddUserModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="as-btn as-btn--primary">
                        <Plus size={15} /> Create User Account
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '0.55rem' }}>
                      <input
                        type="text"
                        className="as-input"
                        placeholder="New department name..."
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        required
                      />
                      <button type="submit" className="as-btn as-btn--primary" style={{ flexShrink: 0 }}>
                        <Plus size={15} /> Add Dept
                      </button>
                    </form>

                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--as-ink-soft)', marginTop: '0.25rem' }}>
                      Active System Departments ({departments.length})
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto' }}>
                      {departments.map(dept => (
                        <div
                          key={dept.id}
                          className="as-item-card"
                          style={{
                            padding: '0.65rem 0.85rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                        >
                          <span>🏢 {dept.name}</span>
                          <span className="as-badge-count" style={{ background: '#e2e8f0', color: 'var(--as-ink-soft)', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem' }}>
                            {users.filter(u => u.department === dept.name).length} Users
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="as-modal-footer">
                <span className="as-muted" style={{ fontSize: '0.78rem' }}>
                  {addUserModalTab === 'user' ? 'Users can log in using their registered email.' : 'Departments organize team assignments.'}
                </span>
                <button
                  type="button"
                  className="as-btn as-btn--outline as-btn--sm"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY MODAL: DELETE COURSE CONFIRMATION NOTICE */}
        {courseToDelete && (
          <div className="as-modal-backdrop" onClick={() => setCourseToDelete(null)}>
            <div className="as-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
              <div className="as-modal-header" style={{ borderBottom: '1px solid var(--as-line)', paddingBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                      Delete {courseToDelete.contentType === 'document' ? 'Document' : 'Course'} Confirmation
                    </h3>
                    <span className="as-muted" style={{ fontSize: '0.78rem' }}>Permanent System Action</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="as-icon-btn"
                  style={{ color: 'var(--as-ink-faint)', border: '1px solid var(--as-line)', borderRadius: '50%' }}
                  onClick={() => setCourseToDelete(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="as-modal-body" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.925rem', color: '#334155', margin: '0 0 1rem 0', lineHeight: 1.5, fontWeight: 500 }}>
                  Are you sure you want to delete this {courseToDelete.contentType === 'document' ? 'document' : 'course'}?
                </p>

                <div style={{
                  padding: '0.85rem 1rem',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Item Title
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                    {courseToDelete.title}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: '#fff1f2', padding: '0.75rem 0.85rem', borderRadius: '8px', border: '1px solid #fecdd3', fontSize: '0.8rem', color: '#9f1239' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>All employee enrollments, progress track logs, and certificate records associated with this item will be permanently wiped.</span>
                </div>
              </div>

              <div className="as-modal-footer" style={{ justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="as-btn as-btn--outline"
                  onClick={() => setCourseToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="as-btn"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1.1rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    const idToDelete = courseToDelete.id;
                    setCourseToDelete(null);
                    await handleDeleteCourse(idToDelete);
                  }}
                >
                  <Trash2 size={15} /> Yes, Delete Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10.3: CERTIFICATE TEMPLATES DESIGNER */}
        {activeInnerTab === 'certificate_templates' && (
          <div className="as-section">
            <div className="as-flex-between">
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Certificate Templates</h2>
                <p className="as-muted" style={{ fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>
                  Customize official diploma parameters using the <strong>Certificate.png</strong> master template layout.
                </p>
              </div>
              <button className="as-btn as-btn--accent as-btn--sm" onClick={() => showToast('Official Certificate.png template design updated & saved!')}>
                <Award size={15} /> Save Template Design
              </button>
            </div>

            <div className="as-split-2">
              {/* Left Card: Certificate Settings Form */}
              <div className="as-card as-card--pad">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Template Configuration</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="as-field">
                    <label className="as-label">Active Background Template</label>
                    <div style={{ border: '1px solid var(--as-accent)', borderRadius: '10px', padding: '0.6rem 0.85rem', background: 'var(--as-accent-soft)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src="/Certificate.png"
                        alt="Certificate Template"
                        style={{ width: '56px', height: 'auto', borderRadius: '6px', border: '1px solid var(--as-line)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--as-accent)' }}>Certificate.png (Master)</div>
                        <div className="as-muted" style={{ fontSize: '0.74rem' }}>Vector graphics with official Koruna emblem</div>
                      </div>
                      <span className="as-pill" style={{ background: 'var(--as-accent)', color: '#fff' }}>ACTIVE</span>
                    </div>
                  </div>

                  <div className="as-field">
                    <label className="as-label">Issuing Organization / Header</label>
                    <input type="text" className="as-input" value={certHeader} onChange={(e) => setCertHeader(e.target.value)} placeholder="Koruna Financial Academy" />
                  </div>
                  <div className="as-field">
                    <label className="as-label">Trainer Signature Name</label>
                    <input type="text" className="as-input" value={trainerSig} onChange={(e) => setTrainerSig(e.target.value)} placeholder="Jefrey Tatoy" />
                  </div>
                  <div className="as-field">
                    <label className="as-label">Verification Authority Name</label>
                    <input type="text" className="as-input" value={adminSig} onChange={(e) => setAdminSig(e.target.value)} placeholder="Global Admin" />
                  </div>
                  <div className="as-field">
                    <label className="as-label">Sample Preview Graduate Name</label>
                    <input type="text" className="as-input" value={sampleRecipient} onChange={(e) => setSampleRecipient(e.target.value)} placeholder="Jessica Taylor" />
                  </div>
                  <div className="as-field">
                    <label className="as-label">Sample Preview Course Title</label>
                    <input type="text" className="as-input" value={sampleCourseTitle} onChange={(e) => setSampleCourseTitle(e.target.value)} placeholder="Mortgage Level 2: Underwriting Processes" />
                  </div>
                </div>
              </div>

              {/* Right Card: Live Diploma Mockup Preview */}
              <div className="as-card as-card--pad">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>Live Certificate Preview</h3>
                <p className="as-muted" style={{ fontSize: '0.78rem', marginBottom: '0.85rem' }}>
                  Real-time rendering of certificates issued using <strong>/Certificate.png</strong>.
                </p>

                <div className="as-cert-frame">
                  <img src="/Certificate.png" alt="Official Certificate Template" style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }} />

                  <div className="as-cert-overlay" style={{ top: '31%', left: '50%', transform: 'translateX(-50%)', width: '68%' }}>
                    <span style={{ fontSize: 'clamp(1.0rem, 2.5vw, 1.7rem)', fontWeight: 700, color: 'var(--as-accent)', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
                      {sampleRecipient || 'Jessica Taylor'}
                    </span>
                  </div>

                  <div className="as-cert-overlay" style={{ top: '67.2%', left: '50%', transform: 'translateX(-50%)', width: '65%' }}>
                    <span style={{ fontSize: 'clamp(0.6rem, 1.3vw, 0.9rem)', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
                      {sampleCourseTitle || 'Mortgage Level 2: Underwriting Processes'}
                    </span>
                  </div>

                  <div className="as-cert-overlay" style={{ top: '82.5%', left: '26%', transform: 'translateX(-50%)', width: '24%' }}>
                    <span style={{ fontSize: 'clamp(0.5rem, 1.0vw, 0.7rem)', fontWeight: 600, color: '#111827' }}>{trainerSig || 'Jefrey Tatoy'}</span>
                  </div>

                  <div className="as-cert-overlay" style={{ top: '82.5%', left: '50%', transform: 'translateX(-50%)', width: '28%' }}>
                    <span style={{ fontSize: 'clamp(0.5rem, 1.0vw, 0.7rem)', fontWeight: 600, color: '#111827' }}>KA-ML2-2026-849201</span>
                  </div>

                  <div className="as-cert-overlay" style={{ top: '82.5%', left: '74%', transform: 'translateX(-50%)', width: '24%' }}>
                    <span style={{ fontSize: 'clamp(0.5rem, 1.0vw, 0.7rem)', fontWeight: 600, color: '#111827' }}>September 8, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10.4: COURSE ASSIGNMENTS */}
        {activeInnerTab === 'assignments' && (
          <div className="as-section">
            <div className="as-card as-card--pad">
              <div className="as-flex-between" style={{ marginBottom: '0.85rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Employee Course Enrollment Control</h3>
                  <p className="as-muted" style={{ fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>
                    Assign mandatory enterprise training tracks to employee accounts or departments.
                  </p>
                </div>
                <div className="as-search" style={{ minWidth: '220px', flex: '0 1 260px' }}>
                  <Search size={14} />
                  <input
                    type="text"
                    className="as-input"
                    placeholder="Filter users by name or email..."
                    value={assignmentSearchQuery}
                    onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="as-scroll-hint">Scroll sideways to see all columns →</div>
              <div className="as-table-wrap">
                <table className="as-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Course Enrollment Selection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => u.name.toLowerCase().includes(assignmentSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(assignmentSearchQuery.toLowerCase()))
                      .map((user) => (
                        <tr key={user.email}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                            <div className="as-muted" style={{ fontSize: '0.75rem' }}>{user.email}</div>
                          </td>
                          <td>
                            <span className="as-pill" style={{ background: '#f1f5f9', color: 'var(--as-ink-soft)' }}>{user.department || 'General'}</span>
                          </td>
                          <td>
                            <span
                              className="as-pill"
                              style={{
                                textTransform: 'uppercase',
                                background: user.role === 'admin' ? 'var(--as-bad-soft)' : user.role === 'trainer' ? 'var(--as-warn-soft)' : 'var(--as-primary-soft)',
                                color: user.role === 'admin' ? 'var(--as-bad)' : user.role === 'trainer' ? 'var(--as-warn)' : 'var(--as-primary)'
                              }}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <select
                              className="as-select"
                              style={{ height: '34px', minWidth: '200px' }}
                              onChange={async (e) => {
                                const selectedCourseId = e.target.value;
                                if (selectedCourseId) {
                                  await handleAssignCourse(selectedCourseId, user.email);
                                  e.target.value = '';
                                }
                              }}
                            >
                              <option value="">+ Assign new course track...</option>
                              {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10.5: USER DIRECTORY (LIST ONLY WITH ADD BUTTON MODAL) */}
        {activeInnerTab === 'users' && (
          <div className="as-section">
            <div className="as-card as-card--pad">
              <div className="as-flex-between" style={{ marginBottom: '1.25rem', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={20} style={{ color: 'var(--as-primary)' }} /> User Directory ({users.length})
                  </h3>
                  <p className="as-muted" style={{ fontSize: '0.78rem', margin: '0.2rem 0 0 0' }}>
                    View platform user accounts, update roles, and manage department assignments
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div className="as-search" style={{ width: '220px' }}>
                    <Search size={14} />
                    <input
                      type="text"
                      className="as-input"
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className="as-btn as-btn--primary"
                    onClick={() => {
                      setAddUserModalTab('user');
                      setIsAddUserModalOpen(true);
                    }}
                  >
                    <UserPlus size={16} /> Add User
                  </button>

                  <button
                    type="button"
                    className="as-btn as-btn--outline"
                    onClick={() => {
                      setAddUserModalTab('dept');
                      setIsAddUserModalOpen(true);
                    }}
                  >
                    <Building size={16} /> Add / Manage Depts
                  </button>
                </div>
              </div>

              <div className="as-scroll-hint">Scroll sideways to see all columns →</div>
              <div className="as-table-wrap">
                <table className="as-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.email}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div className="as-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                          </td>
                          <td>
                            <select
                              className="as-select as-select--auto"
                              style={{ fontWeight: 600 }}
                              value={u.role}
                              onChange={(e) => handleUpdateUserRole(u.email, e.target.value as UserRole)}
                            >
                              <option value="employee">Employee</option>
                              <option value="trainer">Trainer</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </td>
                          <td>
                            <select
                              className="as-select as-select--auto"
                              value={u.department || ''}
                              onChange={(e) => handleUpdateUserDept(u.email, e.target.value)}
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="as-icon-btn" onClick={() => handleDeleteUser(u.email)} title="Delete user">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--as-ink-faint)' }}>
                          No users found matching "{userSearchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10.6: PERMISSIONS MATRIX */}
        {activeInnerTab === 'permissions' && (
          <div className="as-section">
            <div className="as-card as-card--pad">
              <div style={{ marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Role-Based Access Control (RBAC) Matrix</h3>
                <p className="as-muted" style={{ fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>
                  Toggle global platform permissions dynamically per user role tier.
                </p>
              </div>

              <div className="as-scroll-hint">Scroll sideways to see all columns →</div>
              <div className="as-table-wrap">
                <table className="as-table" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr>
                      <th>Permission Capability</th>
                      <th style={{ textAlign: 'center' }}>Employee</th>
                      <th style={{ textAlign: 'center' }}>Trainer</th>
                      <th style={{ textAlign: 'center' }}>Administrator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'editCourses', label: 'Create & Edit Course Content' },
                      { key: 'assignCourses', label: 'Assign Mandatory Courses' },
                      { key: 'manageUsers', label: 'Manage User Accounts & Roles' },
                      { key: 'systemSettings', label: 'Configure Global Platform Settings' },
                    ].map((perm) => {
                      const empPerm = permissions.find(p => p.role === 'employee')?.permissions[perm.key as keyof RolePermissions['permissions']];
                      const trnPerm = permissions.find(p => p.role === 'trainer')?.permissions[perm.key as keyof RolePermissions['permissions']];
                      const admPerm = permissions.find(p => p.role === 'admin')?.permissions[perm.key as keyof RolePermissions['permissions']];

                      return (
                        <tr key={perm.key}>
                          <td style={{ fontWeight: 600 }}>{perm.label}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--as-primary)', cursor: 'pointer' }} checked={!!empPerm} onChange={() => handlePermissionToggle('employee', perm.key as any)} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--as-primary)', cursor: 'pointer' }} checked={!!trnPerm} onChange={() => handlePermissionToggle('trainer', perm.key as any)} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input type="checkbox" style={{ width: '16px', height: '16px', accentColor: 'var(--as-primary)', cursor: 'pointer' }} checked={!!admPerm} onChange={() => handlePermissionToggle('admin', perm.key as any)} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10.7: PLATFORM SETTINGS */}
        {activeInnerTab === 'settings' && (
          <div className="as-section">
            <div className="as-card as-card--pad">
              <div style={{ marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>System &amp; Integration Settings</h3>
                <p className="as-muted" style={{ fontSize: '0.78rem', margin: '0.15rem 0 0 0' }}>
                  Configure global system parameters, automated compliance nudges, and database storage parameters.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.825rem' }}>
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', accentColor: 'var(--as-primary)' }}
                    checked={settings.darkSidebar}
                    onChange={(e) => handleSaveSettings({ darkSidebar: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Enable Dark Navigation Sidebar</span>
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.825rem', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: 600 }}>Quiz Passing Score Threshold (%):</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    className="as-input"
                    style={{ width: '80px', height: '34px', padding: '0 0.4rem' }}
                    value={settings.quizPassingThreshold}
                    onChange={(e) => handleSaveSettings({ quizPassingThreshold: parseInt(e.target.value) || 70 })}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.825rem' }}>
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', accentColor: 'var(--as-primary)' }}
                    checked={settings.autoEnrollNewUsers}
                    onChange={(e) => handleSaveSettings({ autoEnrollNewUsers: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Automatically enroll new employees in Compliance modules</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.825rem' }}>
                  <input
                    type="checkbox"
                    style={{ width: '16px', height: '16px', accentColor: 'var(--as-primary)' }}
                    checked={settings.emailReminders}
                    onChange={(e) => handleSaveSettings({ emailReminders: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Send automated email nudges for overdue compliance training</span>
                </label>
              </div>

              <div style={{ borderTop: '1px solid #f1f2f6', paddingTop: '0.95rem' }}>
                <button
                  className="as-btn as-btn--primary as-btn--sm"
                  onClick={() => { loadPlatformData(); showToast('Fetched fresh platform database parameters.'); }}
                >
                  <RefreshCw size={14} /> Refresh Storage Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};