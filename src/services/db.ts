import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { UserRole } from './auth';

export interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  moduleId?: string;
  moduleTitle?: string;
  duration?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-3 for MCQ, 0-1 for T/F)
  moduleTitle?: string;
  type?: 'multiple_choice' | 'true_false' | 'short_answer';
  answerText?: string;
}

export interface CourseAssignment {
  userId: string;
  applicationId: number;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  rating: number;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  imgBg: string;
  imageUrl?: string;
  lessons: Lesson[];
  quiz?: QuizQuestion[];
  isAssigned?: boolean;
  assignedUsers?: CourseAssignment[];
  attachments?: { name: string; url: string; size: number }[];
  trainer?: string;
  requirements?: string[];
  contentType?: 'course' | 'document';
  requiresCertification?: boolean;
  documentContent?: string;
  acknowledgmentText?: string;
}

export interface UserProgress {
  userEmail: string;
  courseId: string;
  applicationId?: number; // 4-digit random number
  progressPercent: number;
  completedLessons: string[]; // Lesson IDs
  quizScore?: number; // Highest quiz score percent
  quizAttempts: number;
  learningHours?: number; // Total accumulated learning hours
  practicalStatus: 'none' | 'pending' | 'approved' | 'rejected';
  practicalNotes?: string;
  overdue: boolean;
  dueDate?: string; // Target completion date
  assignedBy?: string;
  lastViewedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji representation
  color: string;
  dateEarned?: string;
}

export interface PracticalSubmission {
  id: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  submissionText: string;
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
}

export interface Notification {
  id: string;
  userEmail: string;
  courseId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  assignedBy?: string;
}

export interface PostItem {
  id: string;
  authorId?: string;
  authorName: string;
  authorEmail?: string;
  authorRole: string;
  authorAvatar: string;
  authorBgColor: string;
  timeAgo: string;
  createdAt?: string;
  category: 'Announcements' | 'Recognition' | 'Team Updates' | 'Learning' | 'Events';
  badgeText?: string;
  content: string;
  imageUrl?: string;
  attachedDocPreview?: boolean;
  docTitle?: string;
  likesCount: number;
  celebratesCount: number;
  comments: { id: string; author: string; text: string; timeAgo: string; createdAt?: string }[];
  likedBy?: string[];
  celebratedBy?: string[];
  bookmarkedBy?: string[];
  isLiked?: boolean;
  isCelebrated?: boolean;
  isBookmarked?: boolean;
  isNew?: boolean;
}

export interface PostReaction {
  id: string;
  postId: string;
  userKey: string;
  type: 'like' | 'celebrate' | 'bookmark';
  createdAt: string;
}


export interface Department {
  id: string;
  name: string;
}

export interface SystemSettings {
  quizPassingThreshold: number; // e.g., 70
  autoEnrollNewUsers: boolean;
  emailReminders: boolean;
  darkSidebar: boolean;
}

export interface RolePermissions {
  role: UserRole;
  permissions: {
    viewDashboard: boolean;
    studyCourses: boolean;
    viewTeamReports: boolean;
    assignCourses: boolean;
    approveAssessments: boolean;
    editCourses: boolean;
    manageUsers: boolean;
    systemSettings: boolean;
  };
}

export interface DatabaseUser {
  id: string;
  userId?: number; // 4-digit ID
  name: string;
  email: string;
  role: UserRole;
  department: string;
  createdAt: string;
}

// ==========================================
// SEED DATA PRESETS
// ==========================================

const DEFAULT_COURSES: Course[] = [];


const DEFAULT_BADGES: Badge[] = [
  { id: 'b1', name: '12-Day Streak', description: 'Maintained a 12-day learning streak in the Koruna Portal.', icon: '🔥', color: '#ec4899' },
  { id: 'b2', name: 'Compliance Officer', description: 'Scored 100% on the Regulatory Compliance course quiz.', icon: '⚖️', color: '#10b981' },
  { id: 'b3', name: 'Fast Starter', description: 'Completed your first course lesson in Koruna Academy.', icon: '⚡', color: '#3b82f6' },
  { id: 'b4', name: 'Certified Specialist', description: 'Earned a formal certificate in Mortgage Underwriting.', icon: '🎓', color: '#8b5cf6' }
];

const DEFAULT_USERS: DatabaseUser[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex.rivera@koruna.com', role: 'employee', department: 'Lending', createdAt: '2026-01-10' },
  { id: 'u2', name: 'Sarah Chen', email: 'sarah.chen@koruna.com', role: 'team_leader', department: 'Operations', createdAt: '2026-01-05' },
  { id: 'u3', name: 'Dr. Marcus Vance', email: 'dr.vance@koruna.com', role: 'trainer', department: 'Content Development', createdAt: '2026-01-02' },
  { id: 'u4', name: 'Global Admin', email: 'admin.learning@koruna.com', role: 'admin', department: 'IT & Administration', createdAt: '2026-01-01' },
  { id: 'u5', name: 'Jessica Taylor', email: 'jessica.taylor@koruna.com', role: 'employee', department: 'Lending', createdAt: '2026-02-15' },
  { id: 'u6', name: 'Jordan Taylor', email: 'jordan.taylor@koruna.com', role: 'employee', department: 'Software Engineering', createdAt: '2026-03-01' }
];

const DEFAULT_PRACTICALS: PracticalSubmission[] = [];

const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Software Engineering' },
  { id: 'd2', name: 'Product & Design' },
  { id: 'd3', name: 'Lending' },
  { id: 'd4', name: 'Business Operations' },
  { id: 'd5', name: 'Data & AI Practice' },
  { id: 'd6', name: 'Executive Leadership' },
  { id: 'd7', name: 'IT & Administration' },
  { id: 'd8', name: 'Content Development' }
];

const DEFAULT_SETTINGS: SystemSettings = {
  quizPassingThreshold: 75,
  autoEnrollNewUsers: true,
  emailReminders: true,
  darkSidebar: true
};

const DEFAULT_PERMISSIONS: RolePermissions[] = [
  {
    role: 'employee',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: false,
      assignCourses: false,
      approveAssessments: false,
      editCourses: false,
      manageUsers: false,
      systemSettings: false
    }
  },
  {
    role: 'team_leader',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: true,
      assignCourses: true,
      approveAssessments: true,
      editCourses: false,
      manageUsers: false,
      systemSettings: false
    }
  },
  {
    role: 'trainer',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: true,
      assignCourses: true,
      approveAssessments: false,
      editCourses: true,
      manageUsers: false,
      systemSettings: false
    }
  },
  {
    role: 'admin',
    permissions: {
      viewDashboard: true,
      studyCourses: true,
      viewTeamReports: true,
      assignCourses: true,
      approveAssessments: true,
      editCourses: true,
      manageUsers: true,
      systemSettings: true
    }
  }
];

