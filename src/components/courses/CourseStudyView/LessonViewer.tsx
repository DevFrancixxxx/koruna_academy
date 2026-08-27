import React from 'react';
import { PlayCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { Course, UserProgress } from '../../../services/db';

interface LessonViewerProps {
  studyingCourse: Course;
  activeLessonIdx: number;
  setActiveLessonIdx: React.Dispatch<React.SetStateAction<number>>;
  userProgress: UserProgress[];
  handleMarkLessonComplete: (lessonId: string) => Promise<void>;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  studyingCourse,
  activeLessonIdx,
  setActiveLessonIdx,
  userProgress,
  handleMarkLessonComplete
}) => {
  const lesson = studyingCourse.lessons[activeLessonIdx];
  const currentProgress = userProgress.find(p => p.courseId === studyingCourse.id);
  const isCompleted = currentProgress?.completedLessons.includes(lesson.id);

  // Group lessons into modules to find which module the current lesson belongs to
  const currentModule = React.useMemo(() => {
    const moduleId = lesson.moduleId || 'm1';
    const moduleTitle = lesson.moduleTitle || 'Introduction';

    // Find the module index
    const uniqueModules: string[] = [];
    studyingCourse.lessons.forEach(l => {
      const mid = l.moduleId || 'm1';
      if (!uniqueModules.includes(mid)) {
        uniqueModules.push(mid);
      }
    });
    const moduleIdx = uniqueModules.indexOf(moduleId) + 1;

    return {
      index: moduleIdx,
      title: moduleTitle
    };
  }, [studyingCourse.lessons, lesson]);

  const handleNextClick = async () => {
    // Automatically mark the current lesson complete when advancing
    if (!isCompleted) {
      await handleMarkLessonComplete(lesson.id);
    }
    setActiveLessonIdx(prev => prev + 1);
  };

  const handlePreviousClick = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(prev => prev - 1);
    }
  };

  const pinkThemeColor = '#a82c5d';

  return (
    <div style={{
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      width: '100%'
    }}>
      {/* Video Viewport Section */}
      {lesson.videoUrl && (() => {
        const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const ytMatch = lesson.videoUrl.match(ytRegExp);
        const ytEmbedUrl = ytMatch && ytMatch[2].length === 11 ? `https://www.youtube.com/embed/${ytMatch[2]}` : null;

        const gdDMatch = lesson.videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const gdOpenMatch = lesson.videoUrl.match(/[\?&]id=([a-zA-Z0-9_-]+)/);
        const gdFileId = gdDMatch ? gdDMatch[1] : (gdOpenMatch && lesson.videoUrl.includes('drive.google.com') ? gdOpenMatch[1] : null);
        const gdPreviewUrl = gdFileId ? `https://drive.google.com/file/d/${gdFileId}/preview` : null;

        const iframeUrl = ytEmbedUrl || gdPreviewUrl;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--udemy-border)',
              background: '#0f172a',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {iframeUrl ? (
                <iframe
                  src={iframeUrl}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    width: '100%',
                    height: '420px',
                    display: 'block'
                  }}
                />
              ) : (
                <video
                  style={{
                    width: '100%',
                    display: 'block',
                    height: '420px',
                    objectFit: 'contain'
                  }}
                  controls
                  src={lesson.videoUrl}
                  onEnded={() => handleMarkLessonComplete(lesson.id)}
                />
              )}
            </div>
          </div>
        );
      })()}

      {/* Lesson Meta Data Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: pinkThemeColor,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          MODULE {currentModule.index} · {currentModule.title.toUpperCase()}
        </div>
        
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          color: 'var(--udemy-text)',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          {lesson.title}
        </h2>

        {/* Watched Progress bar (Mock 30% watched for visual styling) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', height: '6px', background: '#f1f5f9', borderRadius: '9999px', flex: 1, overflow: 'hidden' }}>
            <div style={{ width: '30%', background: pinkThemeColor, borderRadius: '9999px' }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--udemy-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
            30% watched
          </span>
        </div>
      </div>

      {/* Lesson Overview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 800,
          color: 'var(--udemy-text)',
          fontFamily: 'var(--font-heading)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <PlayCircle size={18} style={{ color: pinkThemeColor }} />
          Lesson Overview
        </h3>
        
        <p style={{
          fontSize: '1rem',
          color: 'var(--udemy-text-muted)',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          margin: 0
        }}>
          {lesson.content}
        </p>
      </div>

      {/* Resources Card (Mockup 2 layout) */}
      {studyingCourse.attachments && studyingCourse.attachments.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--udemy-border)',
          borderRadius: '16px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: 'var(--udemy-text)',
            fontFamily: 'var(--font-heading)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <FileText size={16} style={{ color: pinkThemeColor }} />
            Resources
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--udemy-border)'
          }}>
            {studyingCourse.attachments.map((file, idx) => {
              const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
              const displayName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              
              // Mockup 2 highlights "Sample Case File" in pink
              const isHighlighted = displayName.toLowerCase().includes('sample case file');

              return (
                <a
                  key={idx}
                  href={file.url}
                  download={file.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 0',
                    borderBottom: idx < studyingCourse.attachments!.length - 1 ? '1px solid #f1f5f9' : 'none',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{
                    fontWeight: 500,
                    color: isHighlighted ? pinkThemeColor : 'var(--udemy-text)'
                  }}>
                    {displayName}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--udemy-text-muted)'
                  }}>
                    {fileExtension}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        borderTop: '1px solid var(--udemy-border)',
        paddingTop: '1.5rem',
        marginTop: '1rem'
      }}>
        <button
          className="btn-koruna-outline"
          disabled={activeLessonIdx === 0}
          onClick={handlePreviousClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: '42px',
            padding: '0 1.5rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: activeLessonIdx === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          className="btn-koruna-solid"
          onClick={handleNextClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            height: '42px',
            padding: '0 1.5rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {activeLessonIdx === studyingCourse.lessons.length - 1 ? 'Take Quiz' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>

    </div>
  );
};
