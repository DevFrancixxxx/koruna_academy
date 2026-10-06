import React from 'react';
import {
  Award,
  Clock,
  Zap,
  BookOpen,
  Search,
  Flame
} from 'lucide-react';
import type { UserSessionData } from '../../services/auth';
import type { Course, UserProgress } from '../../services/db';
import { getCourseImage } from '../courses/CourseCard';

export interface KorunaAcademyDashboardProps {
  userSession: UserSessionData;
  courses: Course[];
  userProgress: UserProgress[];
  onStartStudy: (course: Course, applicationId?: number) => void;
  onTabChange: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const KorunaAcademyDashboard: React.FC<KorunaAcademyDashboardProps> = ({
  userSession,
  courses,
  userProgress,
  onStartStudy,
  onTabChange,
  searchQuery = '',
  setSearchQuery
}) => {
  const userName = userSession.name || 'Jessica Timon';

  // Helper to find existing course or create a fallback course object for study view
  const getCourseById = (id: string, fallbackTitle: string, category: string): Course => {
    const existing = courses.find((c) => c.id === id || c.title.toLowerCase().includes(fallbackTitle.toLowerCase()));
    if (existing) return existing;
    return {
      id,
      title: fallbackTitle,
      category,
      rating: 4.8,
      code: `MORT-${id.toUpperCase()}`,
      level: 'Intermediate',
      description: `Comprehensive training program covering ${fallbackTitle}.`,
      imgBg: '#e0f2fe',
      trainer: userSession.name || 'Dr. Marcus Vance',
      lessons: [
        { id: `${id}-l1`, title: 'Module 1: Foundations & Fundamentals', content: 'Welcome to this essential training module.' },
        { id: `${id}-l2`, title: 'Module 2: Key Operational Frameworks', content: 'Detailed analysis of workflows and standards.' },
        { id: `${id}-l3`, title: 'Module 3: Advanced Practical Applications', content: 'Hands-on scenarios and real-world case studies.' }
      ],
      quiz: [
        { question: 'What is the primary compliance requirement discussed in this module?', options: ['Document Verification', 'Manual Override', 'Bypass Review', 'None of the above'], correctAnswer: 0 }
      ]
    };
  };

  // Find the single recent course that the user viewed, ONLY if it is UNDONE (progressPercent < 100)
  const currentUserEmail = (userSession?.email || '').toLowerCase();

  // 1. Get assigned courses for the logged-in user
  const userAssignedCourses = courses.filter((c) => {
    const prog = userProgress.find(
      (p) => p.courseId === c.id && (
        !p.userEmail || (currentUserEmail && p.userEmail.toLowerCase().trim() === currentUserEmail)
      )
    );
    const hasAssignedProgress = !!(prog && (prog.dueDate || prog.assignedBy));
    const hasAssignedCourseFlag = !!c.isAssigned || (
      !!c.assignedUsers && c.assignedUsers.some((a) =>
        (userSession.id && String(a.userId).toLowerCase().trim() === String(userSession.id).toLowerCase().trim()) ||
        (userSession.email && String(a.userId).toLowerCase().trim() === currentUserEmail) ||
        (currentUserEmail && currentUserEmail.includes(String(a.userId).toLowerCase().trim()))
      )
    );
    return hasAssignedProgress || hasAssignedCourseFlag;
  });

  // 2. Find user progress entries ONLY for courses that actually exist in courses array
  // and ONLY for the logged-in user
  const userProgs = userProgress.filter((p) => {
    const isUserMatch = p.userEmail ? p.userEmail.toLowerCase() === currentUserEmail : true;
    const courseExists = courses.some((c) => c.id === p.courseId);
    return isUserMatch && courseExists;
  });

  // Filter strictly for UNDONE courses (progressPercent < 100)
  const undoneProgs = userProgs.filter((p) => p.progressPercent < 100);

  // Sort undone progress entries by lastViewedAt timestamp descending
  // Priority: 
  // 1. Has lastViewedAt -> newest timestamp first
  // 2. No lastViewedAt -> higher progressPercent first
  undoneProgs.sort((a, b) => {
    if (a.lastViewedAt && b.lastViewedAt) {
      return new Date(b.lastViewedAt).getTime() - new Date(a.lastViewedAt).getTime();
    }
    if (a.lastViewedAt) return -1;
    if (b.lastViewedAt) return 1;
    return b.progressPercent - a.progressPercent;
  });

  let recentUndoneProgress: UserProgress | undefined = undoneProgs[0];
  let recentUndoneCourse: Course | null = null;

  if (recentUndoneProgress) {
    const targetId = recentUndoneProgress.courseId;
    recentUndoneCourse = courses.find((c) => c.id === targetId) || null;
  }

  // If no course found via progress with lastViewedAt/progress > 0, fallback to assigned undone courses first!
  if (!recentUndoneCourse) {
    const undoneAssigned = userAssignedCourses.find((c) => {
      const prog = userProgress.find(
        (p) => p.courseId === c.id && (!p.userEmail || p.userEmail.toLowerCase() === currentUserEmail)
      );
      return !prog || prog.progressPercent < 100;
    });

    if (undoneAssigned) {
      recentUndoneCourse = undoneAssigned;
      recentUndoneProgress = userProgress.find(
        (p) => p.courseId === undoneAssigned.id && (!p.userEmail || p.userEmail.toLowerCase() === currentUserEmail)
      );
    } else {
      const fallbackCourse = courses.find((c) => {
        const prog = userProgress.find(
          (p) => p.courseId === c.id && (!p.userEmail || p.userEmail.toLowerCase() === currentUserEmail)
        );
        return !prog || prog.progressPercent < 100;
      });
      if (fallbackCourse) {
        recentUndoneCourse = fallbackCourse;
        recentUndoneProgress = userProgress.find(
          (p) => p.courseId === fallbackCourse.id && (!p.userEmail || p.userEmail.toLowerCase() === currentUserEmail)
        );
      }
    }
  }

  const courseVaSpecialist = getCourseById('c5', 'Senior Mortgage: VA Loan Specialist', 'Mortgage');
  const courseLeading = getCourseById('c6', 'Leading Without Authority', 'Leadership');
  const courseFinance = getCourseById('c7', 'Financial Planning Foundations', 'Finance');

  // Calculate total user learning hours dynamically from stored database progress
  const totalUserLearningHours = userProgress.reduce((sum, p) => {
    if (p.learningHours !== undefined && p.learningHours !== null) {
      return sum + p.learningHours;
    }
    const course = courses.find(c => c.id === p.courseId);
    if (course && p.progressPercent > 0) {
      const courseTotalHours = course.lessons?.length ? Math.max(course.lessons.length * 0.5, 0.5) : 1.0;
      return sum + Number(((p.progressPercent / 100) * courseTotalHours).toFixed(1));
    }
    return sum;
  }, 0);

  const parseDateOnly = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, (month || 1) - 1, day || 1);
  };

  const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const upcomingDeadlines = userProgs
    .filter((progress) => progress.dueDate && progress.progressPercent < 100)
    .map((progress) => {
      const course = courses.find((item) => item.id === progress.courseId);
      if (!course || !progress.dueDate) return null;

      const dueDate = parseDateOnly(progress.dueDate);
      const today = getStartOfDay(new Date());
      const daysUntilDue = Math.round((getStartOfDay(dueDate).getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

      let status: 'overdue' | 'due_soon' | 'upcoming' = 'upcoming';
      if (daysUntilDue < 0) {
        status = 'overdue';
      } else if (daysUntilDue <= 3) {
        status = 'due_soon';
      }

      return { course, progress, dueDate, daysUntilDue, status };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 4);

  const formatDeadlineMeta = (daysUntilDue: number) => {
    const absDays = Math.abs(daysUntilDue);
    if (daysUntilDue < 0) return `Overdue by ${absDays} ${absDays === 1 ? 'day' : 'days'}`;
    if (daysUntilDue === 0) return 'Due today';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  const deadlineBadgeStyle = (status: 'overdue' | 'due_soon' | 'upcoming') => {
    if (status === 'overdue') return { label: 'Overdue', backgroundColor: '#ffe4e6', color: '#e11d48' };
    if (status === 'due_soon') return { label: 'Due soon', backgroundColor: '#ffedd5', color: '#c2410c' };
    return { label: 'Upcoming', backgroundColor: '#cffaff', color: '#0891b2' };
  };

  const getCertificateIssueDate = (progress: UserProgress) => {
    if (progress.lastViewedAt) return new Date(progress.lastViewedAt);
    if (progress.dueDate) return parseDateOnly(progress.dueDate);
    return new Date();
  };

  const formatCertificateDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const recentCertificates = userProgs
    .filter((progress) => progress.progressPercent === 100)
    .map((progress) => {
      const course = courses.find((item) => item.id === progress.courseId);
      if (!course || course.requiresCertification === false) return null;
      const issuedAt = getCertificateIssueDate(progress);
      const certificateId = `CERT-${course.id.toUpperCase()}-${progress.applicationId || issuedAt.getFullYear()}`;
      return { course, progress, issuedAt, certificateId };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime())
    .slice(0, 3);

  return (
    <div style={{ padding: '1.75rem 2rem 3rem 2rem', backgroundColor: '#f8fafc', minHeight: '100%' }}>
      {/* HEADER ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome back, {userName.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            You're on your <span style={{ color: '#be185d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}><Flame size={15} fill="#be185d" /> 12-day</span> Learning streak!
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', minWidth: '320px' }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search courses, skills, certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.35rem',
                fontSize: '0.85rem',
                borderRadius: '50px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            />
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 0.8fr 0.9fr 0.8fr', gap: '1rem', marginBottom: '1.75rem' }}>
        {/* Card 1: 68% OVERALL PROGRESS */}
        <div style={{
          backgroundColor: '#be185d',
          background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(190, 24, 93, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>68%</div>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem', opacity: 0.9 }}>
            OVERALL PROGRESS
          </div>
        </div>

        {/* Card 2: CURRENT COURSE */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={22} />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {recentUndoneCourse ? recentUndoneCourse.title : 'None'}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginTop: '0.15rem' }}>
              CURRENT COURSE
            </div>
          </div>
        </div>

        {/* Card 3: CERTIFICATES */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>9</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
              CERTIFICATES
            </div>
          </div>
        </div>

        {/* Card 4: LEARNING HOURS */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {totalUserLearningHours > 0 ? `${totalUserLearningHours.toFixed(1)}h` : '0.0h'}
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
              LEARNING HOURS
            </div>
          </div>
        </div>

        {/* Card 5: XP */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem'
        }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>3,240</div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginTop: '0.2rem' }}>
              XP
            </div>
          </div>
        </div>
      </div>

      {/* CONTINUE LEARNING CARD */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
          Continue Learning
        </h2>

        {recentUndoneCourse ? (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #cbd5e1',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {/* Course Image Box */}
            <div style={{ width: '130px', height: '85px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={getCourseImage(recentUndoneCourse)}
                alt={recentUndoneCourse.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
              />
            </div>

            {/* Details */}
            <div style={{ flex: 1, minWidth: '240px' }}>
              <span style={{
                backgroundColor: '#fef3c7',
                color: '#d97706',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '50px',
                display: 'inline-block',
                marginBottom: '0.4rem'
              }}>
                {recentUndoneProgress && recentUndoneProgress.progressPercent > 0 ? 'In Progress' : 'Not Started'}
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                {recentUndoneCourse.title}
              </h3>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '420px', marginBottom: '0.4rem' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden' }}>
                  <div style={{ width: `${recentUndoneProgress ? recentUndoneProgress.progressPercent : 0}%`, height: '100%', backgroundColor: '#be185d', borderRadius: '50px' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>
                  {recentUndoneProgress ? recentUndoneProgress.progressPercent : 0}%
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Trainer: {recentUndoneCourse.trainer || userSession.name || 'Dr. Marcus Vance'}
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                onClick={() => recentUndoneCourse && onStartStudy(recentUndoneCourse, recentUndoneProgress?.applicationId)}
                style={{
                  backgroundColor: '#be185d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(190, 24, 93, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {recentUndoneProgress && recentUndoneProgress.progressPercent > 0 ? 'Continue Course' : 'Start Course'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>
              No undone courses found. You have completed all viewed courses!
            </p>
          </div>
        )}
      </div>

      {/* ASSIGNED COURSES SECTION */}
      <div style={{ marginBottom: '2.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
            Assigned Courses
          </h2>
          <button
            onClick={() => onTabChange('learning_path')}
            style={{ border: 'none', background: 'none', color: '#be185d', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
          >
            View all
          </button>
        </div>

        {(() => {
          // Filter courses that are explicitly assigned to the current user
          const assignedCourses = courses.filter((c) => {
            const prog = userProgress.find(
              (p) => p.courseId === c.id && (
                !p.userEmail || (currentUserEmail && p.userEmail.toLowerCase().trim() === currentUserEmail)
              )
            );

            const hasAssignedProgress = !!(prog && (prog.dueDate || prog.assignedBy));
            const hasAssignedCourseFlag = !!c.isAssigned || (
              !!c.assignedUsers && c.assignedUsers.some((a) =>
                (userSession.id && String(a.userId).toLowerCase().trim() === String(userSession.id).toLowerCase().trim()) ||
                (userSession.email && String(a.userId).toLowerCase().trim() === currentUserEmail) ||
                (currentUserEmail && currentUserEmail.includes(String(a.userId).toLowerCase().trim()))
              )
            );

            return hasAssignedProgress || hasAssignedCourseFlag;
          });

          if (assignedCourses.length === 0) {
            return (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <BookOpen size={32} style={{ color: '#be185d', marginBottom: '0.75rem', opacity: 0.6 }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  No Assigned Courses
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  You currently have no courses assigned to you.
                </p>
              </div>
            );
          }

          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {assignedCourses.map((course) => {
                const prog = userProgress.find((p) => p.courseId === course.id && (!p.userEmail || p.userEmail.toLowerCase().trim() === currentUserEmail));
                const percent = prog ? prog.progressPercent : 0;
                const isStarted = percent > 0;

                return (
                  <div
                    key={course.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      padding: '1.25rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{
                      height: '110px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      marginBottom: '1rem'
                    }}>
                      <img
                        src={getCourseImage(course)}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
                      />
                      <span style={{ position: 'absolute', top: '0.65rem', left: '0.65rem', border: '1px solid #fda4af', color: '#be185d', backgroundColor: '#ffffff', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                        {course.level || 'INTERMEDIATE'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: '#fce7f3', color: '#be185d', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '50px' }}>
                        {course.category || 'General'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.85rem 0', lineHeight: 1.35, height: '2.7em', overflow: 'hidden' }}>
                      {course.title}
                    </h4>

                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1, height: '5px', backgroundColor: '#e2e8f0', borderRadius: '50px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#be185d', borderRadius: '50px' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{percent}%</span>
                      </div>

                      <button
                        onClick={() => onStartStudy(course, prog?.applicationId)}
                        style={{
                          width: '100%',
                          backgroundColor: isStarted ? '#be185d' : '#ffffff',
                          color: isStarted ? '#ffffff' : '#0f172a',
                          border: isStarted ? 'none' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.6rem 0',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isStarted ? 'Continue' : 'Start'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* BOTTOM TWO-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* LEFT COLUMN: RECOMMENDED FOR YOU */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            Recommended For You
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Rec 1 */}
            <div
              onClick={() => onStartStudy(courseVaSpecialist)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1rem 1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={getCourseImage(courseVaSpecialist)}
                  alt={courseVaSpecialist.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '50px', display: 'inline-block', marginBottom: '0.3rem' }}>
                  Mortgage
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Senior Mortgage: VA Loan Specialist
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  4h 30m · 12 lessons
                </div>
              </div>
            </div>

            {/* Rec 2 (Highlighted with magenta border matching screenshot) */}
            <div
              onClick={() => onStartStudy(courseLeading)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '2px solid #be185d',
                padding: '1rem 1.25rem',
                boxShadow: '0 2px 8px rgba(190, 24, 93, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={getCourseImage(courseLeading)}
                  alt={courseLeading.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '50px', display: 'inline-block', marginBottom: '0.3rem' }}>
                  Leadership
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Leading Without Authority
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  3h 10m · 8 lessons
                </div>
              </div>
            </div>

            {/* Rec 3 */}
            <div
              onClick={() => onStartStudy(courseFinance)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1rem 1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={getCourseImage(courseFinance)}
                  alt={courseFinance.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ backgroundColor: '#ccfbf1', color: '#0d9488', fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '50px', display: 'inline-block', marginBottom: '0.3rem' }}>
                  Finance
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                  Financial Planning Foundations
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  2h 45m · 6 lessons
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UPCOMING DEADLINES & RECENT CERTIFICATES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Upcoming Deadlines */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1rem 0' }}>
              Upcoming Deadlines
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map(({ course, progress, daysUntilDue, status }) => {
                  const badge = deadlineBadgeStyle(status);
                  return (
                    <button
                      key={`${course.id}-${progress.applicationId || progress.dueDate}`}
                      type="button"
                      onClick={() => onStartStudy(course, progress.applicationId)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {course.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                          {formatDeadlineMeta(daysUntilDue)} · {progress.progressPercent}% complete
                        </div>
                      </div>
                      <span style={{
                        backgroundColor: badge.backgroundColor,
                        color: badge.color,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '50px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {badge.label}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div style={{
                  border: '1px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#64748b',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  backgroundColor: '#f8fafc'
                }}>
                  No upcoming deadlines.
                </div>
              )}
            </div>
          </div>

          {/* Recent Certificates (Magenta card background) */}
          <div style={{
            backgroundColor: '#be185d',
            background: 'linear-gradient(135deg, #be185d 0%, #9d174d 100%)',
            borderRadius: '16px',
            padding: '1.25rem',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(190, 24, 93, 0.25)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Recent Certificates
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentCertificates.length > 0 ? (
                recentCertificates.map(({ course, issuedAt, certificateId }, index) => (
                  <button
                    key={certificateId}
                    type="button"
                    onClick={() => onTabChange('certificates')}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.15)',
                      padding: index === 0 ? 0 : '0.65rem 0 0 0',
                      background: 'transparent',
                      color: '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85, marginTop: '0.1rem' }}>
                      Issued {formatCertificateDate(issuedAt)}
                    </div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: '0.1rem', fontWeight: 700 }}>
                      {certificateId}
                    </div>
                  </button>
                ))
              ) : (
                <div style={{
                  border: '1px dashed rgba(255,255,255,0.35)',
                  borderRadius: '12px',
                  padding: '1rem',
                  textAlign: 'center',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)'
                }}>
                  No earned certificates yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
