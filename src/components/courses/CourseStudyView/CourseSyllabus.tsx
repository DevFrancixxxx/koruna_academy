import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Course, UserProgress, Lesson } from '../../../services/db';

interface CourseSyllabusProps {
  studyingCourse: Course;
  activeLessonIdx: number;
  setActiveLessonIdx: (idx: number) => void;
  userProgress: UserProgress[];
}

export const CourseSyllabus: React.FC<CourseSyllabusProps> = ({
  studyingCourse,
  activeLessonIdx,
  setActiveLessonIdx,
  userProgress
}) => {
  const currentProgress = userProgress.find(p => p.courseId === studyingCourse.id);
  const completedLessonsList = currentProgress?.completedLessons || [];

  // Group lessons into modules
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

    return order.map(id => ({
      id,
      title: map[id].title,
      lessons: map[id].lessons
    }));
  }, [studyingCourse.lessons]);

  // Determine module statuses
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

  // Find absolute lesson index for a lesson ID in the flat lessons list
  const getAbsoluteLessonIndex = (lessonId: string) => {
    return studyingCourse.lessons.findIndex(l => l.id === lessonId);
  };

  const pinkThemeColor = '#a82c5d';

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--udemy-border)',
      borderRadius: '20px',
      padding: '2rem 1.5rem',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
      width: '100%'
    }}>
      {/* Title Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '1px solid var(--udemy-border)', paddingBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--udemy-text)',
          fontFamily: 'var(--font-heading)',
          margin: 0
        }}>
          All Lessons
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--udemy-text-muted)', fontWeight: 500 }}>
          {modules.length} modules · {studyingCourse.lessons.length} lessons
        </span>
      </div>

      {/* Modules & Lessons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {modules.map((mod, modIdx) => {
          const status = moduleStatuses[mod.id];
          const isLocked = status === 'locked';

          return (
            <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Module Title */}
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                color: isLocked ? 'var(--udemy-text-muted)' : 'var(--udemy-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                MODULE {modIdx + 1} - {mod.title.toUpperCase()}
              </div>

              {/* Module Lessons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {mod.lessons.map((lesson) => {
                  const lessonAbsIdx = getAbsoluteLessonIndex(lesson.id);
                  const isActive = activeLessonIdx === lessonAbsIdx;
                  const isLessonDone = completedLessonsList.includes(lesson.id);
                  
                  return (
                    <button
                      key={lesson.id}
                      disabled={isLocked}
                      onClick={() => setActiveLessonIdx(lessonAbsIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.7rem 0.85rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: isActive ? '#faf0f4' : 'transparent',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s ease',
                        opacity: isLocked ? 0.5 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive && !isLocked) {
                          e.currentTarget.style.background = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive && !isLocked) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                        {/* Circle Status Indicator */}
                        {isLessonDone ? (
                          <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
                        ) : isActive ? (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: pinkThemeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />
                          </div>
                        ) : (
                          <Circle size={16} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                        )}
                        
                        <span style={{
                          fontSize: '0.85rem',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? pinkThemeColor : 'var(--udemy-text)',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }}>
                          {lesson.title}
                        </span>
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--udemy-text-muted)',
                        marginLeft: '0.5rem',
                        whiteSpace: 'nowrap'
                      }}>
                        {lesson.duration || '10m'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