// ==========================================
// STORE STORAGE HELPERS
// ==========================================

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Failed to save key "${key}" to localStorage:`, err);
  }
};

const STATIC_SEED_IDS = new Set(['c1', 'c2', 'c3', 'c4']);

export function filterStaticSeeds<T extends { id?: string; courseId?: string }>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter(item => {
    const id = item?.id || item?.courseId;
    return !id || !STATIC_SEED_IDS.has(id);
  });
};

// --- DATABASE DTO MAPPERS ---
const parseAssignedUsers = (val: any): CourseAssignment[] => {
  if (!val) return [];
  let arr = val;
  if (typeof val === 'string') {
    try {
      arr = JSON.parse(val);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(item => {
    if (typeof item === 'string') {
      try {
        return JSON.parse(item);
      } catch (e) {
        return null;
      }
    }
    return item;
  }).filter((x): x is CourseAssignment => x !== null && typeof x === 'object' && 'userId' in x);
};

const encodeCourseMetadataInDescription = (c: Course): string => {
  let desc = c.description || '';
  const firstTagIdx = desc.indexOf('\n\n[');
  if (firstTagIdx !== -1) {
    desc = desc.substring(0, firstTagIdx);
  }

  if (c.trainer) {
    desc += `\n\n[TRAINER]:${c.trainer}`;
  }
  if (c.attachments && c.attachments.length > 0) {
    desc += `\n\n[ATTACHMENTS]:${JSON.stringify(c.attachments)}`;
  }
  if (c.requirements && c.requirements.length > 0) {
    desc += `\n\n[REQUIREMENTS]:${JSON.stringify(c.requirements)}`;
  }
  if (c.contentType) {
    desc += `\n\n[CONTENT_TYPE]:${c.contentType}`;
  }
  if (c.documentContent) {
    desc += `\n\n[DOCUMENT_CONTENT]:${c.documentContent}`;
  }
  if (c.acknowledgmentText) {
    desc += `\n\n[ACKNOWLEDGMENT_TEXT]:${c.acknowledgmentText}`;
  }
  if (c.requiresCertification !== undefined) {
    desc += `\n\n[REQUIRES_CERTIFICATION]:${c.requiresCertification}`;
  }
  return desc;
};

const mapDBCourse = (db: any): Course => {
  let attachments: { name: string; url: string; size: number }[] = [];
  let trainer: string | undefined = undefined;
  let requirements: string[] | undefined = undefined;
  let contentType: 'course' | 'document' = 'course';
  let documentContent: string | undefined = undefined;
  let acknowledgmentText: string | undefined = undefined;
  let requiresCertification: boolean = true;

  if (db.attachments !== undefined && db.attachments !== null) {
    attachments = typeof db.attachments === 'string' ? JSON.parse(db.attachments) : (db.attachments || []);
  }
  if (db.trainer !== undefined && db.trainer !== null) {
    trainer = db.trainer;
  }
  if (db.requirements !== undefined && db.requirements !== null) {
    requirements = typeof db.requirements === 'string' ? JSON.parse(db.requirements) : (db.requirements || []);
  }
  if (db.content_type || db.contentType) {
    contentType = db.content_type || db.contentType;
  }
  if (db.document_content || db.documentContent) {
    documentContent = db.document_content || db.documentContent;
  }
  if (db.acknowledgment_text || db.acknowledgmentText) {
    acknowledgmentText = db.acknowledgment_text || db.acknowledgmentText;
  }
  if (db.requires_certification !== undefined) {
    requiresCertification = Boolean(db.requires_certification);
  } else if (db.requiresCertification !== undefined) {
    requiresCertification = Boolean(db.requiresCertification);
  }

  const descVal = db.description || '';
  let description = descVal;

  const tagPrefixes = [
    '\n\n[ATTACHMENTS]:',
    '\n\n[TRAINER]:',
    '\n\n[REQUIREMENTS]:',
    '\n\n[CONTENT_TYPE]:',
    '\n\n[DOCUMENT_CONTENT]:',
    '\n\n[ACKNOWLEDGMENT_TEXT]:',
    '\n\n[REQUIRES_CERTIFICATION]:'
  ];

  const tagIndices = tagPrefixes.map(prefix => descVal.indexOf(prefix)).filter(i => i !== -1);
  if (tagIndices.length > 0) {
    const minIdx = Math.min(...tagIndices);
    description = descVal.substring(0, minIdx);
  }

  if (attachments.length === 0 && descVal.includes('\n\n[ATTACHMENTS]:')) {
    try {
      const match = descVal.match(/\n\n\[ATTACHMENTS\]:([\s\S]*?)(?=\n\n\[|$)/);
      if (match && match[1]) attachments = JSON.parse(match[1]);
    } catch (e) { }
  }

  if (!trainer && descVal.includes('\n\n[TRAINER]:')) {
    const match = descVal.match(/\n\n\[TRAINER\]:([\s\S]*?)(?=\n\n\[|$)/);
    if (match && match[1]) trainer = match[1].trim();
  }

  if ((!requirements || requirements.length === 0) && descVal.includes('\n\n[REQUIREMENTS]:')) {
    try {
      const match = descVal.match(/\n\n\[REQUIREMENTS\]:([\s\S]*?)(?=\n\n\[|$)/);
      if (match && match[1]) requirements = JSON.parse(match[1]);
    } catch (e) { }
  }

  if (!db.content_type && !db.contentType && descVal.includes('\n\n[CONTENT_TYPE]:')) {
    const match = descVal.match(/\n\n\[CONTENT_TYPE\]:([\s\S]*?)(?=\n\n\[|$)/);
    if (match && match[1]) contentType = match[1].trim() as any;
  }

  if (!db.document_content && !db.documentContent && descVal.includes('\n\n[DOCUMENT_CONTENT]:')) {
    const match = descVal.match(/\n\n\[DOCUMENT_CONTENT\]:([\s\S]*?)(?=\n\n\[|$)/);
    if (match && match[1]) documentContent = match[1].trim();
  }

  if (!db.acknowledgment_text && !db.acknowledgmentText && descVal.includes('\n\n[ACKNOWLEDGMENT_TEXT]:')) {
    const match = descVal.match(/\n\n\[ACKNOWLEDGMENT_TEXT\]:([\s\S]*?)(?=\n\n\[|$)/);
    if (match && match[1]) acknowledgmentText = match[1].trim();
  }

  if (db.requires_certification === undefined && db.requiresCertification === undefined && descVal.includes('\n\n[REQUIRES_CERTIFICATION]:')) {
    const match = descVal.match(/\n\n\[REQUIRES_CERTIFICATION\]:([\s\S]*?)(?=\n\n\[|$)/);
    if (match && match[1]) requiresCertification = match[1].trim() === 'true';
  }

  return {
    id: db.id,
    title: db.title,
    category: db.category,
    rating: Number(db.rating || 4.5),
    code: db.code,
    level: db.level,
    description,
    imgBg: db.img_bg || '#e0f2fe',
    imageUrl: db.image_url || db.imageUrl || undefined,
    lessons: typeof db.lessons === 'string' ? JSON.parse(db.lessons) : (db.lessons || []),
    quiz: typeof db.quiz === 'string' ? JSON.parse(db.quiz) : (db.quiz || []),
    assignedUsers: parseAssignedUsers(db.assigned_users),
    attachments,
    trainer,
    requirements,
    contentType,
    requiresCertification,
    documentContent,
    acknowledgmentText
  };
};

const mapCourseToDB = (c: Course) => {
  return {
    id: c.id,
    title: c.title,
    category: c.category,
    rating: c.rating,
    code: c.code,
    level: c.level,
    description: c.description,
    img_bg: c.imgBg,
    image_url: c.imageUrl || null,
    lessons: JSON.stringify(c.lessons || []),
    quiz: JSON.stringify(c.quiz || []),
    assigned_users: JSON.stringify(c.assignedUsers || []),
    attachments: JSON.stringify(c.attachments || []),
    trainer: c.trainer || null,
    requirements: JSON.stringify(c.requirements || []),
    content_type: c.contentType || 'course',
    requires_certification: c.requiresCertification !== undefined ? c.requiresCertification : true,
    document_content: c.documentContent || null,
    acknowledgment_text: c.acknowledgmentText || null
  };
};

export function calculateCourseLearningHours(course?: Course, progressPercent: number = 100): number {
  if (!course || !course.lessons || course.lessons.length === 0) {
    return Number(((progressPercent / 100) * 1.0).toFixed(1));
  }
  const totalHours = course.lessons.reduce((acc, l) => {
    if (l.duration) {
      const match = l.duration.match(/(\d+(?:\.\d+)?)\s*(min|m|h|hour)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        return acc + (unit.startsWith('h') ? val : val / 60);
      }
    }
    return acc + 0.5;
  }, 0);
  const finalTotal = Math.max(totalHours, 0.5);
  return Number(((progressPercent / 100) * finalTotal).toFixed(1));
}

const mapDBProgress = (db: any): UserProgress => ({
  userEmail: db.user_email?.toLowerCase() || '',
  courseId: db.course_id,
  applicationId: db.application_id !== null && db.application_id !== undefined ? Number(db.application_id) : undefined,
  progressPercent: Number(db.progress_percent || 0),
  completedLessons: typeof db.completed_lessons === 'string' ? JSON.parse(db.completed_lessons) : (db.completed_lessons || []),
  quizScore: db.quiz_score !== null && db.quiz_score !== undefined ? Number(db.quiz_score) : undefined,
  quizAttempts: Number(db.quiz_attempts || 0),
  learningHours: db.learning_hours !== null && db.learning_hours !== undefined ? Number(db.learning_hours) : (db.learningHours !== undefined ? Number(db.learningHours) : undefined),
  practicalStatus: db.practical_status || 'none',
  practicalNotes: db.practical_notes || undefined,
  overdue: Boolean(db.overdue),
  dueDate: db.due_date || undefined,
  assignedBy: db.assigned_by || undefined,
  lastViewedAt: db.last_viewed_at || undefined
});

const mapProgressToDB = (p: UserProgress) => {
  const obj: Record<string, any> = {
    user_email: p.userEmail.toLowerCase(),
    course_id: p.courseId,
    application_id: p.applicationId || 0,
    progress_percent: p.progressPercent,
    completed_lessons: JSON.stringify(p.completedLessons),
    quiz_score: p.quizScore !== undefined ? p.quizScore : null,
    quiz_attempts: p.quizAttempts,
    practical_status: p.practicalStatus,
    practical_notes: p.practicalNotes || null,
    overdue: p.overdue,
    due_date: p.dueDate || null,
    assigned_by: p.assignedBy || null
  };
  if (p.learningHours !== undefined && p.learningHours !== null) {
    obj.learning_hours = p.learningHours;
  }
  if (p.lastViewedAt !== undefined && p.lastViewedAt !== null) {
    obj.last_viewed_at = p.lastViewedAt;
  }
  return obj;
};

const mapDBPractical = (db: any): PracticalSubmission => ({
  id: db.id,
  userEmail: db.user_email,
  userName: db.user_name,
  courseId: db.course_id,
  courseTitle: db.course_title,
  submissionText: db.submission_text,
  status: db.status || 'pending',
  dateSubmitted: db.date_submitted
});

const mapPracticalToDB = (s: PracticalSubmission) => ({
  id: s.id,
  user_email: s.userEmail,
  user_name: s.userName,
  course_id: s.courseId,
  course_title: s.courseTitle,
  submission_text: s.submissionText,
  status: s.status,
  date_submitted: s.dateSubmitted
});

const mapDBNotification = (db: any): Notification => ({
  id: db.id,
  userEmail: db.user_email?.toLowerCase() || '',
  courseId: db.course_id || undefined,
  title: db.title,
  message: db.message,
  type: db.type || 'other',
  isRead: Boolean(db.is_read),
  createdAt: db.created_at || new Date().toISOString(),
  assignedBy: db.assigned_by || undefined
});

const mapNotificationToDB = (n: Notification) => ({
  id: n.id,
  user_email: n.userEmail.toLowerCase(),
  course_id: n.courseId || null,
  title: n.title,
  message: n.message,
  type: n.type,
  is_read: n.isRead,
  created_at: n.createdAt,
  assigned_by: n.assignedBy || null
});

const parseStringArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return [];
    }
  }
  return [];
};

const nowMs = Date.now();
const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'hpost-1',
    authorName: 'Airsea Estinor',
    authorRole: 'Team Lead · Financial Koalas',
    authorAvatar: 'AE',
    authorBgColor: '#880e4f',
    timeAgo: '2h ago',
    createdAt: new Date(nowMs - 2 * 3600 * 1000).toISOString(),
    category: 'Recognition',
    badgeText: '🎉 Recognised Alexcis · +200 Koruna Points',
    content: 'Thank you for going above and beyond for the client this week, Alexcis — your attention to detail made all the difference.',
    likesCount: 14,
    celebratesCount: 8,
    comments: [
      { id: 'c1', author: 'Alexcis', text: 'Thank you Airsea! Really appreciate the recognition! 🙏', timeAgo: '1h ago', createdAt: new Date(nowMs - 3600 * 1000).toISOString() }
    ],
    likedBy: [],
    celebratedBy: [],
    bookmarkedBy: [],
    isLiked: false,
    isCelebrated: false,
    isBookmarked: false
  },
  {
    id: 'hpost-2',
    authorName: 'HR Team',
    authorRole: 'Announcement',
    authorAvatar: 'HR',
    authorBgColor: '#9d174d',
    timeAgo: '5h ago',
    createdAt: new Date(nowMs - 5 * 3600 * 1000).toISOString(),
    category: 'Announcements',
    content: 'October Public Holiday Schedule is now available in the Knowledge Hub. Please review before planning your leave.',
    attachedDocPreview: true,
    docTitle: 'October-holiday-schedule.pdf',
    likesCount: 32,
    celebratesCount: 12,
    comments: [],
    likedBy: [],
    celebratedBy: [],
    bookmarkedBy: [],
    isLiked: false,
    isCelebrated: false,
    isBookmarked: false
  },
  {
    id: 'hpost-3',
    authorName: 'Lending Wombats',
    authorRole: 'Team Update',
    authorAvatar: 'LW',
    authorBgColor: '#be185d',
    timeAgo: '1d ago',
    createdAt: new Date(nowMs - 24 * 3600 * 1000).toISOString(),
    category: 'Team Updates',
    content: 'Congratulations Team Lending Wombats on hitting this quarter\'s client satisfaction target!',
    likesCount: 45,
    celebratesCount: 29,
    comments: [
      { id: 'c2', author: 'Jessica Timon', text: 'Kudos team! Outstanding effort!', timeAgo: '1d ago', createdAt: new Date(nowMs - 24 * 3600 * 1000).toISOString() }
    ],
    likedBy: [],
    celebratedBy: [],
    bookmarkedBy: [],
    isLiked: false,
    isCelebrated: false,
    isBookmarked: false
  }
];

const mapDBPost = (db: any): PostItem => {
  const likedBy = parseStringArray(db.liked_by ?? db.likedBy);
  const celebratedBy = parseStringArray(db.celebrated_by ?? db.celebratedBy);
  const bookmarkedBy = parseStringArray(db.bookmarked_by ?? db.bookmarkedBy);

  return {
    id: String(db.id),
    authorId: db.user_id ? String(db.user_id) : (db.author_id ? String(db.author_id) : (db.authorId ? String(db.authorId) : undefined)),
    authorName: db.author_name || db.authorName || 'Koruna Member',
    authorEmail: db.author_email || db.authorEmail || undefined,
    authorRole: db.author_role || db.authorRole || 'Team Member',
    authorAvatar: db.author_avatar || db.authorAvatar || 'KM',
    authorBgColor: db.author_bg_color || db.authorBgColor || '#a31555',
    timeAgo: db.time_ago || db.timeAgo || 'Recently',
    createdAt: db.created_at || db.createdAt || undefined,
    category: db.category || 'Team Updates',
    badgeText: db.badge_text || db.badgeText || undefined,
    content: db.content || '',
    imageUrl: db.image_url || db.imageUrl || undefined,
    attachedDocPreview: Boolean(db.attached_doc_preview || db.attachedDocPreview),
    docTitle: db.doc_title || db.docTitle || undefined,
    likesCount: Number(db.likes_count ?? db.likesCount ?? 0),
    celebratesCount: Number(db.celebrates_count ?? db.celebratesCount ?? 0),
    comments: typeof db.comments === 'string' ? JSON.parse(db.comments) : (db.comments || []),
    likedBy,
    celebratedBy,
    bookmarkedBy,
    isLiked: Boolean(db.is_liked || db.isLiked),
    isCelebrated: Boolean(db.is_celebrated || db.isCelebrated),
    isBookmarked: Boolean(db.is_bookmarked || db.isBookmarked),
    isNew: Boolean(db.is_new || db.isNew)
  };
};

const mapPostToDB = (p: PostItem) => ({
  id: p.id,
  user_id: p.authorId || null,
  author_name: p.authorName,
  author_email: p.authorEmail || null,
  author_role: p.authorRole,
  author_avatar: p.authorAvatar,
  author_bg_color: p.authorBgColor,
  time_ago: p.timeAgo,
  created_at: p.createdAt || new Date().toISOString(),
  category: p.category,
  badge_text: p.badgeText || null,
  content: p.content,
  image_url: p.imageUrl || null,
  attached_doc_preview: p.attachedDocPreview || false,
  doc_title: p.docTitle || null,
  likes_count: p.likesCount,
  celebrates_count: p.celebratesCount,
  comments: p.comments || [],
  liked_by: JSON.stringify(p.likedBy || []),
  celebrated_by: JSON.stringify(p.celebratedBy || []),
  bookmarked_by: JSON.stringify(p.bookmarkedBy || []),
  is_liked: p.isLiked || false,
  is_celebrated: p.isCelebrated || false,
  is_bookmarked: p.isBookmarked || false
});


// ==========================================
// REAL-TIME COURSES SUBSCRIPTION HELPERS
// ==========================================
const courseListeners = new Set<(courses: Course[]) => void>();
let realtimeChannel: any = null;
let realtimeBroadcastChannel: BroadcastChannel | null = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('koruna_courses_sync') : null;
let debounceCoursesTimeout: ReturnType<typeof setTimeout> | null = null;

const notifyCourseListeners = () => {
  if (debounceCoursesTimeout) {
    clearTimeout(debounceCoursesTimeout);
  }
  debounceCoursesTimeout = setTimeout(async () => {
    try {
      const freshCourses = await dbService.getCourses();
      courseListeners.forEach(listener => {
        try {
          listener(freshCourses);
        } catch (err) {
          console.error('[Realtime Courses] Error in listener callback:', err);
        }
      });
    } catch (err) {
      console.error('[Realtime Courses] Error fetching updated courses:', err);
    }
  }, 100);
};

// ==========================================
// DB SERVICE API
// ==========================================

export const dbService = {
  notifyCoursesChanged(): void {
    if (realtimeBroadcastChannel) {
      try {
        realtimeBroadcastChannel.postMessage({ type: 'COURSES_UPDATED' });
      } catch (_) {}
    }
    notifyCourseListeners();
  },

  subscribeToCourses(callback: (courses: Course[]) => void): () => void {
    courseListeners.add(callback);

    // Initial load callback
    this.getCourses().then(courses => {
      try {
        callback(courses);
      } catch (err) {
        console.error('[Realtime Courses] Initial fetch callback error:', err);
      }
    });

    // 1. Initialize Supabase Realtime WebSocket channel if configured
    if (isSupabaseConfigured() && !realtimeChannel) {
      try {
        realtimeChannel = supabase
          .channel('public:courses_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'courses' },
            (payload) => {
              console.log('[Supabase Realtime] Event on "courses":', payload.eventType);
              notifyCourseListeners();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'documents' },
            (payload) => {
              console.log('[Supabase Realtime] Event on "documents":', payload.eventType);
              notifyCourseListeners();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'course_assignments' },
            (payload) => {
              console.log('[Supabase Realtime] Event on "course_assignments":', payload.eventType);
              notifyCourseListeners();
            }
          )
          .subscribe((status) => {
            console.log('[Supabase Realtime] Channel status for courses:', status);
          });
      } catch (err) {
        console.error('[Supabase Realtime] Subscription error:', err);
      }
    }

    // 2. Listen to BroadcastChannel for cross-tab sync
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data && event.data.type === 'COURSES_UPDATED') {
        notifyCourseListeners();
      }
    };
    if (realtimeBroadcastChannel) {
      realtimeBroadcastChannel.addEventListener('message', handleBroadcast);
    }

    // 3. Periodic fallback poll (every 5 seconds) to ensure real-time status under any network conditions
    const intervalId = setInterval(() => {
      notifyCourseListeners();
    }, 5000);

    return () => {
      courseListeners.delete(callback);
      clearInterval(intervalId);
      if (realtimeBroadcastChannel) {
        realtimeBroadcastChannel.removeEventListener('message', handleBroadcast);
      }
      if (courseListeners.size === 0 && realtimeChannel) {
        try {
          supabase.removeChannel(realtimeChannel);
        } catch (_) {}
        realtimeChannel = null;
      }
    };
  },

  // --- SYSTEM SETTINGS ---
  getSettings(): SystemSettings {
    return getStorageItem<SystemSettings>('koruna_settings', DEFAULT_SETTINGS);
  },
  saveSettings(settings: SystemSettings): void {
    setStorageItem('koruna_settings', settings);
  },

  // --- USER ROLES & PERMISSIONS ---
  getPermissions(): RolePermissions[] {
    const perms = getStorageItem<RolePermissions[]>('koruna_permissions', DEFAULT_PERMISSIONS);
    const trainerPerms = perms.find(p => p.role === 'trainer');
    if (trainerPerms && !trainerPerms.permissions.assignCourses) {
      trainerPerms.permissions.assignCourses = true;
      setStorageItem('koruna_permissions', perms);
    }
    return perms;
  },
  savePermissions(perms: RolePermissions[]): void {
    setStorageItem('koruna_permissions', perms);
  },
  getRolePermissions(): RolePermissions[] {
    return this.getPermissions();
  },
  saveRolePermissions(permissions: RolePermissions[]): void {
    this.savePermissions(permissions);
  },

  // --- DEPARTMENTS ---
  getDepartments(): Department[] {
    return getStorageItem<Department[]>('koruna_departments', DEFAULT_DEPARTMENTS);
  },
  addDepartment(name: string): Department {
    const deps = this.getDepartments();
    const newDep: Department = {
      id: `d-${Date.now()}`,
      name
    };
    deps.push(newDep);
    setStorageItem('koruna_departments', deps);
    return newDep;
  },

  // --- USERS ---
  async getUsers(): Promise<DatabaseUser[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');
        if (data && !error) {
          return data.map((u: any) => ({
            id: u.id,
            userId: u.user_id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            createdAt: u.created_at
          }));
        }
      } catch (err) {
        console.error('Failed to get users from Supabase:', err);
      }
    }
    return getStorageItem<DatabaseUser[]>('koruna_users', DEFAULT_USERS);
  },

  async saveUser(user: Omit<DatabaseUser, 'id'> & { id?: string }): Promise<DatabaseUser> {
    const newUser: DatabaseUser = {
      ...user,
      id: user.id || `u-${Date.now()}`
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('users').upsert({
          id: newUser.id,
          user_id: newUser.userId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          created_at: newUser.createdAt
        });
      } catch (err) {
        console.error('Supabase saveUser failed:', err);
      }
    }

    const users = getStorageItem<DatabaseUser[]>('koruna_users', DEFAULT_USERS);
    const idx = users.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (idx !== -1) {
      users[idx] = newUser;
    } else {
      users.push(newUser);
    }
    setStorageItem('koruna_users', users);
    return newUser;
  },

  async deleteUser(email: string): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && isSupabaseConfigured() && user.id && !user.id.startsWith('u')) {
      try {
        await supabase.from('users').delete().eq('id', user.id);
      } catch (err) {
        console.error('Supabase delete user failed:', err);
      }
    }
    const filtered = users.filter(u => u.email.toLowerCase() !== email.toLowerCase());
    setStorageItem('koruna_users', filtered);
  },

  // --- COURSES & DOCUMENTS ---
  async getCourses(): Promise<Course[]> {
    let dbCourses: Course[] = [];
    let dbDocs: Course[] = [];
    let fetchedFromSupabase = false;
    const assignmentsMap: Record<string, CourseAssignment[]> = {};

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*');
        if (data && !error) {
          if (data.length === 0 && DEFAULT_COURSES.length > 0) {
            const coursesToInsert = DEFAULT_COURSES.map(c => mapCourseToDB(c));
            const { error: insErr } = await supabase.from('courses').insert(coursesToInsert);
            if (!insErr) {
              dbCourses = DEFAULT_COURSES;
            }
          } else {
            dbCourses = filterStaticSeeds(data.map(db => mapDBCourse(db)));
          }
          fetchedFromSupabase = true;
        }
      } catch (err) {
        console.error('Failed to get courses from Supabase:', err);
      }

      try {
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*');
        if (docsData && !docsError) {
          dbDocs = filterStaticSeeds(docsData.map(db => mapDBCourse(db)));
          fetchedFromSupabase = true;
        }
      } catch (err) {
        console.error('Failed to get documents from Supabase:', err);
      }

      try {
        const { data: assignData, error: assignErr } = await supabase
          .from('course_assignments')
          .select('*');
        if (assignData && !assignErr) {
          assignData.forEach((row: any) => {
            const cid = String(row.course_id);
            if (!assignmentsMap[cid]) {
              assignmentsMap[cid] = [];
            }
            assignmentsMap[cid].push({
              userId: String(row.user_id),
              applicationId: Number(row.application_id || 0)
            });
          });
        }
      } catch (err) {
        console.warn('Failed to query course_assignments table from Supabase:', err);
      }
    }

    if (fetchedFromSupabase) {
      // Return strictly courses/documents fetched from Supabase table, with course_assignments mapped
      const courseMap = new Map<string, Course>();
      [...dbCourses, ...dbDocs].forEach(c => {
        if (assignmentsMap[c.id] && assignmentsMap[c.id].length > 0) {
          const existing = c.assignedUsers || [];
          const merged = [...existing];
          assignmentsMap[c.id].forEach(a => {
            if (!merged.some(m => m.userId === a.userId)) {
              merged.push(a);
            }
          });
          c.assignedUsers = merged;
        }
        courseMap.set(c.id, c);
      });
      return filterStaticSeeds(Array.from(courseMap.values()));
    }

    const rawLocalCourses = getStorageItem<Course[]>('koruna_courses', []);
    const localCourses = filterStaticSeeds(rawLocalCourses);
    if (localCourses.length !== rawLocalCourses.length) {
      setStorageItem('koruna_courses', localCourses);
    }

    const localDocs = filterStaticSeeds(getStorageItem<Course[]>('koruna_documents', []));
    const localAll = filterStaticSeeds([...localCourses, ...localDocs]);

    return localAll;
  },

  async getCourseById(id: string): Promise<Course | undefined> {
    const courses = await this.getCourses();
    return courses.find(c => c.id === id);
  },

  async saveCourse(course: Course): Promise<Course> {
    const isDocument = course.contentType === 'document';
    const targetStorageKey = isDocument ? 'koruna_documents' : 'koruna_courses';
    const otherStorageKey = isDocument ? 'koruna_courses' : 'koruna_documents';

    // 1. Always save to LocalStorage immediately
    const targetList = getStorageItem<Course[]>(targetStorageKey, isDocument ? [] : DEFAULT_COURSES);
    const idx = targetList.findIndex(c => c.id === course.id);
    if (idx !== -1) {
      targetList[idx] = course;
    } else {
      targetList.push(course);
    }
    setStorageItem(targetStorageKey, targetList);

    // Clean up from other storage if moving types
    const otherList = getStorageItem<Course[]>(otherStorageKey, isDocument ? DEFAULT_COURSES : []);
    const filteredOther = otherList.filter(c => c.id !== course.id);
    if (filteredOther.length !== otherList.length) {
      setStorageItem(otherStorageKey, filteredOther);
    }

    // 2. ALWAYS sync to Supabase "courses" table so created courses are saved for easy access and fetching
    if (isSupabaseConfigured()) {
      try {
        const fullDbCourse = mapCourseToDB(course);
        const { error: primaryErr } = await supabase.from('courses').upsert(fullDbCourse);

        if (primaryErr) {
          console.warn('Primary upsert to Supabase "courses" table returned error, trying fallback payload:', primaryErr);

          const descWithMetadata = encodeCourseMetadataInDescription(course);
          const fallbackCourse = {
            id: course.id,
            title: course.title,
            category: course.category,
            rating: course.rating || 4.5,
            code: course.code,
            level: course.level,
            description: descWithMetadata,
            img_bg: course.imgBg,
            image_url: course.imageUrl || null,
            lessons: JSON.stringify(course.lessons || []),
            quiz: JSON.stringify(course.quiz || []),
            assigned_users: JSON.stringify(course.assignedUsers || []),
            attachments: JSON.stringify(course.attachments || []),
            trainer: course.trainer || null,
            requirements: JSON.stringify(course.requirements || [])
          };

          const { error: fbErr } = await supabase.from('courses').upsert(fallbackCourse);
          if (fbErr) {
            console.error('Fallback upsert to Supabase "courses" table failed:', fbErr);
          } else {
            console.log(`Successfully saved course "${course.title}" (${course.id}) to Supabase "courses" table via fallback payload.`);
          }
        } else {
          console.log(`Successfully saved course "${course.title}" (${course.id}) to Supabase "courses" table.`);
        }

        // Dual-write to 'documents' table if it's a document and table exists
        if (isDocument) {
          try {
            await supabase.from('documents').upsert(fullDbCourse);
          } catch (_) {
            // documents table is optional
          }
        }
      } catch (err) {
        console.error('Supabase saveCourse failed:', err);
      }
    }

    this.notifyCoursesChanged();
    return course;
  },

  async deleteCourse(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('courses').delete().eq('id', id);
        await supabase.from('documents').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase deleteCourse failed:', err);
      }
    }

    const courses = getStorageItem<Course[]>('koruna_courses', DEFAULT_COURSES);
    const filteredCourses = courses.filter(c => c.id !== id);
    setStorageItem('koruna_courses', filteredCourses);

    const docs = getStorageItem<Course[]>('koruna_documents', []);
    const filteredDocs = docs.filter(c => c.id !== id);
    setStorageItem('koruna_documents', filteredDocs);

    this.notifyCoursesChanged();
  },

  // --- USER PROGRESS ---
  getProgressList(): UserProgress[] {
    const rawList = getStorageItem<UserProgress[]>('koruna_progress', []);
    const filtered = filterStaticSeeds(rawList);
    if (filtered.length !== rawList.length) {
      setStorageItem('koruna_progress', filtered);
    }
    return filtered;
  },

  async getUserProgress(email: string): Promise<UserProgress[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_email', email.toLowerCase());

        if (data && !error) {
          const userProg = filterStaticSeeds(data.map(db => mapDBProgress(db)));
          const courses = await this.getCourses();

          for (const c of courses) {
            if (!userProg.some(p => p.courseId === c.id)) {
              const newProg: UserProgress = {
                userEmail: email.toLowerCase(),
                courseId: c.id,
                progressPercent: 0,
                completedLessons: [],
                quizAttempts: 0,
                practicalStatus: 'none',
                overdue: false
              };
              await this.saveUserProgress(newProg);
              userProg.push(newProg);
            }
          }

          return filterStaticSeeds(userProg);
        }
      } catch (err) {
        console.error('Failed to get user progress from Supabase:', err);
      }
    }

    const list = this.getProgressList();
    let userProg = list.filter(p => p.userEmail.toLowerCase() === email.toLowerCase());

    const localCourses = filterStaticSeeds(getStorageItem<Course[]>('koruna_courses', []));
    const localDocs = filterStaticSeeds(getStorageItem<Course[]>('koruna_documents', []));
    const courses = [...localCourses, ...localDocs];
    let updated = false;

    courses.forEach(c => {
      if (!userProg.some(p => p.courseId === c.id)) {
        const newProg: UserProgress = {
          userEmail: email,
          courseId: c.id,
          progressPercent: 0,
          completedLessons: [],
          quizAttempts: 0,
          practicalStatus: 'none',
          overdue: false
        };
        list.push(newProg);
        userProg.push(newProg);
        updated = true;
      }
    });

    if (updated) {
      setStorageItem('koruna_progress', filterStaticSeeds(list));
    }
    return filterStaticSeeds(userProg);
  },

  async saveUserProgress(prog: UserProgress): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const dbProg = mapProgressToDB(prog);
        const { error } = await supabase
          .from('user_progress')
          .upsert(dbProg);
        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('last_viewed_at')) {
            const fallbackProg = { ...dbProg };
            delete fallbackProg.last_viewed_at;
            delete fallbackProg.learning_hours;
            const retryRes = await supabase
              .from('user_progress')
              .upsert(fallbackProg);
            if (retryRes.error) {
              console.error('Failed to save user progress to Supabase (retry):', retryRes.error);
            }
          } else {
            console.error('Failed to save user progress to Supabase:', error);
          }
        }
      } catch (err) {
        console.error('Supabase saveUserProgress failed:', err);
      }
    }

    const list = this.getProgressList();
    const idx = list.findIndex(p =>
      p.userEmail.toLowerCase() === prog.userEmail.toLowerCase() &&
      p.courseId === prog.courseId &&
      (p.applicationId || 0) === (prog.applicationId || 0)
    );
    if (idx !== -1) {
      list[idx] = prog;
    } else {
      list.push(prog);
    }
    setStorageItem('koruna_progress', filterStaticSeeds(list));
  },

  // --- PRACTICAL SUBMISSIONS ---
  async getPracticalSubmissions(): Promise<PracticalSubmission[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('practical_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) {
          if (data.length === 0 && DEFAULT_PRACTICALS.length > 0) {
            const practicalsToInsert = DEFAULT_PRACTICALS.map(p => mapPracticalToDB(p));
            const { error: insErr } = await supabase.from('practical_submissions').insert(practicalsToInsert);
            if (!insErr) {
              return DEFAULT_PRACTICALS;
            }
          } else {
            return filterStaticSeeds(data.map(db => mapDBPractical(db)));
          }
        }
      } catch (err) {
        console.error('Failed to get practical submissions from Supabase:', err);
      }
    }
    const rawSubs = getStorageItem<PracticalSubmission[]>('koruna_practicals', []);
    const filtered = filterStaticSeeds(rawSubs);
    if (filtered.length !== rawSubs.length) {
      setStorageItem('koruna_practicals', filtered);
    }
    return filtered;
  },

  async submitPractical(sub: Omit<PracticalSubmission, 'id' | 'status' | 'dateSubmitted'>): Promise<PracticalSubmission> {
    const newSub: PracticalSubmission = {
      ...sub,
      id: `p-${Date.now()}`,
      status: 'pending',
      dateSubmitted: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseConfigured()) {
      try {
        const dbSub = mapPracticalToDB(newSub);
        const { error } = await supabase.from('practical_submissions').insert(dbSub);
        if (error) {
          console.error('Failed to insert practical submission into Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase submitPractical failed:', err);
      }
    }

    const subs = getStorageItem<PracticalSubmission[]>('koruna_practicals', DEFAULT_PRACTICALS);
    subs.push(newSub);
    setStorageItem('koruna_practicals', subs);

    const progressList = await this.getUserProgress(sub.userEmail);
    const prog = progressList.find(p => p.courseId === sub.courseId);
    if (prog) {
      prog.practicalStatus = 'pending';
      prog.practicalNotes = sub.submissionText;
      await this.saveUserProgress(prog);
    }

    return newSub;
  },

  async reviewPractical(id: string, status: 'approved' | 'rejected'): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('practical_submissions')
          .update({ status })
          .eq('id', id);
        if (error) {
          console.error('Failed to update submission status in Supabase:', error);
        }
      } catch (err) {
        console.error('Supabase reviewPractical failed:', err);
      }
    }

    const subs = getStorageItem<PracticalSubmission[]>('koruna_practicals', DEFAULT_POSTS as any);
    const sub = subs.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      setStorageItem('koruna_practicals', subs);

      const progressList = await this.getUserProgress(sub.userEmail);
      const prog = progressList.find(p => p.courseId === sub.courseId);
      if (prog) {
        prog.practicalStatus = status;
        if (status === 'approved') {
          prog.progressPercent = 100;
        }
        await this.saveUserProgress(prog);
      }
    }
  },

  // --- BADGES ---
  getBadges(): Badge[] {
    return getStorageItem<Badge[]>('koruna_badges', DEFAULT_BADGES);
  },

  async getUserBadges(email: string): Promise<Badge[]> {
    const progress = await this.getUserProgress(email);
    const badges = this.getBadges();
    const userBadges: Badge[] = [];

    const streakBadge = badges.find(b => b.id === 'b1');
    if (streakBadge) {
      userBadges.push({ ...streakBadge, dateEarned: '2026-07-15' });
    }

    const complianceProg = progress.find(p => p.courseId === 'c2');
    if (complianceProg && complianceProg.quizScore === 100) {
      const b = badges.find(badge => badge.id === 'b2');
      if (b) {
        userBadges.push({ ...b, dateEarned: '2026-07-20' });
      }
    }

    const startedAny = progress.some(p => p.completedLessons.length > 0);
    if (startedAny) {
      const b = badges.find(badge => badge.id === 'b3');
      if (b) {
        userBadges.push({ ...b, dateEarned: '2026-07-10' });
      }
    }

    const completedAny = progress.some(p => p.progressPercent === 100);
    if (completedAny) {
      const b = badges.find(badge => badge.id === 'b4');
      if (b) {
        userBadges.push({ ...b, dateEarned: '2026-07-24' });
      }
    }

    return userBadges;
  },

  // --- COURSE ASSIGNMENTS ---
  async getCourseAssignments(courseId?: string): Promise<any[]> {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('course_assignments').select('*');
        if (courseId) {
          query = query.eq('course_id', courseId);
        }
        const { data, error } = await query;
        if (data && !error) return data;
      } catch (err) {
        console.error('Failed to get course assignments from Supabase:', err);
      }
    }
    return [];
  },

  async assignCourseToUser(courseId: string, email: string, assignedBy?: string): Promise<void> {
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return;

    // Fetch existing progress to preserve user progress data
    const existingProgressList = await this.getUserProgress(email);
    const existingProg = existingProgressList.find(p => p.courseId === courseId);

    // Clean up all existing database progress records for this user/course to avoid duplicates
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('user_progress')
          .delete()
          .match({ user_email: email.toLowerCase(), course_id: courseId });
      } catch (err) {
        console.error('Failed to clean up database progress before assigning:', err);
      }
    }

    // Clean up local storage progress list
    const list = this.getProgressList().filter(
      p => !(p.userEmail.toLowerCase() === email.toLowerCase() && p.courseId === courseId)
    );
    setStorageItem('koruna_progress', list);

    const appId = Math.floor(1000 + Math.random() * 9000);

    // Save to course_assignments table in Supabase
    if (isSupabaseConfigured()) {
      try {
        const targetUserId = user.id || user.userId;
        if (targetUserId) {
          await supabase
            .from('course_assignments')
            .upsert(
              {
                course_id: courseId,
                user_id: targetUserId,
                application_id: appId
              },
              { onConflict: 'course_id,user_id' }
            );
        }
      } catch (err) {
        console.warn('Failed to upsert into course_assignments in Supabase:', err);
      }
    }

    const newProg: UserProgress = {
      userEmail: email.toLowerCase(),
      courseId: courseId,
      applicationId: appId,
      progressPercent: existingProg ? existingProg.progressPercent : 0,
      completedLessons: existingProg ? existingProg.completedLessons : [],
      quizScore: existingProg ? existingProg.quizScore : undefined,
      quizAttempts: existingProg ? existingProg.quizAttempts : 0,
      practicalStatus: existingProg ? existingProg.practicalStatus : 'none',
      practicalNotes: existingProg ? existingProg.practicalNotes : undefined,
      overdue: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedBy: assignedBy || existingProg?.assignedBy
    };

    await this.saveUserProgress(newProg);

    let courseTitle = 'New Course';
    const courses = await this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (course) {
      courseTitle = course.title;
      const assigned = course.assignedUsers || [];
      const userKey = String(user.id || user.userId);
      const updatedAssigned = assigned.filter(a => a.userId !== userKey && a.userId !== String(user.userId));
      updatedAssigned.push({ userId: userKey, applicationId: appId });
      course.assignedUsers = updatedAssigned;
      await this.saveCourse(course);
    }

    // Create Notification
    try {
      await this.addNotification({
        userEmail: email.toLowerCase(),
        courseId: courseId,
        title: 'New Course Assigned',
        message: assignedBy
          ? `${assignedBy} assigned you a new course: "${courseTitle}".`
          : `You have been assigned a new course: "${courseTitle}".`,
        type: 'course_assigned',
        assignedBy: assignedBy
      });
    } catch (err) {
      console.error('Failed to create assignment notification:', err);
    }

    this.notifyCoursesChanged();
  },

  async unassignCourseFromUser(courseId: string, email: string): Promise<void> {
    // Fetch existing progress for this user/course
    const existingProgressList = await this.getUserProgress(email);
    const existingProg = existingProgressList.find(p => p.courseId === courseId);
    const users = await this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Delete assignment from course_assignments table in Supabase
    if (isSupabaseConfigured()) {
      try {
        if (user) {
          const targetUserId = user.id || user.userId;
          if (targetUserId) {
            await supabase
              .from('course_assignments')
              .delete()
              .match({ course_id: courseId, user_id: targetUserId });
          }
        }
        await supabase
          .from('user_progress')
          .delete()
          .match({ user_email: email.toLowerCase(), course_id: courseId });
      } catch (err) {
        console.error('Supabase unassignCourseFromUser failed:', err);
      }
    }

    // Clear local storage progress list for this user/course
    const list = this.getProgressList().filter(
      p => !(p.userEmail.toLowerCase() === email.toLowerCase() && p.courseId === courseId)
    );
    setStorageItem('koruna_progress', list);

    // If they had existing progress, insert a new unassigned (self-enrolled) progress record
    // with dueDate = undefined and applicationId = 0 to preserve their progress!
    if (existingProg) {
      const newProg: UserProgress = {
        userEmail: email.toLowerCase(),
        courseId: courseId,
        applicationId: 0,
        progressPercent: existingProg.progressPercent,
        completedLessons: existingProg.completedLessons,
        quizScore: existingProg.quizScore,
        quizAttempts: existingProg.quizAttempts,
        practicalStatus: existingProg.practicalStatus,
        practicalNotes: existingProg.practicalNotes,
        overdue: false,
        dueDate: undefined
      };
      await this.saveUserProgress(newProg);
    }

    if (user) {
      const courses = await this.getCourses();
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const assigned = course.assignedUsers || [];
        const userKey = String(user.id || user.userId);
        const updatedAssigned = assigned.filter(a => a.userId !== userKey && a.userId !== String(user.userId));
        course.assignedUsers = updatedAssigned;
        await this.saveCourse(course);
      }
    }
  },

  // --- NOTIFICATIONS ---
  async getNotifications(email: string): Promise<Notification[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_email', email.toLowerCase())
          .order('created_at', { ascending: false });
        if (data && !error) {
          return data.map(db => mapDBNotification(db));
        }
        if (error) {
          console.error('Supabase getNotifications failed:', error.message);
        }
      } catch (err) {
        console.error('Failed to get notifications from Supabase:', err);
      }
    }
    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    return list
      .filter(n => n.userEmail.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async addNotification(n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
    const newNotification: Notification = {
      ...n,
      id: `n-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const dbNotif = mapNotificationToDB(newNotification);
        const { error } = await supabase.from('notifications').insert(dbNotif);
        if (error) {
          console.error('Failed to insert notification into Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase addNotification failed:', err);
      }
    }

    const notifications = getStorageItem<Notification[]>('koruna_notifications', []);
    notifications.unshift(newNotification);
    setStorageItem('koruna_notifications', notifications);

    return newNotification;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);
        if (error) {
          console.error('Failed to mark notification as read in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase markNotificationAsRead failed:', err);
      }
    }

    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].isRead = true;
      setStorageItem('koruna_notifications', list);
    }
  },

  async markAllNotificationsAsRead(email: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_email', email.toLowerCase());
        if (error) {
          console.error('Failed to mark all notifications as read in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase markAllNotificationsAsRead failed:', err);
      }
    }

    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    list.forEach(n => {
      if (n.userEmail.toLowerCase() === email.toLowerCase()) {
        n.isRead = true;
      }
    });
    setStorageItem('koruna_notifications', list);
  },

  async deleteNotification(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Failed to delete notification in Supabase:', error.message);
        }
      } catch (err) {
        console.error('Supabase deleteNotification failed:', err);
      }
    }

    const list = getStorageItem<Notification[]>('koruna_notifications', []);
    const filtered = list.filter(n => n.id !== id);
    setStorageItem('koruna_notifications', filtered);
  },

  // --- POST REACTIONS STORE ---
  async getReactions(): Promise<PostReaction[]> {
    const localReactions = getStorageItem<PostReaction[]>('koruna_post_reactions_v1', []);
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('post_reactions')
          .select('*');
        if (data && !error) {
          const dbReactions: PostReaction[] = data.map(db => ({
            id: String(db.id),
            postId: String(db.post_id || db.postId),
            userKey: String(db.user_key || db.userKey).toLowerCase(),
            type: db.type as 'like' | 'celebrate' | 'bookmark',
            createdAt: db.created_at || db.createdAt || new Date().toISOString()
          }));
          const combined = [...dbReactions];
          localReactions.forEach(lr => {
            if (!combined.some(c => String(c.postId) === String(lr.postId) && c.userKey === lr.userKey.toLowerCase() && c.type === lr.type)) {
              combined.push(lr);
            }
          });
          return combined;
        }
      } catch (err) {
        console.error('Failed to fetch reactions from Supabase:', err);
      }
    }
    return localReactions;
  },

  async toggleReaction(
    postId: string,
    userKey: string,
    type: 'like' | 'celebrate' | 'bookmark'
  ): Promise<{ isAdded: boolean; reactions: PostReaction[] }> {
    const targetPostId = String(postId);
    const targetUserKey = userKey.toLowerCase();
    let localReactions = getStorageItem<PostReaction[]>('koruna_post_reactions_v1', []);

    const existingIdx = localReactions.findIndex(
      r => String(r.postId) === targetPostId && r.userKey.toLowerCase() === targetUserKey && r.type === type
    );

    let isAdded = false;

    if (existingIdx !== -1) {
      localReactions = localReactions.filter((_, idx) => idx !== existingIdx);
      setStorageItem('koruna_post_reactions_v1', localReactions);

      if (isSupabaseConfigured()) {
        try {
          await supabase
            .from('post_reactions')
            .delete()
            .match({ post_id: targetPostId, user_key: targetUserKey, type: type });
        } catch (err) {
          console.error('Failed to remove reaction from Supabase:', err);
        }
      }
    } else {
      isAdded = true;
      const newReaction: PostReaction = {
        id: `pr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        postId: targetPostId,
        userKey: targetUserKey,
        type: type,
        createdAt: new Date().toISOString()
      };
      localReactions.push(newReaction);
      setStorageItem('koruna_post_reactions_v1', localReactions);

      if (isSupabaseConfigured()) {
        try {
          await supabase.from('post_reactions').upsert({
            id: newReaction.id,
            post_id: targetPostId,
            user_key: targetUserKey,
            type: type,
            created_at: newReaction.createdAt
          });
        } catch (err) {
          console.error('Failed to save reaction to Supabase:', err);
        }
      }
    }

    return { isAdded, reactions: localReactions };
  },

  // --- HOME POSTS (SUPABASE & FALLBACK) ---
  async getPosts(): Promise<PostItem[]> {
    const rawV3 = getStorageItem<PostItem[]>('koruna_home_posts_v3', []);
    let localPosts: PostItem[];
    if (!rawV3 || rawV3.length === 0) {
      const rawV2 = getStorageItem<PostItem[]>('koruna_home_posts_v2', []);
      if (rawV2.length > 0) {
        localPosts = rawV2.map(p => mapDBPost(p));
      } else {
        localPosts = DEFAULT_POSTS.map(p => mapDBPost(p));
      }
      setStorageItem('koruna_home_posts_v3', localPosts);
    } else {
      localPosts = rawV3.map(p => mapDBPost(p));
    }

    const reactions = await this.getReactions();
    let fetchedPosts = localPosts;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error && data.length > 0) {
          fetchedPosts = data.map(db => mapDBPost(db));
        }
      } catch (err) {
        console.error('Failed to fetch posts from Supabase:', err);
      }
    }

    return fetchedPosts.map(post => {
      const pId = String(post.id);
      const localMatch = localPosts.find(
        lp => String(lp.id) === pId || (lp.content && post.content && lp.content.trim() === post.content.trim())
      );

      const reactionLikes = reactions
        .filter(r => String(r.postId) === pId && r.type === 'like')
        .map(r => r.userKey.toLowerCase());

      const reactionCelebrates = reactions
        .filter(r => String(r.postId) === pId && r.type === 'celebrate')
        .map(r => r.userKey.toLowerCase());

      const reactionBookmarks = reactions
        .filter(r => String(r.postId) === pId && r.type === 'bookmark')
        .map(r => r.userKey.toLowerCase());

      const baseLikedBy = localMatch?.likedBy || post.likedBy || [];
      const baseCelebratedBy = localMatch?.celebratedBy || post.celebratedBy || [];
      const baseBookmarkedBy = localMatch?.bookmarkedBy || post.bookmarkedBy || [];

      const mergedLikedBy = Array.from(new Set([...baseLikedBy, ...reactionLikes]));
      const mergedCelebratedBy = Array.from(new Set([...baseCelebratedBy, ...reactionCelebrates]));
      const mergedBookmarkedBy = Array.from(new Set([...baseBookmarkedBy, ...reactionBookmarks]));

      const baseLikesCount = localMatch ? localMatch.likesCount : post.likesCount;
      const baseCelebratesCount = localMatch ? localMatch.celebratesCount : post.celebratesCount;

      const finalLikesCount = Math.max(baseLikesCount, mergedLikedBy.length);
      const finalCelebratesCount = Math.max(baseCelebratesCount, mergedCelebratedBy.length);

      return {
        ...post,
        id: pId,
        imageUrl: post.imageUrl || localMatch?.imageUrl || undefined,
        docTitle: post.docTitle || localMatch?.docTitle || undefined,
        attachedDocPreview: post.attachedDocPreview || localMatch?.attachedDocPreview || false,
        likedBy: mergedLikedBy,
        celebratedBy: mergedCelebratedBy,
        bookmarkedBy: mergedBookmarkedBy,
        likesCount: finalLikesCount,
        celebratesCount: finalCelebratesCount,
        isLiked: mergedLikedBy.length > 0,
        isCelebrated: mergedCelebratedBy.length > 0,
        isBookmarked: mergedBookmarkedBy.length > 0
      };
    });
  },

  async savePost(post: PostItem): Promise<PostItem> {
    const cleanPost: PostItem = {
      ...post,
      id: String(post.id),
      likedBy: post.likedBy || [],
      celebratedBy: post.celebratedBy || [],
      bookmarkedBy: post.bookmarkedBy || [],
      likesCount: post.likesCount || 0,
      celebratesCount: post.celebratesCount || 0
    };

    const posts = getStorageItem<PostItem[]>('koruna_home_posts_v3', []);
    const existingIdx = posts.findIndex(
      p => String(p.id) === String(cleanPost.id) ||
        (p.content && cleanPost.content && p.content.trim() === cleanPost.content.trim())
    );
    if (existingIdx !== -1) {
      posts[existingIdx] = cleanPost;
    } else {
      posts.unshift(cleanPost);
    }
    setStorageItem('koruna_home_posts_v3', posts);

    if (isSupabaseConfigured()) {
      try {
        const dbPost = mapPostToDB(cleanPost);
        const { error } = await supabase.from('posts').upsert(dbPost);
        if (error) {
          if (error.code === 'PGRST204' || error.message?.includes('column')) {
            const fallbackPost = {
              id: cleanPost.id,
              author_name: cleanPost.authorName,
              content: cleanPost.content,
              category: cleanPost.category,
              image_url: cleanPost.imageUrl || null,
              attached_doc_preview: cleanPost.attachedDocPreview || false,
              doc_title: cleanPost.docTitle || null,
              author_role: cleanPost.authorRole,
              author_avatar: cleanPost.authorAvatar,
              author_bg_color: cleanPost.authorBgColor,
              badge_text: cleanPost.badgeText || null,
              likes_count: cleanPost.likesCount,
              celebrates_count: cleanPost.celebratesCount,
              comments: cleanPost.comments || [],
              is_liked: cleanPost.isLiked || false,
              is_celebrated: cleanPost.isCelebrated || false,
              is_bookmarked: cleanPost.isBookmarked || false
            };
            await supabase.from('posts').upsert(fallbackPost);
          }
        }
      } catch (err) {
        console.error('Supabase savePost failed:', err);
      }
    }

    return cleanPost;
  },

  async deletePost(id: string): Promise<void> {
    const targetIdStr = String(id);
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('posts').delete().eq('id', targetIdStr);
        await supabase.from('post_reactions').delete().eq('post_id', targetIdStr);
      } catch (err) {
        console.error('Supabase deletePost failed:', err);
      }
    }

    const posts = getStorageItem<PostItem[]>('koruna_home_posts_v3', []);
    const filtered = posts.filter(p => String(p.id) !== targetIdStr);
    setStorageItem('koruna_home_posts_v3', filtered);

    let reactions = getStorageItem<PostReaction[]>('koruna_post_reactions_v1', []);
    reactions = reactions.filter(r => String(r.postId) !== targetIdStr);
    setStorageItem('koruna_post_reactions_v1', reactions);
  }
};
