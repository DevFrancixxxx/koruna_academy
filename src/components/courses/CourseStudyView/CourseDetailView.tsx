import React, { useState } from 'react';
import { CheckCircle2, Lock, Play, ChevronDown, ChevronUp, Sparkles, FileText, Eye } from 'lucide-react';
import type { Course, UserProgress, Lesson } from '../../../services/db';
import type { UserSessionData } from '../../../services/auth';
import { ResourceViewerModal, type ResourceFile } from './ResourceViewerModal';
import { CertificateView } from '../CertificateView';
import { parseVideoUrl } from '../../../lib/videoUtils';

interface CourseDetailViewProps {
  studyingCourse: Course;
  userProgress: UserProgress[];
  setActiveLessonIdx: (idx: number) => void;
  setStudyingCourse: (course: Course | null) => void;
  handleMarkCourseComplete?: (courseId?: string) => Promise<void>;
  userSession?: UserSessionData;
  showToast?: (msg: string) => void;
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
  durationMinutes: number;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  studyingCourse,
  userProgress,
  setActiveLessonIdx,
  setStudyingCourse,
  handleMarkCourseComplete,
  userSession,
  showToast
}) => {
  const [selectedResource, setSelectedResource] = useState<ResourceFile | null>(null);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [isAcknowledgedChecked, setIsAcknowledgedChecked] = useState<boolean>(false);
  const currentProgress = userProgress.find(p => p.courseId === studyingCourse.id);
  const completedLessonsList = currentProgress?.completedLessons || [];

  // Group lessons into modules dynamically
  const modules = React.useMemo(() => {
    const map: Record<string, { title: string; lessons: Lesson[] }> = {};
    const order: string[] = [];

    studyingCourse.lessons.forEach(lesson => {
      const moduleId = lesson.moduleId || 'm1';
      const moduleTitle = lesson.moduleTitle || 'Introduction';

      if (!map[moduleId]) {
        map[moduleId] = { title: moduleTitle, lessons: [] };
        order.push(moduleId);
      }
      map[moduleId].lessons.push(lesson);
    });

    return order.map(id => {
      const item = map[id];
      const durationMin = item.lessons.reduce((sum, l) => {
        const d = parseInt(l.duration || '10m', 10);
        return sum + (isNaN(d) ? 10 : d);
      }, 0);

      return {
        id,
        title: item.title,
        lessons: item.lessons,
        durationMinutes: durationMin
      };
    });
  }, [studyingCourse.lessons]);

  // Determine module statuses
  // A module is completed if all its lessons are in completedLessonsList
  // A module is in progress if it is NOT completed, but is the first uncompleted one
  // A module is locked if a previous module is not completed
  const moduleStatuses = React.useMemo(() => {
    const statuses: Record<string, 'completed' | 'in_progress' | 'locked'> = {};
    let foundInProgress = false;

    modules.forEach((mod) => {
      const allLessonsCompleted = mod.lessons.length > 0 && mod.lessons.every(l => completedLessonsList.includes(l.id));

      if (allLessonsCompleted) {
        statuses[mod.id] = 'completed';
      } else if (!foundInProgress) {
        statuses[mod.id] = 'in_progress';
        foundInProgress = true;
      } else {
        statuses[mod.id] = 'locked';
      }
    });

    return statuses;
  }, [modules, completedLessonsList]);

  // Collapsed state map for modules. Open the 'in_progress' one by default, close others
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    modules.forEach(mod => {
      const status = moduleStatuses[mod.id];
      initial[mod.id] = status !== 'in_progress';
    });
    return initial;
  });

  const toggleCollapse = (modId: string) => {
    // If locked, do not expand/collapse
    if (moduleStatuses[modId] === 'locked') return;

    setCollapsedMap(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  // Find absolute lesson index for a lesson ID in the flat lessons list
  const getAbsoluteLessonIndex = (lessonId: string) => {
    return studyingCourse.lessons.findIndex(l => l.id === lessonId);
  };

  // Stats
  const totalModules = modules.length;
  const completedModulesCount = modules.filter(m => moduleStatuses[m.id] === 'completed').length;
  const progressPercent = currentProgress?.progressPercent || 0;
  const hasCourseActivity = Boolean(
    currentProgress && (
      currentProgress.progressPercent > 0 ||
      currentProgress.completedLessons.length > 0 ||
      currentProgress.quizAttempts > 0 ||
      currentProgress.quizScore !== undefined ||
      currentProgress.practicalStatus !== 'none'
    )
  );

  // Banner Background/Styling (Koruna Burgundy)
  const burgundyThemeColor = '#a82c5d';

  return (
    <div style={{ padding: '0.5rem 1rem 3rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

      {/* 1. Breadcrumbs */}
      <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--udemy-text-muted)', fontWeight: 500 }}>
        <span
          style={{ cursor: 'pointer', transition: 'color 0.2s' }}
          onClick={() => setStudyingCourse(null)}
          onMouseEnter={(e) => e.currentTarget.style.color = burgundyThemeColor}
          onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
        >
          Course Catalogue
        </span>
        <span>/</span>
        <span>{studyingCourse.category}</span>
        <span>/</span>
        <span style={{ color: 'var(--udemy-text)', fontWeight: 600 }}>{studyingCourse.title}</span>
      </div>

      {/* 2. Document Reader OR Course Banner + Layout Grid */}
      {studyingCourse.contentType === 'document' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          {/* DOCUMENT HERO BANNER */}
          <div style={{
            background: 'linear-gradient(135deg, #a31555 0%, #6b0d36 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-md)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              right: '-40px',
              bottom: '-45px',
              opacity: 0.08,
              transform: 'rotate(-15deg)'
            }}>
              <Sparkles size={250} color="#ffffff" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Document / Acknowledgment
                </span>
                <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>Code: {studyingCourse.code}</span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                {studyingCourse.title}
              </h1>
              {studyingCourse.description && (
                <p style={{ margin: 0, opacity: 0.9, fontSize: '0.98rem', lineHeight: 1.5, maxWidth: '800px' }}>
                  {studyingCourse.description}
                </p>
              )}
            </div>
          </div>

          {/* DOCUMENT BODY CONTENT CARD */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--udemy-border)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <FileText size={20} style={{ color: '#a31555' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--udemy-text)' }}>
                Document Content &amp; Guidelines
              </h2>
            </div>

            <div style={{
              fontSize: '0.95rem',
              color: '#334155',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              {studyingCourse.documentContent || studyingCourse.description || (studyingCourse.lessons && studyingCourse.lessons[0]?.content) || 'No detailed text content provided.'}
            </div>

            {/* ATTACHMENTS IF ANY */}
            {studyingCourse.attachments && studyingCourse.attachments.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '0.65rem' }}>
                  Attached Resource Files ({studyingCourse.attachments.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.65rem' }}>
                  {studyingCourse.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        padding: '0.65rem 0.85rem',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '0.825rem',
                        color: '#0f172a',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <FileText size={16} style={{ color: '#a31555', flexShrink: 0 }} />
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACKNOWLEDGMENT ACTION CARD */}
          <div style={{
            background: progressPercent === 100 ? '#f0fdf4' : '#ffffff',
            borderRadius: '16px',
            border: `2px solid ${progressPercent === 100 ? '#bbf7d0' : '#e2e8f0'}`,
            padding: '1.75rem 2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {progressPercent === 100 ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: '#dcfce7', color: '#15803d', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532d' }}>
                      Document Successfully Acknowledged &amp; Completed
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.15rem' }}>
                      You have confirmed reading and understanding this policy.
                    </div>
                  </div>
                </div>

                {studyingCourse.requiresCertification !== false && (
                  <button
                    onClick={() => setShowCertModal(true)}
                    style={{
                      background: '#a31555',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    View Certificate
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                    Employee Acknowledgment Required
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Please review the document content above carefully before submitting your acknowledgment.
                  </p>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    style={{ width: '20px', height: '20px', accentColor: '#a31555', cursor: 'pointer', marginTop: '2px' }}
                    checked={isAcknowledgedChecked}
                    onChange={(e) => setIsAcknowledgedChecked(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
                    {studyingCourse.acknowledgmentText || 'I have read, understood, and agree to the policies and terms outlined in this document.'}
                  </span>
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    disabled={!isAcknowledgedChecked}
                    onClick={() => handleMarkCourseComplete && handleMarkCourseComplete(studyingCourse.id)}
                    style={{
                      background: isAcknowledgedChecked ? '#16a34a' : '#cbd5e1',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.75rem 1.75rem',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: isAcknowledgedChecked ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    Acknowledge &amp; Complete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 350px',
          gap: '2rem',
          alignItems: 'start'
        }}>

          {/* Left Column: Banner + About + Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Burgundy Header Banner */}
            <div style={{
              background: `linear-gradient(135deg, ${burgundyThemeColor} 0%, #821c43 100%)`,
              color: '#ffffff',
              borderRadius: '24px',
              padding: '3rem 2.5rem',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle decorative vector graphic */}
              <div style={{
                position: 'absolute',
                right: '-40px',
                bottom: '-45px',
                opacity: 0.08,
                transform: 'rotate(-15deg)'
              }}>
                <Sparkles size={250} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '85%', position: 'relative', zIndex: 2 }}>
                <h1 style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em',
                  margin: 0
                }}>
                  {studyingCourse.title}
                </h1>

                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.95rem', opacity: 0.9, flexWrap: 'wrap' }}>
                  <span>Trainer: <strong style={{ fontWeight: 600 }}>{studyingCourse.trainer || 'Dr. Marcus Vance'}</strong></span>
                  <span>•</span>
                  <span>{totalModules} modules - {studyingCourse.lessons.length} lessons</span>
                </div>
              </div>
            </div>

            {/* Progress Bar Row */}
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--udemy-border)',
              padding: '1.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, background: burgundyThemeColor, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--udemy-text-muted)', fontWeight: 600 }}>
                  {completedModulesCount} of {totalModules} modules completed
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: burgundyThemeColor }}>
                  {progressPercent}% complete
                </div>

                {progressPercent < 100 && hasCourseActivity ? (
                  <button
                    id="mark-course-done-btn"
                    onClick={() => handleMarkCourseComplete && handleMarkCourseComplete(studyingCourse.id)}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#15803d'}
                    onMouseLeave={e => e.currentTarget.style.background = '#16a34a'}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark Course as Done</span>
                  </button>
                ) : progressPercent >= 100 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <CheckCircle2 size={15} /> Completed
                    </span>
                    {studyingCourse.requiresCertification !== false && (
                      <button
                        onClick={() => setShowCertModal(true)}
                        style={{
                          background: burgundyThemeColor,
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        View Certificate
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* About this course */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--udemy-text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.01em',
                margin: 0
              }}>
                About this course
              </h2>
              <p style={{
                fontSize: '1.05rem',
                color: 'var(--udemy-text-muted)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {studyingCourse.description}
              </p>
            </div>

            {/* Modules & Lessons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--udemy-text)',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '-0.01em',
                margin: 0
              }}>
                Modules & Lessons
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {modules.map((mod, modIdx) => {
                  const status = moduleStatuses[mod.id];
                  const isCollapsed = collapsedMap[mod.id];
                  const isLocked = status === 'locked';
                  const isCompleted = status === 'completed';
                  const isInProgress = status === 'in_progress';

                  return (
                    <div
                      key={mod.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid var(--udemy-border)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-sm)',
                        overflow: 'hidden',
                        opacity: isLocked ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Header Row */}
                      <div
                        onClick={() => !isLocked && toggleCollapse(mod.id)}
                        style={{
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          background: isInProgress ? '#fbf8f9' : '#ffffff',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                          {/* Status Icon */}
                          {isCompleted && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src="/done.png" alt="Done" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                            </div>
                          )}
                          {isInProgress && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src="/playbutton.png" alt="Play" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                            </div>
                          )}
                          {isLocked && (
                            <div style={{ color: 'var(--udemy-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Lock size={20} />
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{
                              fontSize: '1.05rem',
                              fontWeight: 700,
                              color: isLocked ? 'var(--udemy-text-muted)' : 'var(--udemy-text)'
                            }}>
                              Module {modIdx + 1} · {mod.title}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--udemy-text-muted)', fontWeight: 500 }}>
                              {mod.lessons.length} lessons · {mod.durationMinutes}m
                            </span>
                          </div>
                        </div>

                        {/* Right Indicator & Collapse Toggle */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {isCompleted && (
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#16a34a',
                              background: '#dcfce7',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px'
                            }}>
                              Completed
                            </span>
                          )}
                          {isInProgress && (
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#d97706',
                              background: '#fef3c7',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px'
                            }}>
                              In Progress
                            </span>
                          )}
                          {isLocked && (
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: 'var(--udemy-text-muted)',
                              background: '#f1f5f9',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '9999px'
                            }}>
                              Not Started
                            </span>
                          )}

                          {!isLocked && (
                            <div>
                              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Collapsible Lessons List */}
                      {!isCollapsed && !isLocked && (
                        <div style={{
                          borderTop: '1px solid var(--udemy-border)',
                          padding: '0.5rem 1.5rem 1.25rem 1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          background: '#ffffff'
                        }}>
                          {mod.lessons.map((lesson) => {
                            const isLessonDone = completedLessonsList.includes(lesson.id);
                            const firstUncompleted = studyingCourse.lessons.find(l => !completedLessonsList.includes(l.id));
                            const isActiveHighlight = firstUncompleted?.id === lesson.id;

                            return (
                              <div
                                key={lesson.id}
                                onClick={() => setActiveLessonIdx(getAbsoluteLessonIndex(lesson.id))}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.8rem 1rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  background: isActiveHighlight ? '#faf0f4' : 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = isActiveHighlight ? '#f7e2eb' : '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = isActiveHighlight ? '#faf0f4' : 'transparent';
                                }}
                              >
                                <span style={{
                                  fontSize: '0.95rem',
                                  fontWeight: isActiveHighlight ? 700 : 500,
                                  color: isActiveHighlight ? burgundyThemeColor : 'var(--udemy-text)'
                                }}>
                                  {lesson.title}
                                </span>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--udemy-text-muted)' }}>
                                    {lesson.duration || '10m'}
                                  </span>

                                  <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: isLessonDone ? '#16a34a' : (isActiveHighlight ? burgundyThemeColor : 'var(--udemy-text-muted)')
                                  }}>
                                    {isLessonDone ? 'Done' : 'Not Started'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Video Box + Requirements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'sticky', top: '20px' }}>

            {/* Media/Video Frame */}
            {/* Media/Video Frame Facade */}
            {(() => {
              const firstLessonWithVideo = studyingCourse.lessons.find(l => l.videoUrl);
              const parsedPreview = parseVideoUrl(firstLessonWithVideo?.videoUrl);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: '1px solid var(--udemy-border)',
                      boxShadow: 'var(--shadow-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}
                    onClick={() => {
                      const firstUncompletedIdx = studyingCourse.lessons.findIndex(l => !completedLessonsList.includes(l.id));
                      setActiveLessonIdx(firstUncompletedIdx !== -1 ? firstUncompletedIdx : 0);
                    }}
                  >
                    {/* Decorative background overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage: 'radial-gradient(circle at center, rgba(168, 44, 93, 0.3) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />

                    {/* Play Button Icon Circle */}
                    <div
                      style={{
                        background: '#ffffff',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                        color: burgundyThemeColor,
                        zIndex: 2,
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <Play size={26} fill={burgundyThemeColor} style={{ marginLeft: '3px' }} />
                    </div>

                    {/* Label overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '16px',
                      right: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: '#ffffff',
                      zIndex: 2
                    }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                        {firstLessonWithVideo?.title || 'Preview Lesson Video'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        color: '#ffffff'
                      }}>
                        {parsedPreview?.type === 'drive' ? 'Google Drive' : 'Video'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: parsedPreview?.type === 'drive' ? '#059669' : '#64748b' }}>
                      {parsedPreview?.type === 'drive' ? '⚡ Instant Page Load (Google Drive Supported)' : '⚡ Instant Page Load'}
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: burgundyThemeColor,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                      onClick={() => {
                        const firstUncompletedIdx = studyingCourse.lessons.findIndex(l => !completedLessonsList.includes(l.id));
                        setActiveLessonIdx(firstUncompletedIdx !== -1 ? firstUncompletedIdx : 0);
                      }}
                    >
                      Watch in Classroom <Play size={12} fill={burgundyThemeColor} />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Requirements Card */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--udemy-border)',
              borderRadius: '20px',
              padding: '2rem 1.75rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: burgundyThemeColor,
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                Requirements
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {(studyingCourse.requirements || [
                  'Complete all curriculum lessons',
                  'Earn passing score on course assessment',
                  'Authorized employee access'
                ]).map((req, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ color: burgundyThemeColor, display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '0.15rem' }}>
                      <CheckCircle2 size={16} style={{ fill: '#fdf2f8', strokeWidth: 2.5 }} />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--udemy-text)', lineHeight: 1.4, fontWeight: 500 }}>
                      {req}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Resources Card */}
            {studyingCourse.attachments && studyingCourse.attachments.length > 0 && (
              <div style={{
                background: '#ffffff',
                border: '1px solid var(--udemy-border)',
                borderRadius: '20px',
                padding: '1.75rem 1.5rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: burgundyThemeColor,
                  fontFamily: 'var(--font-heading)',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FileText size={18} />
                  Course Resources ({studyingCourse.attachments.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {studyingCourse.attachments.map((file, fileIdx) => {
                    const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
                    const displayName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                    return (
                      <div
                        key={fileIdx}
                        onClick={() => setSelectedResource(file)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '10px',
                          border: '1px solid #f1f5f9',
                          background: '#fafbfc',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#fafbfc'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: ext === 'PDF' ? '#fee2e2' : '#dcfce7',
                            color: ext === 'PDF' ? '#dc2626' : '#16a34a'
                          }}>
                            {ext}
                          </span>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: 'var(--udemy-text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '160px'
                          }}>
                            {displayName}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResource(file);
                            }}
                            title="Preview Online"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--udemy-text)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Eye size={12} />
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Render Document Viewer Modal */}
      {selectedResource && (
        <ResourceViewerModal
          file={selectedResource}
          onClose={() => setSelectedResource(null)}
          courseTitle={studyingCourse.title}
        />
      )}

      {/* Render Certificate Modal */}
      {showCertModal && (
        <CertificateView
          course={studyingCourse}
          userSession={userSession || { name: 'Jessica Timon', email: '', role: 'employee' }}
          issueDate={new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          certificateId={`CERT-${studyingCourse.id.toUpperCase()}-2026`}
          onBack={() => setShowCertModal(false)}
          onDone={() => setShowCertModal(false)}
          showToast={showToast}
          isModal={true}
        />
      )}

    </div>
  );
};
