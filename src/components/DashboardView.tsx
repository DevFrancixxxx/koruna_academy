import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen, Award, Sliders,
  Search, Bell, LogOut, Settings, Play, FileText, Download, Target,
  Trash2, CheckCircle, Menu, Clock, Zap, ArrowLeft
} from 'lucide-react';
import type { UserSessionData, UserRole } from '../services/auth';
import { dbService, type Course, type Lesson, type QuizQuestion, type UserProgress, type Badge, type PracticalSubmission, type Department, type SystemSettings, type RolePermissions, type DatabaseUser, type Notification } from '../services/db';
import { AdminSuite } from './AdminSuite';
import { TrainerDashboard } from './TrainerDashboard';
import { LoadingModal } from './LoadingModal';
import { CourseCard, getCourseImage } from './courses/CourseCard';
import { CourseStudyView } from './courses/CourseStudyView';
import { CertificateView } from './courses/CertificateView';
import { Sidebar } from './Sidebar';

interface DashboardViewProps {
  userSession: UserSessionData;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onSignOut: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userSession,
  activeTab,
  onTabChange,
  onSignOut
}) => {
  // --- CORE SYSTEM STATE ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [teamProgress, setTeamProgress] = useState<Record<string, UserProgress[]>>({});
  const [badges, setBadges] = useState<Badge[]>([]);
  const [practicals, setPracticals] = useState<PracticalSubmission[]>([]);
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(dbService.getSettings());
  const [permissions, setPermissions] = useState<RolePermissions[]>(dbService.getPermissions());

  // --- UI INTERACTION STATE ---
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecIndex, setSelectedRecIndex] = useState(1);
  const [kbQuery, setKbQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Navigation & Sub-tabs
  const [activeInnerTab, setActiveInnerTab] = useState<string>(
    userSession.role === 'trainer' ? 'creator' : 'overview'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  // Active Studying state
  const [studyingCourse, setStudyingCourse] = useState<Course | null>(null);
  const [studyingAssignmentId, setStudyingAssignmentId] = useState<number | null>(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizPassed, setQuizPassed] = useState<boolean>(false);
  const [practicalText, setPracticalText] = useState<string>('');

  // Certificate view state
  const [viewingCertificate, setViewingCertificate] = useState<{ course: Course; date: string; id: string } | null>(null);

  // Nudged tracker
  const [nudgedUsers, setNudgedUsers] = useState<Record<string, boolean>>({});

  // Trainer & Admin forms state
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [assignedUserEmails, setAssignedUserEmails] = useState<string[]>([]);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'Mortgage',
    code: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    description: '',
    imgBg: '#e0f2fe',
    attachments: [] as { name: string; url: string; size: number }[]
  });
  const [courseLessons, setCourseLessons] = useState<Omit<Lesson, 'id'>[]>([
    { title: 'Lesson 1: Introduction', content: 'Enter lesson text here.' }
  ]);
  const [courseQuiz, setCourseQuiz] = useState<QuizQuestion[]>([
    { question: 'What is the correct answer?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 }
  ]);
  const [courseModules, setCourseModules] = useState<{ id: string; title: string }[]>([
    { id: 'm1', title: 'Introduction' }
  ]);


  // Admin user form
  const [adminUserForm, setAdminUserForm] = useState({
    name: '',
    email: '',
    role: 'employee' as any,
    department: 'Software Engineering'
  });
  const [newDeptName, setNewDeptName] = useState('');

  // Auto-close profile and notification menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all states from dbService
  const loadPlatformData = async () => {
    const loadedCourses = await dbService.getCourses();
    const loadedProgress = await dbService.getUserProgress(userSession.email);
    const loadedBadges = await dbService.getUserBadges(userSession.email);
    const loadedPracticals = await dbService.getPracticalSubmissions();
    const loadedUsers = await dbService.getUsers();
    const loadedDeps = dbService.getDepartments();
    const loadedSettings = dbService.getSettings();
    const loadedPerms = dbService.getPermissions();
    const loadedNotifs = await dbService.getNotifications(userSession.email);

    setCourses(loadedCourses);
    setUserProgress(loadedProgress);
    setBadges(loadedBadges);
    setPracticals(loadedPracticals);
    setUsers(loadedUsers);
    setDepartments(loadedDeps);
    setSettings(loadedSettings);
    setPermissions(loadedPerms);
    setNotifications(loadedNotifs);

    const employees = loadedUsers.filter(u => u.role === 'employee');
    const teamProgMap: Record<string, UserProgress[]> = {};
    await Promise.all(
      employees.map(async (emp) => {
        const prog = await dbService.getUserProgress(emp.email);
        teamProgMap[emp.email.toLowerCase()] = prog;
      })
    );
    setTeamProgress(teamProgMap);
  };

  useEffect(() => {
    loadPlatformData();
  }, [userSession.email]);

  // Toast notifier helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- NOTIFICATION HANDLERS ---
  const formatNotificationTime = (dateStr: string) => {
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

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await dbService.markNotificationAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    }
    setShowNotifications(false);

    if (notif.courseId) {
      const course = courses.find(c => c.id === notif.courseId);
      if (course) {
        setStudyingCourse(course);
        onTabChange('learning');
      }
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    await dbService.markAllNotificationsAsRead(userSession.email);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await dbService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };


  // Find dynamic permissions for current role
  const userPerms = permissions.find(p => p.role === userSession.role)?.permissions;

  // Custom mapping of role names
  const roleDisplayNames: Record<UserRole, string> = {
    employee: 'Employee',
    team_leader: 'Team Leader',
    trainer: 'Trainer',
    admin: 'Administrator'
  };

  // Initials generator
  const getUserInitials = (name: string) => {
    if (!name) return 'KU';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };
  const userInitials = getUserInitials(userSession.name);

  // Filter catalog courses
  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate Overall Progress percentage
  const totalCoursesEnrolled = userProgress.length;
  const completedCoursesCount = userProgress.filter(p => p.progressPercent === 100).length;
  const overallProgressPercent = totalCoursesEnrolled > 0
    ? Math.round((userProgress.reduce((sum, curr) => sum + curr.progressPercent, 0)) / totalCoursesEnrolled)
    : 0;

  const learningHours = 42.5 + userProgress.reduce((sum, curr) => sum + curr.completedLessons.length * 0.5, 0);
  const xpPoints = 3240 + userProgress.reduce((sum, curr) => sum + curr.completedLessons.length * 50, 0);

  // ==========================================
  // EMPLOYEE CAPABILITIES & EVENTS
  // ==========================================

  const handleStartStudy = (course: Course, applicationId?: number) => {
    setStudyingCourse(course);
    setStudyingAssignmentId(applicationId || null);
    setActiveLessonIdx(-1);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setPracticalText('');
  };

  const handleMarkLessonComplete = async (lessonId: string) => {
    if (!studyingCourse) return;
    const progressList = await dbService.getUserProgress(userSession.email);
    const prog = progressList.find(p => p.courseId === studyingCourse.id && (studyingAssignmentId === null || p.applicationId === studyingAssignmentId));
    if (prog) {
      if (!prog.completedLessons.includes(lessonId)) {
        prog.completedLessons.push(lessonId);
      }

      // Calculate progress based on completed lessons
      const totalLessons = studyingCourse.lessons.length;
      const completedCount = prog.completedLessons.length;

      // Progress calculation: lessons comprise 70% of course weight, quiz comprises 30%
      let calculatedProgress = Math.round((completedCount / totalLessons) * 70);

      // If quiz was previously passed, add 30%
      const threshold = settings.quizPassingThreshold;
      if (prog.quizScore && prog.quizScore >= threshold) {
        calculatedProgress += 30;
      }

      prog.progressPercent = Math.min(calculatedProgress, 100);

      await dbService.saveUserProgress(prog);
      await loadPlatformData();
      showToast(`Lesson completed: "${studyingCourse.lessons.find(l => l.id === lessonId)?.title}"`);
    }
  };

  const handleQuizAnswer = (questionIdx: number, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleQuizSubmit = async () => {
    if (!studyingCourse || !studyingCourse.quiz) return;

    let correctCount = 0;
    studyingCourse.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / studyingCourse.quiz.length) * 100);
    const threshold = settings.quizPassingThreshold;
    const passed = score >= threshold;

    setQuizScore(score);
    setQuizPassed(passed);
    setQuizSubmitted(true);

    // Save progress
    const progressList = await dbService.getUserProgress(userSession.email);
    const prog = progressList.find(p => p.courseId === studyingCourse.id && (studyingAssignmentId === null || p.applicationId === studyingAssignmentId));
    if (prog) {
      prog.quizAttempts += 1;
      prog.quizScore = Math.max(prog.quizScore || 0, score);

      // Re-calculate overall course progress percentage
      const totalLessons = studyingCourse.lessons.length;
      const completedCount = prog.completedLessons.length;
      let calculatedProgress = Math.round((completedCount / totalLessons) * 70);

      if (prog.quizScore >= threshold) {
        calculatedProgress += 30;
        // If there's no practical assessment required (default c2 compliance has none, c1 underwriting has one)
        if (studyingCourse.id === 'c2') {
          prog.progressPercent = 100;
        } else {
          prog.progressPercent = Math.min(calculatedProgress, 90); // Practical gets them to 100
        }
      } else {
        prog.progressPercent = Math.min(calculatedProgress, 70);
      }

      await dbService.saveUserProgress(prog);
      await loadPlatformData();
      showToast(`Quiz completed: Scored ${score}% (${passed ? 'PASSED' : 'FAILED'})`);
    }
  };

  const handlePracticalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyingCourse || !practicalText.trim()) return;

    await dbService.submitPractical({
      userEmail: userSession.email,
      userName: userSession.name,
      courseId: studyingCourse.id,
      courseTitle: studyingCourse.title,
      submissionText: practicalText
    });

    showToast('Practical assessment submitted to your Team Leader for review!');
    setPracticalText('');
    await loadPlatformData();
  };

  const handleSignOutClick = () => {
    setShowProfileMenu(false);
    setIsMobileSidebarOpen(false);
    setShowSignOutConfirm(true);
  };


  // Get date and cert ID for earned certificates
  const getCertData = (courseId: string) => {
    if (courseId === 'c1') return { date: 'Jul 24, 2026', id: 'CERT-MORT-88402' };
    if (courseId === 'c2') return { date: 'Jul 20, 2026', id: 'CERT-COMP-01124' };
    return { date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), id: `CERT-${courseId.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}` };
  };

  // ==========================================
  // TEAM LEADER EVENTS
  // ==========================================

  const handleAssignCourse = async (courseId: string, email: string) => {
    const empProg = teamProgress[email.toLowerCase()] || [];
    const isCurrentlyAssigned = empProg.some(p => p.courseId === courseId && p.dueDate);
    const u = users.find(user => user.email === email);
    const c = courses.find(course => course.id === courseId);

    if (isCurrentlyAssigned) {
      await dbService.unassignCourseFromUser(courseId, email);
      showToast(`Unassigned "${c?.title || courseId}" from ${u?.name || email}`);
    } else {
      await dbService.assignCourseToUser(courseId, email, userSession.name);
      showToast(`Assigned "${c?.title || courseId}" to ${u?.name || email}`);
    }
    await loadPlatformData();
  };

  const handleReviewPractical = async (subId: string, status: 'approved' | 'rejected') => {
    await dbService.reviewPractical(subId, status);
    const sub = practicals.find(p => p.id === subId);
    showToast(`Practical assessment by ${sub?.userName} has been ${status.toUpperCase()}`);
    await loadPlatformData();
  };

  const handleNudgeUser = (email: string, courseCode: string) => {
    setNudgedUsers(prev => ({ ...prev, [`${email}-${courseCode}`]: true }));
    showToast(`Sent urgent learning reminder nudge to ${email}!`);
  };

  // ==========================================
  // TRAINER EVENTS
  // ==========================================

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.code) {
      alert('Course Title and Course Code are required.');
      return;
    }

    const lessonsWithIds: Lesson[] = courseLessons.map((l, i) => {
      const currentModule = courseModules.find(m => m.id === (l.moduleId || 'm1')) || courseModules[0] || { id: 'm1', title: 'Introduction' };
      return {
        ...l,
        id: editingCourseId ? `${editingCourseId}-l${i + 1}` : `c_new-l${i + 1}`,
        moduleId: currentModule.id,
        moduleTitle: currentModule.title
      };
    });

    const saved = await dbService.saveCourse({
      id: editingCourseId || `c-${Date.now()}`,
      title: courseForm.title,
      category: courseForm.category,
      rating: editingCourseId ? (courses.find(c => c.id === editingCourseId)?.rating || 4.5) : 4.5,
      code: courseForm.code,
      level: courseForm.level,
      description: courseForm.description,
      imgBg: courseForm.imgBg,
      lessons: lessonsWithIds,
      quiz: courseQuiz,
      attachments: courseForm.attachments
    });

    // Process assignments
    const employees = users.filter(u => u.role === 'employee');
    await Promise.all(
      employees.map(async (emp) => {
        const empProgList = await dbService.getUserProgress(emp.email);
        const prog = empProgList.find(p => p.courseId === saved.id);
        const shouldBeAssigned = assignedUserEmails.includes(emp.email);
        const isCurrentlyAssigned = !!(prog && prog.dueDate);

        if (shouldBeAssigned && !isCurrentlyAssigned) {
          await dbService.assignCourseToUser(saved.id, emp.email, userSession.name);
        } else if (!shouldBeAssigned && isCurrentlyAssigned) {
          await dbService.unassignCourseFromUser(saved.id, emp.email);
        }
      })
    );

    showToast(editingCourseId ? `Updated Course: "${saved.title}"` : `Created New Course: "${saved.title}"`);
    setEditingCourseId(null);
    setCourseForm({ title: '', category: 'Mortgage', code: '', level: 'Beginner', description: '', imgBg: '#e0f2fe', attachments: [] });
    setCourseLessons([{ title: 'Lesson 1: Introduction', content: 'Enter lesson text here.', moduleId: 'm1', moduleTitle: 'Introduction' }]);
    setCourseQuiz([{ question: 'What is the correct answer?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 }]);
    setCourseModules([{ id: 'm1', title: 'Introduction' }]);
    setAssignedUserEmails([]);

    await loadPlatformData();
  };

  const handleStartEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      category: course.category,
      code: course.code,
      level: course.level,
      description: course.description,
      imgBg: course.imgBg,
      attachments: course.attachments || []
    });
    setCourseLessons(course.lessons.map(({ id, ...l }) => l));
    setCourseQuiz(course.quiz || []);

    const existingModules: { id: string; title: string }[] = [];
    const seenModuleIds = new Set<string>();
    course.lessons.forEach(l => {
      const mid = l.moduleId || 'm1';
      const mtitle = l.moduleTitle || 'Introduction';
      if (!seenModuleIds.has(mid)) {
        seenModuleIds.add(mid);
        existingModules.push({ id: mid, title: mtitle });
      }
    });
    if (existingModules.length === 0) {
      existingModules.push({ id: 'm1', title: 'Introduction' });
    }
    setCourseModules(existingModules);


    // Find all users who are currently assigned this course
    const currentlyAssigned: string[] = [];
    users.filter(u => u.role === 'employee').forEach(emp => {
      const empProgList = teamProgress[emp.email.toLowerCase()] || [];
      if (empProgList.some(p => p.courseId === course.id && p.dueDate)) {
        currentlyAssigned.push(emp.email);
      }
    });
    setAssignedUserEmails(currentlyAssigned);

    setActiveInnerTab('creator');
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course? All employee enrollments will be wiped.')) {
      await dbService.deleteCourse(id);
      showToast('Course successfully deleted.');
      await loadPlatformData();
    }
  };



  const addQuizQuestionField = () => {
    setCourseQuiz(prev => [...prev, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const removeQuizQuestionField = (idx: number) => {
    if (courseQuiz.length === 1) return;
    setCourseQuiz(prev => prev.filter((_, i) => i !== idx));
  };

  // ==========================================
  // ADMIN EVENTS
  // ==========================================

  const handleUpdateUserRole = async (email: string, role: UserRole) => {
    const user = users.find(u => u.email === email);
    if (user) {
      user.role = role;
      await dbService.saveUser(user);
      showToast(`Updated role of ${user.name} to ${roleDisplayNames[role]}`);
      loadPlatformData();
    }
  };

  const handleUpdateUserDept = async (email: string, dept: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      user.department = dept;
      await dbService.saveUser(user);
      showToast(`Updated department of ${user.name} to ${dept}`);
      loadPlatformData();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUserForm.name || !adminUserForm.email) return;

    await dbService.saveUser({
      id: `u-${Date.now()}`,
      name: adminUserForm.name,
      email: adminUserForm.email,
      role: adminUserForm.role,
      department: adminUserForm.department,
      createdAt: new Date().toISOString().split('T')[0]
    });

    showToast(`Created account for ${adminUserForm.name}!`);
    setAdminUserForm({ name: '', email: '', role: 'employee', department: 'Software Engineering' });
    loadPlatformData();
  };

  const handleDeleteUser = async (email: string) => {
    if (confirm(`Are you sure you want to permanently delete user ${email}?`)) {
      await dbService.deleteUser(email);
      showToast(`User ${email} deleted.`);
      loadPlatformData();
    }
  };

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    dbService.addDepartment(newDeptName.trim());
    showToast(`Department "${newDeptName.trim()}" added successfully.`);
    setNewDeptName('');
    loadPlatformData();
  };

  const handlePermissionToggle = (role: UserRole, permissionKey: keyof RolePermissions['permissions']) => {
    const updated = permissions.map(p => {
      if (p.role === role) {
        return {
          ...p,
          permissions: {
            ...p.permissions,
            [permissionKey]: !p.permissions[permissionKey]
          }
        };
      }
      return p;
    });
    setPermissions(updated);
    dbService.savePermissions(updated);
    showToast(`Permissions updated for role: ${roleDisplayNames[role]}`);
  };

  const handleSaveSettings = (updatedSettings: Partial<SystemSettings>) => {
    const n = { ...settings, ...updatedSettings };
    setSettings(n);
    dbService.saveSettings(n);
    showToast('System configuration saved.');
  };

  const isImmersivePlayer = !!(studyingCourse && activeLessonIdx >= 0);

  return (
    <div className="koruna-dashboard-layout">
      {/* Dynamic Alert Banner/Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--koruna-dark-bg)', color: '#ffffff', borderLeft: '4px solid var(--koruna-primary)', padding: '1rem 1.5rem', borderRadius: '8px', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-lg)', fontWeight: 600, animation: 'fadeIn 0.2s ease' }}>
          <CheckCircle size={18} style={{ color: 'var(--koruna-primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      {!isImmersivePlayer && (
        <div className="koruna-mobile-top-bar">
          <button className="koruna-hamburger-btn" onClick={() => setIsMobileSidebarOpen(true)} title="Open Menu">
            <Menu size={22} />
          </button>
          <div className="koruna-mobile-logo" onClick={() => { setStudyingCourse(null); onTabChange('dashboard'); setIsMobileSidebarOpen(false); }}>
            <img
              src="/Wkorunalogo.png"
              alt="Koruna Academy Logo"
              style={{ height: '32px', width: 'auto', display: 'block' }}
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.endsWith('/korunalogo.png')) {
                  img.src = '/logo.svg';
                }
              }}
            />
          </div>
          <div className="koruna-mobile-actions">
            <button className="koruna-mobile-bell-btn" onClick={() => { setShowNotifications(!showNotifications); }} title="Notifications">
              <Bell size={18} />
              {notifications.some(n => !n.isRead) && (
                <span className="koruna-header-bell-badge" />
              )}
            </button>
            <div className="koruna-mobile-avatar" onClick={() => { onTabChange('progress'); setIsMobileSidebarOpen(false); }}>
              {userInitials}
            </div>
          </div>
        </div>
      )}

      {/* 1. LEFT SIDEBAR DRAWER */}
      {!isImmersivePlayer && (
        <Sidebar
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          userSession={userSession}
          activeTab={activeTab}
          onTabChange={onTabChange}
          studyingCourse={studyingCourse}
          setStudyingCourse={setStudyingCourse}
          setActiveInnerTab={setActiveInnerTab}
          userPerms={userPerms}
          handleSignOutClick={handleSignOutClick}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main className="koruna-dashboard-content" style={{ overflowY: 'auto', padding: isImmersivePlayer ? 0 : undefined }}>

        {/* COMMON TOP HEADER */}
        {!isImmersivePlayer ? (
          <header className="koruna-content-header">
            {activeTab === 'dashboard' && !studyingCourse ? (
              <div className="koruna-greeting-area">
                <h1>Welcome back, {userSession.name.split(' ')[0]}</h1>
                <p className="koruna-greeting-subtext">
                  You're on your <span className="koruna-streak-highlight">12-day</span> Learning streak!
                </p>
              </div>
            ) : (
              <div className="koruna-greeting-area" />
            )}

            <div className="koruna-header-right">
              <div className="koruna-header-search">
                <Search className="koruna-header-search-icon" size={16} />
                <input
                  type="text"
                  placeholder="Search courses, skills, certificates..."
                  className="koruna-header-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'catalog' && e.target.value !== '') {
                      onTabChange('catalog');
                    }
                  }}
                />
              </div>

              <div style={{ position: 'relative' }} ref={notificationsMenuRef}>
                <button
                  className="koruna-header-bell-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <Bell size={18} />
                  {notifications.some(n => !n.isRead) && (
                    <span className="koruna-header-bell-badge" />
                  )}
                </button>

                {showNotifications && (
                  <div className="koruna-notifications-dropdown">
                    <div className="koruna-notifications-header">
                      <span className="koruna-notifications-title">Notifications</span>
                      {notifications.some(n => !n.isRead) && (
                        <button
                          className="koruna-notifications-read-all"
                          onClick={handleMarkAllNotificationsAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="koruna-notifications-empty">
                        <Bell size={32} style={{ opacity: 0.3 }} />
                        <span className="koruna-notifications-empty-text">
                          You're all caught up!
                        </span>
                      </div>
                    ) : (
                      <ul className="koruna-notifications-list">
                        {notifications.map(notif => (
                          <li
                            key={notif.id}
                            className={`koruna-notifications-item ${!notif.isRead ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="koruna-notifications-icon-container">
                              <Bell size={14} />
                            </div>
                            <div className="koruna-notifications-item-content">
                              <span className="koruna-notifications-item-title">{notif.title}</span>
                              <span className="koruna-notifications-item-message">{notif.message}</span>
                              <span className="koruna-notifications-item-time">
                                {formatNotificationTime(notif.createdAt)}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <span className="koruna-notifications-unread-dot" />
                            )}
                            <button
                              className="koruna-notifications-item-delete"
                              onClick={(e) => handleDeleteNotification(e, notif.id)}
                              title="Delete notification"
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

              <div className="koruna-header-profile-dropdown" ref={profileMenuRef}>
                <div
                  className="koruna-header-avatar"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  {userInitials}
                </div>

                {showProfileMenu && (
                  <div className="koruna-profile-menu">
                    <div className="koruna-profile-menu-info">
                      <div className="koruna-profile-menu-name">{userSession.name}</div>
                      <div className="koruna-profile-menu-email">{userSession.email}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--koruna-primary)', fontWeight: 800, textTransform: 'uppercase', marginTop: '0.25rem' }}>
                        Role: {roleDisplayNames[userSession.role] || userSession.role}
                      </div>
                      {userSession.department && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>
                          Dept: {userSession.department}
                        </div>
                      )}
                    </div>
                    <button className="koruna-profile-menu-item" onClick={() => { onTabChange('progress'); setShowProfileMenu(false); }}>
                      <Sliders size={14} /> My Profile & Progress
                    </button>
                    <button className="koruna-profile-menu-item" onClick={() => { onTabChange('certificates'); setShowProfileMenu(false); }}>
                      <Award size={14} /> My Certificates
                    </button>
                    <button className="koruna-profile-menu-item" style={{ color: '#ef4444' }} onClick={handleSignOutClick}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        ) : (studyingCourse && activeLessonIdx >= studyingCourse.lessons.length) ? null : (
          <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
            borderBottom: '1px solid var(--udemy-border)',
            padding: '0.8rem 2.5rem',
            width: '100%',
            height: '72px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            flexShrink: 0
          }}>
            <button
              className="btn-koruna-outline"
              onClick={() => setActiveLessonIdx(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                height: '40px',
                padding: '0 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <div style={{ fontSize: '0.9rem', color: 'var(--udemy-text-muted)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>
              {studyingCourse.title} / <span style={{ color: 'var(--udemy-text)' }}>
                {activeLessonIdx < studyingCourse.lessons.length ? (
                  studyingCourse.lessons[activeLessonIdx].moduleTitle || 'Module'
                ) : (
                  'Final Assessment'
                )}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#a82c5d',
              color: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              {userInitials}
            </div>
          </header>
        )}

        {/* ACTIVE STUDYING IMMERSIVE VIEW */}
        {studyingCourse ? (
          isImmersivePlayer ? (
            <div style={{ padding: '2rem 2.5rem 3rem 2.5rem' }}>
              <CourseStudyView
                studyingCourse={studyingCourse}
                activeLessonIdx={activeLessonIdx}
                setActiveLessonIdx={setActiveLessonIdx}
                quizAnswers={quizAnswers}
                handleQuizAnswer={handleQuizAnswer}
                quizSubmitted={quizSubmitted}
                handleQuizSubmit={handleQuizSubmit}
                quizPassed={quizPassed}
                quizScore={quizScore}
                setQuizAnswers={setQuizAnswers}
                setQuizSubmitted={setQuizSubmitted}
                practicalText={practicalText}
                setPracticalText={setPracticalText}
                handlePracticalSubmit={handlePracticalSubmit}
                userProgress={userProgress}
                handleMarkLessonComplete={handleMarkLessonComplete}
                setStudyingCourse={setStudyingCourse}
                settings={settings}
                users={users}
                teamProgress={teamProgress}
                userSession={userSession}
                loadPlatformData={loadPlatformData}
                showToast={showToast}
              />
            </div>
          ) : (
            <CourseStudyView
              studyingCourse={studyingCourse}
              activeLessonIdx={activeLessonIdx}
              setActiveLessonIdx={setActiveLessonIdx}
              quizAnswers={quizAnswers}
              handleQuizAnswer={handleQuizAnswer}
              quizSubmitted={quizSubmitted}
              handleQuizSubmit={handleQuizSubmit}
              quizPassed={quizPassed}
              quizScore={quizScore}
              setQuizAnswers={setQuizAnswers}
              setQuizSubmitted={setQuizSubmitted}
              practicalText={practicalText}
              setPracticalText={setPracticalText}
              handlePracticalSubmit={handlePracticalSubmit}
              userProgress={userProgress}
              handleMarkLessonComplete={handleMarkLessonComplete}
              setStudyingCourse={setStudyingCourse}
              settings={settings}
              users={users}
              teamProgress={teamProgress}
              userSession={userSession}
              loadPlatformData={loadPlatformData}
              showToast={showToast}
            />
          )
        ) : userSession.role === 'admin' && activeTab !== 'dashboard' ? (
          /* UNDER DEVELOPMENT VIEW FOR ADMIN */
          <div className="koruna-subview-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={48} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--koruna-text-dark)', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
              Module Under Development
            </h2>
            <p style={{ color: 'var(--koruna-text-muted)', fontSize: '1.05rem', maxWidth: '480px', lineHeight: 1.6, marginBottom: '2rem' }}>
              This tab is currently under active construction for Administrator accounts. Please navigate to the main **Admin Dashboard** to manage users, settings, and courses.
            </p>
            <button className="btn-koruna-solid" onClick={() => onTabChange('dashboard')}>
              Return to Admin Dashboard
            </button>
          </div>
        ) : (
          /* REGULAR TAB ROUTING */
          <>
            {/* TAB 1: MAIN DASHBOARD */}
            {activeTab === 'dashboard' && (
              <>
                {userSession.role === 'trainer' ? (
                  <TrainerDashboard
                    courses={courses}
                    handleStartStudy={handleStartStudy}
                    handleStartEditCourse={handleStartEditCourse}
                    setEditingCourseId={setEditingCourseId}
                    setCourseForm={setCourseForm}
                    setCourseLessons={setCourseLessons}
                    setCourseQuiz={setCourseQuiz}
                    setCourseModules={setCourseModules}
                    setAssignedUserEmails={setAssignedUserEmails}
                    onTabChange={onTabChange}
                    setActiveInnerTab={setActiveInnerTab}
                  />
                ) : userSession.role === 'admin' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #311042 100%)', color: '#ffffff', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.08, transform: 'rotate(15deg)' }}>
                        <Settings size={280} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', padding: '0.35rem 0.75rem', borderRadius: '9999px', letterSpacing: '0.05em' }}>
                        System Administration Portal
                      </span>
                      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                        Enterprise Administrator Dashboard
                      </h2>
                      <p style={{ color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.6 }}>
                        Monitor enterprise directory growth, configure universal curriculum passing thresholds, manage fine-grained user capability matrices, and audit portal platform settings.
                      </p>
                    </div>

                    {/* Admin Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      <div className="koruna-metric-card koruna-metric-card-white" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sliders size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--koruna-text-dark)' }}>{users.length}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)', fontWeight: 600 }}>Active Users</div>
                        </div>
                      </div>

                      <div className="koruna-metric-card koruna-metric-card-white" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--koruna-text-dark)' }}>{courses.length}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)', fontWeight: 600 }}>Catalog Courses</div>
                        </div>
                      </div>

                      <div className="koruna-metric-card koruna-metric-card-white" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Target size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--koruna-text-dark)' }}>{departments.length}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)', fontWeight: 600 }}>Departments</div>
                        </div>
                      </div>

                      <div className="koruna-metric-card koruna-metric-card-white" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: '#fff7ed', color: '#f97316', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Award size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--koruna-text-dark)' }}>{settings.quizPassingThreshold}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)', fontWeight: 600 }}>Passing Score</div>
                        </div>
                      </div>

                      <div className="koruna-metric-card koruna-metric-card-white" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ background: '#fff1f2', color: '#f43f5e', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={22} />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--koruna-text-dark)' }}>{practicals.filter(p => p.status === 'pending').length}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)', fontWeight: 600 }}>Pending Cases</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--koruna-border-color)', paddingTop: '2rem' }}>
                      <AdminSuite
                        userSession={userSession}
                        userPerms={userPerms}
                        activeInnerTab={activeInnerTab}
                        setActiveInnerTab={setActiveInnerTab}
                        courses={courses}
                        users={users}
                        departments={departments}
                        permissions={permissions}
                        settings={settings}
                        teamProgress={teamProgress}
                        editingCourseId={editingCourseId}
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
                        adminUserForm={adminUserForm}
                        setAdminUserForm={setAdminUserForm}
                        newDeptName={newDeptName}
                        setNewDeptName={setNewDeptName}
                        handleSaveCourse={handleSaveCourse}
                        handleStartEditCourse={handleStartEditCourse}
                        handleDeleteCourse={handleDeleteCourse}
                        handleAssignCourse={handleAssignCourse}
                        handleCreateUser={handleCreateUser}
                        handleAddDept={handleAddDept}
                        handleUpdateUserDept={handleUpdateUserDept}
                        handleUpdateUserRole={handleUpdateUserRole}
                        handleDeleteUser={handleDeleteUser}
                        handlePermissionToggle={handlePermissionToggle}
                        handleSaveSettings={handleSaveSettings}
                        addQuizQuestionField={addQuizQuestionField}
                        removeQuizQuestionField={removeQuizQuestionField}
                        setEditingCourseId={setEditingCourseId}
                        showToast={showToast}
                        loadPlatformData={loadPlatformData}
                      />
                    </div>
                  </div>
                ) : (
                  /* REGULAR DASHBOARD VIEW FOR OTHER ROLES */
                  <>
                    {/* METRICS ROW */}
                    {/* METRICS ROW (Matching user public icons design) */}
                    <div className="koruna-dashboard-stats-container">
                      {/* TOP ROW: OVERALL PROGRESS & CURRENT COURSE */}
                      <div className="koruna-stats-top-row">
                        <div className="koruna-stat-card koruna-stat-card-burgundy">
                          <div className="koruna-stat-value-large">{overallProgressPercent > 0 ? overallProgressPercent : 68}%</div>
                          <div className="koruna-stat-label-burgundy">OVERALL PROGRESS</div>
                        </div>

                        <div className="koruna-stat-card">
                          <img src="/courseicon.png" alt="Current Course" className="koruna-stat-icon-img" />
                          <div className="koruna-stat-info">
                            <div className="koruna-stat-course-title">
                              {courses.find(c => c.id === userProgress[0]?.courseId)?.title || courses[0]?.title || 'Mortgage Level 2: Underwriting Fundamentals'}
                            </div>
                            <div className="koruna-stat-label-gray">CURRENT COURSE</div>
                          </div>
                        </div>
                      </div>

                      {/* BOTTOM ROW: CERTIFICATES, LEARNING HOURS, XP POINTS */}
                      <div className="koruna-stats-bottom-row">
                        <div className="koruna-stat-card">
                          <img src="/certificateicon.png" alt="Certificates" className="koruna-stat-icon-img" />
                          <div className="koruna-stat-info">
                            <div className="koruna-stat-value-medium">
                              {userProgress.filter(p => p.progressPercent === 100).length || 9}
                            </div>
                            <div className="koruna-stat-label-gray">CERTIFICATES</div>
                          </div>
                        </div>

                        <div className="koruna-stat-card">
                          <img src="/learninghours.png" alt="Learning Hours" className="koruna-stat-icon-img" />
                          <div className="koruna-stat-info">
                            <div className="koruna-stat-value-medium">{learningHours.toFixed(1)}h</div>
                            <div className="koruna-stat-label-gray">LEARNING HOURS</div>
                          </div>
                        </div>

                        <div className="koruna-stat-card">
                          <img src="/xppointsicon.png" alt="XP Points" className="koruna-stat-icon-img" />
                          <div className="koruna-stat-info">
                            <div className="koruna-stat-value-medium">{xpPoints.toLocaleString()}</div>
                            <div className="koruna-stat-label-gray">XP POINTS</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CONTINUE LEARNING SECTION */}
                    <section className="koruna-dashboard-section">
                      <h2 className="koruna-section-title">Continue Learning</h2>
                      {userProgress.length > 0 ? (
                        (() => {
                          const activeProg =
                            userProgress.find(p => p.dueDate && p.progressPercent < 100) ||
                            userProgress.find(p => p.progressPercent > 0 && p.progressPercent < 100) ||
                            userProgress[0];
                          const course = courses.find(c => c.id === activeProg.courseId);
                          if (!course) return null
                          return (
                            <div className="koruna-continue-learning-card">
                              <div className="koruna-continue-thumb-wrap" style={{ overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
                                <img
                                  src={getCourseImage(course)}
                                  alt={course.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
                                />
                              </div>
                              <div className="koruna-continue-details">
                                <div className="koruna-continue-header-row">
                                  <span className={`koruna-badge-pill ${activeProg.progressPercent === 100 ? 'koruna-badge-completed' : 'koruna-badge-in-progress'}`}>
                                    {activeProg.progressPercent === 100 ? 'Completed' : 'In Progress'}
                                  </span>
                                  <h3 className="koruna-course-title-main">{course.title}</h3>
                                </div>
                                <div className="koruna-continue-progress-row">
                                  <div className="koruna-progress-bar-track">
                                    <div className="koruna-progress-bar-fill" style={{ width: `${activeProg.progressPercent}%` }}></div>
                                  </div>
                                  <span className="koruna-progress-percent">{activeProg.progressPercent}%</span>
                                </div>
                                <div className="koruna-continue-trainer">Course Code: {course.code} • Category: {course.category}</div>
                              </div>
                              <button
                                className="btn-continue-course"
                                onClick={() => {
                                  const activeProg =
                                    userProgress.find(p => p.dueDate && p.progressPercent < 100) ||
                                    userProgress.find(p => p.progressPercent > 0 && p.progressPercent < 100) ||
                                    userProgress[0];
                                  handleStartStudy(course, activeProg?.applicationId);
                                }}
                              >
                                Continue Course
                              </button>
                            </div>
                          );
                        })()
                      ) : (
                        <p style={{ color: 'var(--koruna-text-muted)' }}>No courses enrolled yet. Please check the Catalogue.</p>
                      )}
                    </section>

                    {/* ASSIGNED COURSES SECTION */}
                    {(() => {
                      const assigned = userProgress
                        .filter(p => p.dueDate)
                        .map(p => {
                          const course = courses.find(c => c.id === p.courseId);
                          return course ? { ...course, prog: p } : null;
                        })
                        .filter((x): x is (Course & { prog: UserProgress }) => x !== null);
                      const isEmployee = userSession.role === 'employee';
                      if (isEmployee && assigned.length === 0) return null;

                      const coursesToDisplay = isEmployee
                        ? assigned
                        : courses.map(c => {
                          const prog = userProgress.find(p => p.courseId === c.id && p.dueDate) || userProgress.find(p => p.courseId === c.id);
                          return { ...c, prog };
                        });
                      return (
                        <section className="koruna-dashboard-section">
                          <div className="koruna-section-header">
                            <h2 className="koruna-section-title">Assigned Courses</h2>
                            <span className="koruna-section-link" onClick={() => onTabChange('catalog')}>View all</span>
                          </div>

                          <div className="koruna-assigned-courses-grid">
                            {coursesToDisplay.map((course, idx) => {
                              const percent = course.prog ? course.prog.progressPercent : 0;
                              const keyId = course.prog?.applicationId ? `${course.id}-${course.prog.applicationId}` : `${course.id}-${idx}`;
                              return (
                                <CourseCard
                                  key={keyId}
                                  course={course}
                                  variant="employee"
                                  percent={percent}
                                  applicationId={course.prog?.applicationId}
                                  onActionClick={() => handleStartStudy(course, course.prog?.applicationId)}
                                />
                              );
                            })}
                          </div>
                        </section>
                      );
                    })()}

                    {/* BOTTOM SPLIT GRID */}
                    <div className="koruna-bottom-split">
                      {/* RECOMMENDED FOR YOU (LEFT) */}
                      <div className="koruna-bottom-left-col">
                        <h2 className="koruna-section-title">Recommended For You</h2>
                        <div className="koruna-recommended-list">
                          {courses.slice(1, 4).map((rec, index) => (
                            <div
                              key={rec.id}
                              className={`koruna-recommended-card ${selectedRecIndex === index ? 'selected' : ''}`}
                              onClick={() => setSelectedRecIndex(index)}
                            >
                              <div className="koruna-rec-thumb-wrap" style={{ overflow: 'hidden', borderRadius: '6px', position: 'relative' }}>
                                <img
                                  src={getCourseImage(rec)}
                                  alt={rec.title}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
                                />
                              </div>
                              <div className="koruna-rec-details">
                                <div className="koruna-rec-details-header">
                                  <span className="koruna-badge-pill koruna-badge-lending" style={{ fontSize: '0.65rem' }}>{rec.category}</span>
                                </div>
                                <div className="koruna-rec-title">{rec.title}</div>
                                <div className="koruna-rec-meta">{rec.lessons.length} lessons • Rating ⭐ {rec.rating}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DEADLINES & CERTIFICATES (RIGHT) */}
                      <div className="koruna-bottom-right-col">
                        {/* UPCOMING DEADLINES */}
                        <div className="koruna-deadlines-card">
                          <div className="koruna-deadline-title">Upcoming & Overdue Deadlines</div>
                          <div className="koruna-deadlines-list">
                            {userProgress.filter(p => p.overdue || p.dueDate).map((p, idx) => {
                              const course = courses.find(c => c.id === p.courseId);
                              if (!course) return null;
                              return (
                                <div key={idx} className="koruna-deadline-item">
                                  <div className="koruna-deadline-info">
                                    <div className="koruna-deadline-name">{course.code} Quiz / Homework</div>
                                    <div className="koruna-deadline-due" style={{ color: p.overdue ? '#ef4444' : 'var(--koruna-text-muted)' }}>
                                      {p.overdue ? 'Training Overdue!' : `Due on ${p.dueDate}`}
                                    </div>
                                  </div>
                                  <span className={`koruna-badge-pill ${p.overdue ? 'koruna-badge-overdue' : 'koruna-badge-upcoming'}`}>
                                    {p.overdue ? 'Overdue' : 'Upcoming'}
                                  </span>
                                </div>
                              );
                            })}
                            {userProgress.filter(p => p.overdue || p.dueDate).length === 0 && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)', textAlign: 'center', padding: '1rem' }}>
                                No training deadlines pending.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* RECENT CERTIFICATES */}
                        <div className="koruna-certs-card">
                          <div className="koruna-certs-title">Recent Certificates</div>
                          <div className="koruna-certs-list">
                            {userProgress.filter(p => p.progressPercent === 100).map((p, idx) => {
                              const course = courses.find(c => c.id === p.courseId);
                              if (!course) return null;
                              const cert = getCertData(p.courseId);
                              return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.4rem 0', cursor: 'pointer' }} onClick={() => setViewingCertificate({ course, date: cert.date, id: cert.id })}>
                                  <div className="koruna-cert-item" style={{ border: 'none', padding: 0 }}>
                                    <div className="koruna-cert-name" style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline' }}>{course.title}</div>
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>Issued: {cert.date}</div>
                                </div>
                              );
                            })}
                            {userProgress.filter(p => p.progressPercent === 100).length === 0 && (
                              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', textAlign: 'center', padding: '1rem 0' }}>
                                Complete courses to unlock certificates.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB 2: COURSE CATALOGUE */}
            {activeTab === 'catalog' && (
              <div className="koruna-subview-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 className="koruna-section-title" style={{ marginBottom: '0.5rem' }}>Course Catalogue</h2>
                    <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.9rem' }}>
                      Browse all available training across every department.
                    </p>
                  </div>
                  {userPerms?.editCourses && (
                    <button
                      className="btn-koruna-solid"
                      style={{ height: '40px', padding: '0 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => {
                        setEditingCourseId(null);
                        setCourseForm({ title: '', category: 'Mortgage', code: '', level: 'Beginner', description: '', imgBg: '#e0f2fe', attachments: [] });
                        setCourseLessons([{ title: 'Lesson 1: Introduction', content: 'Enter lesson text here.' }]);
                        setCourseQuiz([{ question: 'What is the correct answer?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 }]);
                        setAssignedUserEmails([]);
                        onTabChange('admin_suite');
                        setActiveInnerTab('creator');
                      }}
                    >
                      + Create New Course
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((c) => {
                      const prog = userProgress.find(p => p.courseId === c.id);
                      const isEnrolled = !!prog;
                      const isAssigned = !!prog?.dueDate;
                      return (
                        <CourseCard
                          key={c.id}
                          course={c}
                          variant="catalogue"
                          isEnrolled={isEnrolled}
                          isAssigned={isAssigned}
                          percent={prog ? prog.progressPercent : 0}
                          isOverdue={prog ? prog.overdue : false}
                          onActionClick={() => handleStartStudy(c)}
                        />
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--koruna-text-muted)' }}>
                      No courses found matching your query.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: LEARNING PATH */}
            {activeTab === 'learning_path' && (
              <div className="koruna-subview-wrapper" style={{ padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                {courses.length > 0 && (
                  <div style={{ background: '#1c1d1f', color: '#ffffff', padding: '2rem', borderRadius: '12px', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', boxShadow: 'var(--koruna-card-shadow)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#aa1555', background: '#fbeef4', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                        RECOMMENDED NEXT LESSON
                      </span>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                        {courses[0].title}: Lesson 1
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#d1d7dc' }}>
                        <span>Interactive Video & Reading Material</span>
                        <span>⭐ {courses[0].rating} ({courses[0].level})</span>
                      </div>
                    </div>

                    <button
                      className="btn-koruna-solid"
                      style={{ height: '48px', padding: '0 2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      onClick={() => handleStartStudy(courses[0])}
                    >
                      <Play size={18} fill="#ffffff" />
                      <span>Resume Learning</span>
                    </button>
                  </div>
                )}

                {(() => {
                  const assigned = userProgress
                    .filter(p => p.dueDate)
                    .map(p => {
                      const course = courses.find(c => c.id === p.courseId);
                      return course ? { ...course, prog: p } : null;
                    })
                    .filter((x): x is (Course & { prog: UserProgress }) => x !== null);
                  const isEmployee = userSession.role === 'employee';
                  if (isEmployee && assigned.length === 0) return null;

                  const coursesToDisplay = isEmployee
                    ? assigned
                    : courses.map(c => {
                      const prog = userProgress.find(p => p.courseId === c.id && p.dueDate) || userProgress.find(p => p.courseId === c.id);
                      return { ...c, prog };
                    });
                  return (
                    <>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--koruna-text-dark)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} style={{ color: 'var(--koruna-primary)' }} />
                        My Assigned Learning Pathways
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
                        {coursesToDisplay.map((c, idx) => {
                          const keyId = c.prog?.applicationId ? `${c.id}-${c.prog.applicationId}` : `${c.id}-${idx}`;
                          return (
                            <CourseCard
                              key={keyId}
                              course={c}
                              variant="simple"
                              applicationId={c.prog?.applicationId}
                              onActionClick={() => handleStartStudy(c, c.prog?.applicationId)}
                            />
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: MY PROGRESS DETAIL */}
            {activeTab === 'progress' && (
              <div className="koruna-subview-wrapper">
                <h2 className="koruna-section-title" style={{ marginBottom: '1.5rem' }}>My Progress & Learning Statistics</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', background: '#fdf2f8', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--koruna-primary)' }}>AVERAGE ENROLLMENT PROGRESS</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--koruna-primary)', margin: '0.5rem 0' }}>{overallProgressPercent}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>Weighted compliance score</div>
                  </div>

                  <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', background: '#f0fdf4', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>COMPLETED COURSES</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#16a34a', margin: '0.5rem 0' }}>{completedCoursesCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>Out of {totalCoursesEnrolled} active courses</div>
                  </div>

                  <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', background: '#f0f9ff', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>XP POINTS EARNED</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0284c7', margin: '0.5rem 0' }}>{completedCoursesCount * 500 + userProgress.reduce((sum, curr) => sum + curr.completedLessons.length * 50, 0)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>Top percentile range rank</div>
                  </div>
                </div>

                {/* EARNED BADGES SUBSECTION */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--koruna-text-dark)' }}>Earned Badges</h3>
                  <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.85rem' }}>Complete quizzes with 100% and fulfill training checklists to unlock special performance badges.</p>

                  <div className="koruna-badge-showcase-grid">
                    {dbService.getBadges().map((b) => {
                      const earned = badges.find(badge => badge.id === b.id);
                      return (
                        <div key={b.id} className={`koruna-badge-item-card ${!earned ? 'locked' : ''}`} style={{ borderTop: earned ? `4px solid ${b.color}` : '1px solid var(--koruna-border-color)' }}>
                          <div className="koruna-badge-item-icon">{b.icon}</div>
                          <div className="koruna-badge-item-name">{b.name}</div>
                          <div className="koruna-badge-item-desc">{b.description}</div>
                          {earned && (
                            <div style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '0.15rem 0.4rem', borderRadius: '4px', marginTop: '0.5rem', fontWeight: 700 }}>
                              UNLOCKED: {earned.dateEarned}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--koruna-text-dark)', marginBottom: '1rem' }}>Active Learning Timeline</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {userProgress.flatMap(p => p.completedLessons.map(lId => {
                      const course = courses.find(c => c.id === p.courseId);
                      const lesson = course?.lessons.find(l => l.id === lId);
                      return {
                        date: 'Completed Lesson',
                        text: `Finished learning lecture topic "${lesson?.title}" in course ${course?.code}`,
                        category: course?.category
                      };
                    })).slice(0, 3).map((act, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', borderLeft: '2px solid var(--koruna-border-color)', paddingLeft: '1.5rem', position: 'relative' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--koruna-primary)', position: 'absolute', left: '-5px', top: '5px' }}></div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>{act.date} • Category: {act.category}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--koruna-text-dark)', fontWeight: 550, marginTop: '0.15rem' }}>{act.text}</div>
                        </div>
                      </div>
                    ))}
                    {completedCoursesCount === 0 && userProgress.reduce((sum, curr) => sum + curr.completedLessons.length, 0) === 0 && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--koruna-text-muted)' }}>No recent learning activity logged.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MY CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div className="koruna-subview-wrapper">
                <h2 className="koruna-section-title" style={{ marginBottom: '1.5rem' }}>My Earned Certificates</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {userProgress.filter(p => p.progressPercent === 100).map((p) => {
                    const course = courses.find(c => c.id === p.courseId);
                    if (!course) return null;
                    const cert = getCertData(p.courseId);
                    return (
                      <div key={p.courseId} style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', boxShadow: 'var(--koruna-card-shadow)', background: '#ffffff' }}>
                        <Award size={36} style={{ color: 'var(--koruna-primary)' }} />
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--koruna-text-dark)', marginBottom: '0.25rem' }}>{course.title}</h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)' }}>Issued: {cert.date} • ID: {cert.id}</p>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--koruna-border-color)' }}>
                          <button
                            className="btn-koruna-outline"
                            style={{ flex: 1, padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                            onClick={() => setViewingCertificate({ course, date: cert.date, id: cert.id })}
                          >
                            <Download size={14} /> View Certificate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {userProgress.filter(p => p.progressPercent === 100).length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--koruna-text-muted)' }}>
                      Complete your enrolled training courses to earn official certificates.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SKILLS DASHBOARD */}
            {activeTab === 'skills' && (
              <div className="koruna-subview-wrapper">
                <h2 className="koruna-section-title" style={{ marginBottom: '1rem' }}>Enterprise Competency & Skills Inventory</h2>
                <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Your skill scores mapped from completed course lessons, trainer assessments, and practical drills.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {[
                    { name: 'Mortgage Processing & Underwriting', category: 'Core Operations', value: userProgress.find(p => p.courseId === 'c1')?.progressPercent || 0, color: 'var(--koruna-primary)' },
                    { name: 'Financial Compliance & KYC Audits', category: 'Regulatory Standards', value: userProgress.find(p => p.courseId === 'c2')?.progressPercent || 0, color: 'var(--koruna-primary)' },
                    { name: 'Customer Service & Advisory Communications', category: 'Relations', value: userProgress.find(p => p.courseId === 'c3')?.progressPercent || 0, color: '#0ea5e9' },
                    { name: 'Artificial Intelligence Tools (Copilots)', category: 'Technology', value: userProgress.find(p => p.courseId === 'c4')?.progressPercent || 0, color: '#8b5cf6' }
                  ].map((skill, i) => (
                    <div key={i} style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--koruna-text-dark)' }}>{skill.name}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>{skill.category}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: skill.value > 0 ? skill.color : '#a1a1aa', fontSize: '1.1rem' }}>{skill.value}%</span>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e4e4e7', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${skill.value}%`, backgroundColor: skill.color, borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: CAREER PATH */}
            {activeTab === 'career' && (
              <div className="koruna-subview-wrapper">
                <h2 className="koruna-section-title" style={{ marginBottom: '1rem' }}>My Career & Promotional Progression</h2>
                <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
                  Review the qualifications and courses needed to achieve your next career rank inside Koruna.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '1rem', bottom: '1rem', left: '1.5rem', width: '2px', backgroundColor: '#e4e4e7', zIndex: 1 }}></div>

                  {[
                    { rank: '1. Junior Operations Officer', status: 'Completed', detail: 'Completed onboarding training and basic regulatory compliance courses.', current: false, color: '#16a34a' },
                    { rank: '2. Associate Loan Consultant', status: 'Active (Current Rank)', detail: 'Working on Mortgage Underwriting Level 2 courses. Requires 40 hours of study time.', current: true, color: 'var(--koruna-primary)' },
                    { rank: '3. Senior Underwriting Specialist', status: 'Locked', detail: 'Requires completion of "Senior Mortgage: VA Loan Specialist", 95% quiz average, and Trainer recommendation.', current: false, color: '#a1a1aa' },
                    { rank: '4. Regional Operations Manager', status: 'Locked', detail: 'Requires completion of "Agile Leadership & Cross-Functional Project Management" and 2 years of active tenure.', current: false, color: '#a1a1aa' }
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1.5rem', zIndex: 2, position: 'relative' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: step.current ? 'var(--koruna-primary)' : step.status === 'Completed' ? '#16a34a' : '#ffffff',
                          border: `2px solid ${step.current ? 'var(--koruna-primary)' : step.status === 'Completed' ? '#16a34a' : '#d1d5db'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: step.status === 'Locked' ? '#9ca3af' : '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}
                      >
                        {i + 1}
                      </div>

                      <div style={{ border: `1px solid ${step.current ? 'var(--koruna-primary)' : 'var(--koruna-border-color)'}`, borderRadius: '12px', padding: '1.25rem', flex: 1, backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--koruna-text-dark)' }}>{step.rank}</h4>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step.color, background: step.current ? 'var(--koruna-primary-light)' : step.status === 'Completed' ? '#dcfce7' : '#f3f4f6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {step.status}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--koruna-text-muted)' }}>{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 8: KNOWLEDGE BASE */}
            {activeTab === 'knowledge_base' && (
              <div className="koruna-subview-wrapper">
                <div style={{ marginBottom: '2rem' }}>
                  <h2 className="koruna-section-title" style={{ marginBottom: '0.5rem' }}>
                    Koruna Central Knowledge Base
                  </h2>
                  <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.95rem' }}>
                    Search guidelines, internal memos, audit documents, and operational standard procedures.
                  </p>
                </div>

                <div style={{ position: 'relative', maxWidth: '600px', marginBottom: '2rem' }}>
                  <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--koruna-text-muted)' }} size={18} />
                  <input
                    type="text"
                    placeholder="Search SOP document name or category..."
                    className="koruna-header-search-input"
                    style={{ width: '100%', paddingLeft: '3rem', border: '1px solid var(--koruna-border-color)', height: '46px' }}
                    value={kbQuery}
                    onChange={(e) => setKbQuery(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {[
                    { title: 'Mortgage Processing SOP v4.2', type: 'SOP Document', updated: '2 days ago', cat: 'Operations' },
                    { title: 'Koruna Employee Code of Conduct & Ethics', type: 'Company Policy', updated: 'Last month', cat: 'Compliance' },
                    { title: 'Client Onboarding & KYC Inspection Checklist', type: 'Form Template', updated: '1 week ago', cat: 'Mortgage' },
                    { title: 'Information Security & Data Backup Guidelines', type: 'IT Policy', updated: '3 weeks ago', cat: 'IT Security' }
                  ].filter(doc => doc.title.toLowerCase().includes(kbQuery.toLowerCase()) || doc.cat.toLowerCase().includes(kbQuery.toLowerCase()))
                    .map((doc, i) => (
                      <div key={i} style={{ border: '1px solid var(--koruna-border-color)', padding: '1.25rem', background: '#ffffff', borderRadius: '12px', boxShadow: 'var(--koruna-card-shadow)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--koruna-primary)', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                          <FileText size={16} /> {doc.type}
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--koruna-text-dark)', marginBottom: '0.5rem' }}>{doc.title}</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>
                          <span>Category: {doc.cat}</span>
                          <span>{doc.updated}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB 9: TEAM REPORTS (TEAM LEADER) */}
            {activeTab === 'team_reports' && (
              <div className="koruna-subview-wrapper">
                <div style={{ marginBottom: '2rem' }}>
                  <h2 className="koruna-section-title" style={{ marginBottom: '0.5rem' }}>
                    Team Progress & Operations Console
                  </h2>
                  <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.95rem' }}>
                    Review quiz metrics, assign training plans, audit practical risk reviews, and monitor timelines.
                  </p>
                </div>

                {/* Sub tabs for Team Leader */}
                <div className="koruna-inner-tab-bar">
                  <button className={`koruna-inner-tab ${activeInnerTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveInnerTab('overview')}>
                    Team Progress Overview
                  </button>
                  <button className={`koruna-inner-tab ${activeInnerTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveInnerTab('assignments')}>
                    Course Assignments
                  </button>
                  <button className={`koruna-inner-tab ${activeInnerTab === 'practicals' ? 'active' : ''}`} onClick={() => setActiveInnerTab('practicals')}>
                    Practical Reviews ({practicals.filter(p => p.status === 'pending').length})
                  </button>
                </div>

                {/* SECTION 9.1: OVERVIEW */}
                {activeInnerTab === 'overview' && (
                  <div>
                    {/* Performance metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
                      <div style={{ border: '1px solid var(--koruna-border-color)', padding: '1.25rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--koruna-text-muted)' }}>TEAM AVERAGE PROGRESS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', marginTop: '0.25rem' }}>
                          {users.length > 0 ? '56.2%' : '0%'}
                        </div>
                      </div>

                      <div style={{ border: '1px solid var(--koruna-border-color)', padding: '1.25rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--koruna-text-muted)' }}>OVERDUE COMPLIANCE ITEMS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ea4335', marginTop: '0.25rem' }}>
                          2 Employees
                        </div>
                      </div>

                      <div style={{ border: '1px solid var(--koruna-border-color)', padding: '1.25rem', background: '#f9fafb', borderRadius: '12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--koruna-text-muted)' }}>PENDING SUBMISSIONS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--koruna-primary)', marginTop: '0.25rem' }}>
                          {practicals.filter(p => p.status === 'pending').length} Cases
                        </div>
                      </div>
                    </div>

                    {/* Team overview listings */}
                    <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--koruna-text-dark)', marginBottom: '1rem' }}>Employee Standings & Quiz Scores</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {users.filter(u => u.role === 'employee').map((emp) => {
                          const userProgList = teamProgress[emp.email.toLowerCase()] || [];
                          return (
                            <div key={emp.email} style={{ padding: '1rem', border: '1px solid var(--koruna-border-color)', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{emp.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>Dept: {emp.department} • {emp.email}</div>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                {userProgList.map(p => {
                                  const course = courses.find(c => c.id === p.courseId);
                                  if (!course) return null;
                                  return (
                                    <div key={p.courseId} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                      <div style={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{course.code}</span>
                                        <span style={{ color: p.progressPercent === 100 ? '#16a34a' : 'var(--koruna-primary)' }}>{p.progressPercent}%</span>
                                      </div>
                                      <div className="koruna-progress-bar-track" style={{ margin: '0.5rem 0', height: '4px' }}>
                                        <div className="koruna-progress-bar-fill" style={{ width: `${p.progressPercent}%` }}></div>
                                      </div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--koruna-text-muted)' }}>
                                        <span>Quiz Score: {p.quizScore !== undefined ? `${p.quizScore}%` : 'N/A'}</span>
                                        <span>Attempts: {p.quizAttempts}</span>
                                      </div>
                                      {p.overdue && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--koruna-border-color)', paddingTop: '0.4rem' }}>
                                          <span style={{ color: '#ef4444', fontWeight: 700 }}>Overdue!</span>
                                          <button
                                            className="btn-koruna-outline"
                                            style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem', height: '22px' }}
                                            disabled={nudgedUsers[`${emp.email}-${course.code}`]}
                                            onClick={() => handleNudgeUser(emp.email, course.code)}
                                          >
                                            {nudgedUsers[`${emp.email}-${course.code}`] ? 'Reminded' : 'Send Nudge'}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 9.2: ASSIGNMENTS */}
                {activeInnerTab === 'assignments' && (
                  <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--koruna-text-dark)', marginBottom: '1rem' }}>Assign Training Plan</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {users.filter(u => u.role === 'employee').map((emp) => (
                        <div key={emp.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '1px solid var(--koruna-border-color)', borderRadius: '8px', flexWrap: 'wrap', gap: '1rem' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>{emp.email} • Dept: {emp.department}</div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)' }}>Quick Assign:</span>
                            {courses.map(course => {
                              const empProg = teamProgress[emp.email.toLowerCase()] || [];
                              const alreadyHas = empProg.some(p => p.courseId === course.id && (p.progressPercent > 0 || p.dueDate));
                              return (
                                <button
                                  key={course.id}
                                  className={alreadyHas ? 'btn-koruna-outline' : 'btn-koruna-solid'}
                                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', height: '28px' }}
                                  onClick={() => handleAssignCourse(course.id, emp.email)}
                                >
                                  {course.code} {alreadyHas ? '✓' : '+'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 9.3: PRACTICAL REVIEWS */}
                {activeInnerTab === 'practicals' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {practicals.filter(p => p.status === 'pending').map((sub) => (
                      <div key={sub.id} style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#ffffff', boxShadow: 'var(--koruna-card-shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--koruna-border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                          <div>
                            <span style={{ fontWeight: 800, color: 'var(--koruna-primary)' }}>{sub.courseTitle}</span>
                            <div style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)' }}>Submitted by: {sub.userName} ({sub.userEmail}) • Date: {sub.dateSubmitted}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--koruna-text-dark)', lineHeight: 1.5, marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--koruna-primary)' }}>
                          "{sub.submissionText}"
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button className="btn-koruna-solid" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleReviewPractical(sub.id, 'approved')}>
                            Approve & Certify
                          </button>
                          <button className="btn-koruna-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleReviewPractical(sub.id, 'rejected')}>
                            Reject / Request Changes
                          </button>
                        </div>
                      </div>
                    ))}
                    {practicals.filter(p => p.status === 'pending').length === 0 && (
                      <div style={{ border: '1px solid var(--koruna-border-color)', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: 'var(--koruna-text-muted)', backgroundColor: '#ffffff' }}>
                        No pending practical assessments requiring your review.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 10: ADMIN & CONTENT SUITE */}
            {activeTab === 'admin_suite' && (
              <AdminSuite
                userSession={userSession}
                userPerms={userPerms}
                activeInnerTab={activeInnerTab}
                setActiveInnerTab={setActiveInnerTab}
                courses={courses}
                users={users}
                departments={departments}
                permissions={permissions}
                settings={settings}
                teamProgress={teamProgress}
                editingCourseId={editingCourseId}
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
                adminUserForm={adminUserForm}
                setAdminUserForm={setAdminUserForm}
                newDeptName={newDeptName}
                setNewDeptName={setNewDeptName}
                handleSaveCourse={handleSaveCourse}
                handleStartEditCourse={handleStartEditCourse}
                handleDeleteCourse={handleDeleteCourse}
                handleAssignCourse={handleAssignCourse}
                handleCreateUser={handleCreateUser}
                handleAddDept={handleAddDept}
                handleUpdateUserDept={handleUpdateUserDept}
                handleUpdateUserRole={handleUpdateUserRole}
                handleDeleteUser={handleDeleteUser}
                handlePermissionToggle={handlePermissionToggle}
                handleSaveSettings={handleSaveSettings}
                addQuizQuestionField={addQuizQuestionField}
                removeQuizQuestionField={removeQuizQuestionField}
                setEditingCourseId={setEditingCourseId}
                showToast={showToast}
                loadPlatformData={loadPlatformData}
              />
            )}
          </>
        )}
      </main>

      {/* 3. CERTIFICATE PRESENTATION VIEW */}
      {viewingCertificate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#f8fafc', overflowY: 'auto' }}>
          <CertificateView
            course={viewingCertificate.course}
            userSession={userSession}
            issueDate={viewingCertificate.date}
            certificateId={viewingCertificate.id}
            onBack={() => setViewingCertificate(null)}
            showToast={showToast}
          />
        </div>
      )}

      {/* SIGN-OUT CONFIRMATION MODAL */}
      {showSignOutConfirm && (
        <div className="koruna-modal-overlay" onClick={() => setShowSignOutConfirm(false)}>
          <div className="koruna-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#fef2f2', color: '#dc2626', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="koruna-placeholder-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Confirm Portal Sign Out</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--koruna-text-muted)', lineHeight: '1.45' }}>
                  Are you sure you want to sign out of Koruna Academy? Your learning progress and study streak will be safely saved.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn-koruna-outline" onClick={() => setShowSignOutConfirm(false)}>
                Cancel
              </button>
              <button
                className="btn-koruna-solid"
                style={{ background: '#dc2626', borderColor: '#dc2626', color: '#ffffff' }}
                onClick={async () => {
                  setShowSignOutConfirm(false);
                  setIsSigningOut(true);
                  setTimeout(() => {
                    onSignOut();
                  }, 2200);
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT LOADING SCREEN MODAL */}
      {isSigningOut && (
        <LoadingModal type="logout" />
      )}
    </div>
  );
};

export default DashboardView;
