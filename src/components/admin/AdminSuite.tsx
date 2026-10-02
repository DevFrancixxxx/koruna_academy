import React from 'react';
import {
  Trash2,
  RefreshCw,
  Plus,
  Award,
  X,
  UserPlus,
  Building,
  AlertTriangle
} from 'lucide-react';
import type { UserSessionData, UserRole } from '../../services/auth';
import { dbService, type Course, type QuizQuestion, type Department, type SystemSettings, type RolePermissions, type DatabaseUser } from '../../services/db';
import { ContentCreatorView } from './ContentCreatorView';
import { AdminOverviewView } from './AdminOverviewView';
import { CourseInventoryView } from './CourseInventoryView';
import { DocumentInventoryView } from './DocumentInventoryView';
import { CertificateTemplateView } from './CertificateTemplateView';
import { AdminAssignmentsView } from './AdminAssignmentsView';
import { UserDirectoryView } from './UserDirectoryView';
import { PermissionsMatrixView } from './PermissionsMatrixView';
import { PlatformSettingsView } from './PlatformSettingsView';
import { CourseCard } from '../courses/CourseCard';

interface AdminSuiteProps {
  userSession: UserSessionData;
  userPerms: RolePermissions['permissions'];
  courses: Course[];
  users: DatabaseUser[];
  departments: Department[];
  permissions: RolePermissions[];
  settings: SystemSettings;
  teamProgress: any;
  activeInnerTab: string;
  setActiveInnerTab: (tab: string) => void;
  editingCourseId: string | null;
  setEditingCourseId: (id: string | null) => void;
  assignedUserEmails: string[];
  setAssignedUserEmails: React.Dispatch<React.SetStateAction<string[]>>;
  courseForm: any;
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  courseLessons: any[];
  setCourseLessons: React.Dispatch<React.SetStateAction<any>>;
  courseQuiz: QuizQuestion[];
  setCourseQuiz: React.Dispatch<React.SetStateAction<QuizQuestion[]>>;
  courseModules: any[];
  setCourseModules: React.Dispatch<React.SetStateAction<any[]>>;
  adminUserForm: any;
  setAdminUserForm: React.Dispatch<React.SetStateAction<any>>;
  newDeptName: string;
  setNewDeptName: React.Dispatch<React.SetStateAction<string>>;
  handleSaveCourse: (e: React.FormEvent) => Promise<void>;
  handleStartEditCourse: (course: Course) => void;
  handleDeleteCourse: (courseId: string) => Promise<void>;
  handleAssignCourse: (courseId: string, userEmail: string) => Promise<void>;
  handleCreateUser: (e: React.FormEvent) => Promise<void>;
  handleAddDept: (e: React.FormEvent) => void | Promise<void>;
  handleUpdateUserDept: (email: string, department: string) => Promise<void>;
  handleUpdateUserRole: (email: string, role: UserRole) => Promise<void>;
  handleDeleteUser: (email: string) => Promise<void>;
  handlePermissionToggle: (role: UserRole, capability: keyof RolePermissions['permissions']) => void | Promise<void>;
  handleSaveSettings: (newSettings: Partial<SystemSettings>) => void | Promise<void>;
  addQuizQuestionField: () => void;
  removeQuizQuestionField: (index: number) => void;
  showToast: (msg: string) => void;
  loadPlatformData: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                    */
/* -------------------------------------------------------------------------- */
const AdminSuiteStyles = () => (
  <style>{`
    .as-root {
      --ink: #111827;
      --ink-2: #4b5563;
      --ink-3: #6b7280;
      --line: #e5e7eb;
      --line-soft: #f1f2f4;
      --surface: #ffffff;
      --bg: #f7f7f8;
      --brand: #a31555;
      --brand-dark: #85104a;
      --brand-tint: #fbeef4;
      --danger: #b91c1c;
      --danger-tint: #fef2f2;
      --ok: #15803d;
      --ok-tint: #f0fdf4;
      --warn: #b45309;
      --warn-tint: #fffbeb;
      --r-sm: 8px;
      --r-md: 12px;
      font-family: Inter, system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--ink);
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 1.5rem 3rem;
    }
    .as-root *, .as-root *::before, .as-root *::after { box-sizing: border-box; }
    .as-root h1, .as-root h2, .as-root h3, .as-root h4, .as-root p { margin: 0; }

    /* Page header */
    .as-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .as-title { font-size: 1.375rem; font-weight: 650; letter-spacing: -0.015em; }
    .as-subtitle { color: var(--ink-3); margin-top: 0.25rem; max-width: 60ch; }
    .as-header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }

    .as-stack { display: flex; flex-direction: column; gap: 1.25rem; }
    .as-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-md); }
    .as-card-body { padding: 1.25rem; }
    .as-card-title { font-size: 1rem; font-weight: 600; }
    .as-card-desc { color: var(--ink-3); margin-top: 0.15rem; font-size: 0.8125rem; }
    .as-card-head { padding: 1rem 1.25rem; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }

    /* Buttons */
    .as-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      height: 36px; padding: 0 0.9rem; border-radius: var(--r-sm);
      font: inherit; font-weight: 550; cursor: pointer; white-space: nowrap;
      border: 1px solid transparent; transition: background 0.12s, border-color 0.12s;
    }
    .as-btn:focus-visible, .as-chip:focus-visible, .as-icon-btn:focus-visible, .as-tab:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
    .as-btn--primary { background: var(--brand); color: #fff; }
    .as-btn--primary:hover { background: var(--brand-dark); }
    .as-btn--secondary { background: var(--surface); color: var(--ink); border-color: #d1d5db; }
    .as-btn--secondary:hover { background: var(--bg); }
    .as-btn--danger { background: var(--danger); color: #fff; }
    .as-btn--danger:hover { background: #991b1b; }
    .as-icon-btn {
      width: 32px; height: 32px; border-radius: var(--r-sm); border: none; background: transparent;
      display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-3);
    }
    .as-icon-btn:hover { background: var(--bg); color: var(--ink); }
    .as-icon-btn--danger:hover { background: var(--danger-tint); color: var(--danger); }

    /* Forms */
    .as-field { display: flex; flex-direction: column; gap: 0.35rem; }
    .as-label { font-size: 0.8125rem; font-weight: 550; color: var(--ink-2); }
    .as-hint { font-size: 0.75rem; color: var(--ink-3); }
    .as-input, .as-select {
      height: 36px; width: 100%; padding: 0 0.75rem; font: inherit; color: var(--ink);
      background: var(--surface); border: 1px solid #d1d5db; border-radius: var(--r-sm);
    }
    .as-input:focus, .as-select:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(163, 21, 85, 0.12); }
    .as-select--inline { width: auto; min-width: 150px; }
    .as-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .as-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
    @media (max-width: 560px) { .as-grid-2 { grid-template-columns: 1fr; } }

    .as-search { position: relative; flex: 1; min-width: 200px; max-width: 360px; }
    .as-search svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--ink-3); pointer-events: none; }
    .as-search .as-input { padding-left: 2.1rem; }

    /* Stats */
    .as-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .as-stat { padding: 1rem 1.25rem; }
    .as-stat-label { color: var(--ink-3); font-size: 0.8125rem; }
    .as-stat-value { font-size: 1.75rem; font-weight: 650; letter-spacing: -0.02em; line-height: 1.2; margin-top: 0.15rem; }

    /* Toolbar and chips */
    .as-toolbar { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; padding: 0.75rem 1rem; }
    .as-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .as-chip {
      height: 30px; padding: 0 0.8rem; border-radius: 999px; font: inherit; font-size: 0.8125rem; font-weight: 550;
      border: 1px solid var(--line); background: var(--surface); color: var(--ink-2); cursor: pointer;
    }
    .as-chip:hover { background: var(--bg); }
    .as-chip.is-active { background: var(--brand-tint); border-color: var(--brand); color: var(--brand); }

    /* Course grid */
    .as-course-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }

    /* Table */
    .as-table-wrap { overflow-x: auto; }
    .as-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 620px; }
    .as-table th { padding: 0.65rem 1.25rem; font-size: 0.8125rem; font-weight: 600; color: var(--ink-3); background: var(--bg); border-bottom: 1px solid var(--line); }
    .as-table td { padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }
    .as-table tbody tr:last-child td { border-bottom: none; }
    .as-table tbody tr:hover { background: #fafafa; }
    .as-cell-name { font-weight: 600; }
    .as-cell-sub { color: var(--ink-3); font-size: 0.8125rem; }
    .as-center { text-align: center !important; }
    .as-right { text-align: right !important; }

    /* Badges */
    .as-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: var(--line-soft); color: var(--ink-2); }
    .as-badge--admin { background: var(--danger-tint); color: var(--danger); }
    .as-badge--trainer { background: var(--warn-tint); color: var(--warn); }
    .as-badge--employee { background: var(--brand-tint); color: var(--brand); }
    .as-badge--ok { background: var(--ok-tint); color: var(--ok); }

    /* Lists (dashboard) */
    .as-list { list-style: none; margin: 0; padding: 0; }
    .as-list li { display: flex; justify-content: space-between; gap: 1rem; padding: 0.7rem 1.25rem; border-bottom: 1px solid var(--line-soft); }
    .as-list li:last-child { border-bottom: none; }
    .as-list-main { font-weight: 550; }
    .as-list-meta { color: var(--ink-3); font-size: 0.8125rem; white-space: nowrap; }

    /* Settings rows */
    .as-setting { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--line-soft); }
    .as-setting:last-child { border-bottom: none; }
    .as-setting-name { font-weight: 600; }
    .as-check { width: 18px; height: 18px; accent-color: var(--brand); cursor: pointer; flex-shrink: 0; }

    /* Empty state */
    .as-empty { grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--ink-3); border: 1px dashed #d1d5db; border-radius: var(--r-md); background: var(--surface); }
    .as-empty h3 { color: var(--ink); font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .as-empty .as-btn { margin-top: 1rem; }

    /* Modal */
    .as-backdrop { position: fixed; inset: 0; background: rgba(17, 24, 39, 0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .as-modal { background: var(--surface); border-radius: 16px; width: 100%; max-width: 520px; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px -12px rgba(17, 24, 39, 0.3); }
    .as-modal--wide { max-width: 960px; }
    .as-modal-head { padding: 1rem 1.25rem; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .as-modal-body { padding: 1.25rem; overflow-y: auto; flex: 1; }
    .as-modal-foot { padding: 0.9rem 1.25rem; border-top: 1px solid var(--line); background: var(--bg); display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; }
    @media (max-width: 640px) {
      .as-backdrop { padding: 0; align-items: flex-end; }
      .as-modal { max-height: 94vh; border-radius: 16px 16px 0 0; }
    }

    /* Modal tabs */
    .as-tabs { display: flex; gap: 1.25rem; padding: 0 1.25rem; border-bottom: 1px solid var(--line); }
    .as-tab { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.75rem 0; font: inherit; font-weight: 550; color: var(--ink-3); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; margin-bottom: -1px; }
    .as-tab.is-active { color: var(--brand); border-bottom-color: var(--brand); }

    /* Certificate */
    .as-cert-frame { position: relative; overflow: hidden; border: 1px solid var(--line); border-radius: var(--r-sm); background: #fff; }
    .as-cert-overlay { position: absolute; display: flex; align-items: center; justify-content: center; text-align: center; transform: translateX(-50%); }
    .as-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 1.25rem; align-items: start; }
    @media (max-width: 920px) { .as-split { grid-template-columns: 1fr; } }
    .as-two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.25rem; align-items: start; }

    @media (prefers-reduced-motion: reduce) { .as-root * { transition: none !important; } }
  `}</style>
);

const PAGE_META: Record<string, { title: string; description: string }> = {
  overview: { title: 'Dashboard', description: 'Platform-wide statistics and recent activity.' },
  creator: { title: 'Content creator', description: 'Build courses and policy documents, then assign them to your team.' },
  inventory: { title: 'Courses', description: 'All published courses and their lessons.' },
  document_inventory: { title: 'Documents', description: 'Policies, SOPs, and acknowledgment documents.' },
  certificate_templates: { title: 'Certificate template', description: 'Set the text shown on certificates and preview the result.' },
  assignments: { title: 'Assignments', description: 'Enroll employees in courses and documents.' },
  users: { title: 'Users', description: 'Manage accounts, roles, and departments.' },
  permissions: { title: 'Permissions', description: 'Choose what each role is allowed to do.' },
  settings: { title: 'Settings', description: 'Platform-wide options and reminders.' }
};

export const AdminSuite: React.FC<AdminSuiteProps> = ({
  userSession,
  userPerms: _userPerms,
  courses,
  users,
  departments,
  permissions,
  settings,
  teamProgress: _teamProgress,
  activeInnerTab,
  setActiveInnerTab,
  editingCourseId,
  setEditingCourseId,
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
  showToast,
  loadPlatformData
}) => {
  // Certificate designer
  const [certHeader, setCertHeader] = React.useState('Koruna Financial Academy');
  const [trainerSig, setTrainerSig] = React.useState(userSession.name || 'Dr. Marcus Vance');
  const [adminSig, setAdminSig] = React.useState('Global Admin');
  const [sampleRecipient, setSampleRecipient] = React.useState('Jessica Taylor');
  const [sampleCourseTitle, setSampleCourseTitle] = React.useState('Loan Processing & Underwriting');

  // Filters and modals
  const [isInventoryModalOpen, setIsInventoryModalOpen] = React.useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [addUserModalTab, setAddUserModalTab] = React.useState<'user' | 'dept'>('user');
  const [courseToDelete, setCourseToDelete] = React.useState<{ id: string; title: string; contentType?: string } | null>(null);

  // Derived data
  const coursesOnly = courses.filter(c => c.contentType !== 'document');
  const documentsOnly = courses.filter(c => c.contentType === 'document');
  const categories = ['All', ...Array.from(new Set(coursesOnly.map(c => c.category)))];
  const docCategories = ['All', ...Array.from(new Set(documentsOnly.map(c => c.category)))];
  const totalHours = dbService.getProgressList().reduce((sum, p) => sum + (p.learningHours || 0), 0);

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
      trainer: userSession.name || '',
      attachments: [],
      contentType: 'course',
      requiresCertification: true,
      documentContent: '',
      acknowledgmentText: 'I have read, understood, and agree to the policies and terms outlined in this document.'
    });
    setCourseLessons([{ id: 'c_new-l1', title: 'Lesson 1: Introduction', content: 'Enter lesson text here.', moduleId: 'm1', moduleTitle: 'Introduction' }]);
    setCourseQuiz([]);
  };

  const meta = PAGE_META[activeInnerTab];
  const isDoc = courseToDelete?.contentType === 'document';

  // Header actions per tab
  let headerActions: React.ReactNode = null;
  if (activeInnerTab === 'inventory') {
    headerActions = (
      <button className="as-btn as-btn--primary" onClick={() => { resetCourseFormState(); setActiveInnerTab('creator'); }}>
        <Plus size={16} /> New course
      </button>
    );
  } else if (activeInnerTab === 'document_inventory') {
    headerActions = (
      <button
        className="as-btn as-btn--primary"
        onClick={() => {
          resetCourseFormState();
          setCourseForm((prev: any) => ({ ...prev, contentType: 'document' }));
          setActiveInnerTab('creator');
        }}
      >
        <Plus size={16} /> New document
      </button>
    );
  } else if (activeInnerTab === 'users') {
    headerActions = (
      <>
        <button className="as-btn as-btn--secondary" onClick={() => { setAddUserModalTab('dept'); setIsAddUserModalOpen(true); }}>
          <Building size={16} /> Departments
        </button>
        <button className="as-btn as-btn--primary" onClick={() => { setAddUserModalTab('user'); setIsAddUserModalOpen(true); }}>
          <UserPlus size={16} /> Add user
        </button>
      </>
    );
  } else if (activeInnerTab === 'certificate_templates') {
    headerActions = (
      <button className="as-btn as-btn--primary" onClick={() => showToast('Certificate template saved.')}>
        <Award size={16} /> Save template
      </button>
    );
  } else if (activeInnerTab === 'overview' || activeInnerTab === 'settings') {
    headerActions = (
      <button className="as-btn as-btn--secondary" onClick={() => { loadPlatformData(); showToast('Platform data refreshed.'); }}>
        <RefreshCw size={15} /> Refresh data
      </button>
    );
  }

  return (
    <div className="as-root">
      <AdminSuiteStyles />

      {meta && activeInnerTab !== 'creator' && (
        <div className="as-header">
          <div>
            <h1 className="as-title">{meta.title}</h1>
            {meta.description && <p className="as-subtitle">{meta.description}</p>}
          </div>
          {headerActions && <div className="as-header-actions">{headerActions}</div>}
        </div>
      )}

      {/* DASHBOARD OVERVIEW */}
      {activeInnerTab === 'overview' && (
        <AdminOverviewView users={users} courses={courses} totalHours={totalHours} />
      )}

      {/* CONTENT CREATOR */}
      {activeInnerTab === 'creator' && (
        <ContentCreatorView
          userSession={userSession}
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

      {/* COURSES INVENTORY */}
      {activeInnerTab === 'inventory' && (
        <CourseInventoryView
          coursesOnly={coursesOnly}
          categories={categories}
          handleStartEditCourse={handleStartEditCourse}
          setActiveInnerTab={setActiveInnerTab}
          setCourseToDelete={setCourseToDelete}
        />
      )}

      {/* DOCUMENT INVENTORY */}
      {activeInnerTab === 'document_inventory' && (
        <DocumentInventoryView
          documentsOnly={documentsOnly}
          docCategories={docCategories}
          handleStartEditCourse={handleStartEditCourse}
          setActiveInnerTab={setActiveInnerTab}
          setCourseToDelete={setCourseToDelete}
        />
      )}

      {/* CERTIFICATE TEMPLATE */}
      {activeInnerTab === 'certificate_templates' && (
        <CertificateTemplateView
          certHeader={certHeader}
          setCertHeader={setCertHeader}
          trainerSig={trainerSig}
          setTrainerSig={setTrainerSig}
          adminSig={adminSig}
          setAdminSig={setAdminSig}
          sampleRecipient={sampleRecipient}
          setSampleRecipient={setSampleRecipient}
          sampleCourseTitle={sampleCourseTitle}
          setSampleCourseTitle={setSampleCourseTitle}
        />
      )}

      {/* ASSIGNMENTS */}
      {activeInnerTab === 'assignments' && (
        <AdminAssignmentsView
          users={users}
          courses={courses}
          handleAssignCourse={handleAssignCourse}
        />
      )}

      {/* USER DIRECTORY */}
      {activeInnerTab === 'users' && (
        <UserDirectoryView
          users={users}
          departments={departments}
          handleUpdateUserRole={handleUpdateUserRole}
          handleUpdateUserDept={handleUpdateUserDept}
          handleDeleteUser={handleDeleteUser}
        />
      )}

      {/* PERMISSIONS MATRIX */}
      {activeInnerTab === 'permissions' && (
        <PermissionsMatrixView
          permissions={permissions}
          handlePermissionToggle={handlePermissionToggle}
        />
      )}

      {/* PLATFORM SETTINGS */}
      {activeInnerTab === 'settings' && (
        <PlatformSettingsView
          settings={settings}
          handleSaveSettings={handleSaveSettings}
        />
      )}

      {/* ------------------------------- MODALS ------------------------------- */}

      {/* Course picker modal (opened from content creator) */}
      {isInventoryModalOpen && (
        <div className="as-backdrop" onClick={() => setIsInventoryModalOpen(false)}>
          <div className="as-modal as-modal--wide" onClick={(e) => e.stopPropagation()}>
            <div className="as-modal-head">
              <div>
                <h3 className="as-card-title">Courses ({courses.length})</h3>
                <p className="as-card-desc">Choose a course to edit.</p>
              </div>
              <button type="button" className="as-icon-btn" onClick={() => setIsInventoryModalOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="as-modal-body">
              <div className="as-course-grid">
                {coursesOnly.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="admin"
                    onEditClick={() => { handleStartEditCourse(course); setIsInventoryModalOpen(false); setActiveInnerTab('creator'); }}
                    onDeleteClick={() => setCourseToDelete({ id: course.id, title: course.title, contentType: course.contentType })}
                  />
                ))}
              </div>
            </div>
            <div className="as-modal-foot">
              <button type="button" className="as-btn as-btn--secondary" onClick={() => setIsInventoryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add user / departments modal */}
      {isAddUserModalOpen && (
        <div className="as-backdrop" onClick={() => setIsAddUserModalOpen(false)}>
          <div className="as-modal" onClick={(e) => e.stopPropagation()}>
            <div className="as-modal-head">
              <div>
                <h3 className="as-card-title">{addUserModalTab === 'user' ? 'Add user' : 'Departments'}</h3>
                <p className="as-card-desc">{addUserModalTab === 'user' ? 'Create a new platform account.' : 'Create and review departments.'}</p>
              </div>
              <button type="button" className="as-icon-btn" onClick={() => setIsAddUserModalOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="as-tabs">
              <button type="button" className={`as-tab ${addUserModalTab === 'user' ? 'is-active' : ''}`} onClick={() => setAddUserModalTab('user')}>
                <UserPlus size={15} /> New user
              </button>
              <button type="button" className={`as-tab ${addUserModalTab === 'dept' ? 'is-active' : ''}`} onClick={() => setAddUserModalTab('dept')}>
                <Building size={15} /> Departments ({departments.length})
              </button>
            </div>
            <div className="as-modal-body">
              {addUserModalTab === 'user' ? (
                <form
                  id="admin-create-user-form"
                  className="as-stack"
                  style={{ gap: '1rem' }}
                  onSubmit={async (e) => {
                    await handleCreateUser(e);
                    setIsAddUserModalOpen(false);
                  }}
                >
                  <div className="as-field">
                    <label className="as-label">Full name</label>
                    <input type="text" className="as-input" required value={adminUserForm.name} onChange={(e) => setAdminUserForm({ ...adminUserForm, name: e.target.value })} placeholder="Alex Rivera" />
                  </div>
                  <div className="as-field">
                    <label className="as-label">Work email</label>
                    <input type="email" className="as-input" required value={adminUserForm.email} onChange={(e) => setAdminUserForm({ ...adminUserForm, email: e.target.value })} placeholder="alex.rivera@koruna.com" />
                  </div>
                  <div className="as-grid-2">
                    <div className="as-field">
                      <label className="as-label">Role</label>
                      <select className="as-select" value={adminUserForm.role} onChange={(e) => setAdminUserForm({ ...adminUserForm, role: e.target.value as UserRole })}>
                        <option value="employee">Employee</option>
                        <option value="trainer">Trainer</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                    <div className="as-field">
                      <label className="as-label">Department</label>
                      <select className="as-select" value={adminUserForm.department} onChange={(e) => setAdminUserForm({ ...adminUserForm, department: e.target.value })}>
                        {departments.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="as-stack" style={{ gap: '1rem' }}>
                  <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="as-input" required value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} placeholder="New department name" />
                    <button type="submit" className="as-btn as-btn--primary"><Plus size={16} /> Add</button>
                  </form>
                  <ul className="as-list" style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-sm)' }}>
                    {departments.map(d => (
                      <li key={d.id}>
                        <span className="as-list-main">{d.name}</span>
                        <span className="as-list-meta">{users.filter(u => u.department === d.name).length} users</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="as-modal-foot">
              <button type="button" className="as-btn as-btn--secondary" onClick={() => setIsAddUserModalOpen(false)}>Cancel</button>
              {addUserModalTab === 'user' && (
                <button type="submit" form="admin-create-user-form" className="as-btn as-btn--primary">Create user</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {courseToDelete && (
        <div className="as-backdrop" onClick={() => setCourseToDelete(null)}>
          <div className="as-modal" onClick={(e) => e.stopPropagation()}>
            <div className="as-modal-head">
              <div>
                <h3 className="as-card-title">Delete this {isDoc ? 'document' : 'course'}?</h3>
              </div>
              <button type="button" className="as-icon-btn" onClick={() => setCourseToDelete(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="as-modal-body">
              <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>{courseToDelete.title}</p>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', background: 'var(--danger-tint)', color: 'var(--danger)', padding: '0.75rem 0.9rem', borderRadius: 'var(--r-sm)', fontSize: '0.8125rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>This permanently removes all enrollments, progress, and certificates linked to this {isDoc ? 'document' : 'course'}. This can’t be undone.</span>
              </div>
            </div>
            <div className="as-modal-foot">
              <button type="button" className="as-btn as-btn--secondary" onClick={() => setCourseToDelete(null)}>Cancel</button>
              <button
                type="button"
                className="as-btn as-btn--danger"
                onClick={async () => {
                  const idToDelete = courseToDelete.id;
                  setCourseToDelete(null);
                  await handleDeleteCourse(idToDelete);
                }}
              >
                <Trash2 size={15} /> Delete {isDoc ? 'document' : 'course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
