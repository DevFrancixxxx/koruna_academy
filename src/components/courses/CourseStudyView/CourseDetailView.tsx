import React, { useState } from 'react';
import { CheckCircle2, Lock, Play, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { Course, UserProgress, Lesson } from '../../../services/db';

interface CourseDetailViewProps {
  studyingCourse: Course;
  userProgress: UserProgress[];
  setActiveLessonIdx: (idx: number) => void;
  setStudyingCourse: (course: Course | null) => void;
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
  setStudyingCourse
}) => {
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

      {/* 2. Banner and Main Layout Grid */}
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
                <span>Trainer: <strong style={{ fontWeight: 600 }}>{studyingCourse.trainer || 'Jefrey Tatoy'}</strong></span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
              <div style={{ display: 'flex', height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, background: burgundyThemeColor, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--udemy-text-muted)', fontWeight: 600 }}>
                {completedModulesCount} of {totalModules} modules completed
              </span>
            </div>
            
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: burgundyThemeColor }}>
              {progressPercent}% complete
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
                          <div style={{ color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={24} style={{ fill: '#dcfce7', color: '#16a34a' }} />
                          </div>
                        )}
                        {isInProgress && (
                          <div style={{ color: burgundyThemeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={22} fill={burgundyThemeColor} />
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
          
          {/* Media/Video Frame Placeholder */}
          <div style={{
            aspectRatio: '16/9',
            background: '#f1f5f9',
            borderRadius: '20px',
            border: '1px dashed #cbd5e1',
            backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 0px, #e2e8f0 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, #e2e8f0 0px, #e2e8f0 2px, #f1f5f9 2px, #f1f5f9 10px)',
            backgroundSize: '20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => {
            const firstUncompletedIdx = studyingCourse.lessons.findIndex(l => !completedLessonsList.includes(l.id));
            setActiveLessonIdx(firstUncompletedIdx !== -1 ? firstUncompletedIdx : 0);
          }}
          >
            {/* Play Button Overlay */}
            <div style={{
              background: '#ffffff',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              color: burgundyThemeColor,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Play size={28} fill={burgundyThemeColor} style={{ marginLeft: '4px' }} />
            </div>
          </div>

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
        </div>

      </div>

    </div>
  );
};
