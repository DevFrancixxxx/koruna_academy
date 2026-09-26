import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronLeft, ChevronRight, FileText, Eye, Download, ExternalLink } from 'lucide-react';
import type { Course, UserProgress } from '../../../services/db';
import { ResourceViewerModal, type ResourceFile } from './ResourceViewerModal';
import { parseVideoUrl } from '../../../lib/videoUtils';
import { KorunaLogoSvg } from '../../KorunaLogo';

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
  const [selectedResource, setSelectedResource] = useState<ResourceFile | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const lesson = studyingCourse.lessons[activeLessonIdx];
  const currentProgress = userProgress.find(p => p.courseId === studyingCourse.id);
  const isCompleted = currentProgress?.completedLessons.includes(lesson.id);

  // Reset video loading state on lesson change
  useEffect(() => {
    setIsVideoLoading(true);
  }, [lesson?.id, lesson?.videoUrl]);

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
  const parsedVideo = parseVideoUrl(lesson.videoUrl);

  return (
    <div style={{
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      width: '100%'
    }}>
      {/* Video Viewport Section */}
      {parsedVideo && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid var(--udemy-border)',
            background: '#0f172a',
            boxShadow: 'var(--shadow-sm)',
            minHeight: '420px'
          }}>
            {/* Loading Spinner Overlay */}
            {isVideoLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.85rem',
                zIndex: 5,
                color: '#94a3b8',
                transition: 'opacity 0.3s ease'
              }}>
                <div className="loading-logo-icon">
                  <KorunaLogoSvg width={54} height={40} color={pinkThemeColor} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {parsedVideo.type === 'drive' ? 'Connecting to Google Drive Stream...' : 'Loading Video Stream...'}
                </span>
                {parsedVideo.type === 'drive' && (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '300px', textAlign: 'center' }}>
                    Google Drive preview streams initialize in 1-2 seconds.
                  </span>
                )}
              </div>
            )}

            {parsedVideo.embedUrl ? (
              <iframe
                src={parsedVideo.embedUrl}
                title={lesson.title}
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIsVideoLoading(false)}
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
                src={parsedVideo.directUrl}
                onLoadedData={() => setIsVideoLoading(false)}
                onCanPlay={() => setIsVideoLoading(false)}
                onEnded={() => handleMarkLessonComplete(lesson.id)}
              />
            )}
          </div>

          {/* Drive & Source Meta Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: parsedVideo.type === 'drive' ? '#059669' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              {parsedVideo.type === 'drive' && (
                <>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  Google Drive Video Stream
                </>
              )}
              {parsedVideo.type === 'youtube' && (
                <>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
                  YouTube Video Stream
                </>
              )}
              {parsedVideo.type === 'direct' && (
                <>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                  Direct Video Stream
                </>
              )}
            </span>

            {parsedVideo.openUrl && (
              <a
                href={parsedVideo.openUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: pinkThemeColor,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                Open in {parsedVideo.type === 'drive' ? 'Google Drive' : 'External Tab'} <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>
      )}

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
              Resources ({studyingCourse.attachments.length})
            </h4>

            <span style={{ fontSize: '0.75rem', color: 'var(--udemy-text-muted)', fontWeight: 600 }}>
              Click any file to preview online
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            borderTop: '1px solid var(--udemy-border)'
          }}>
            {studyingCourse.attachments.map((file, idx) => {
              const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'PDF';
              const displayName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

              // Highlight "Sample Case File" in pink
              const isHighlighted = displayName.toLowerCase().includes('sample case file');

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedResource(file)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 0.5rem',
                    borderBottom: idx < studyingCourse.attachments!.length - 1 ? '1px solid #f1f5f9' : 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: fileExtension === 'PDF' ? '#fef2f2' : fileExtension === 'XLSX' ? '#f0fdf4' : '#eff6ff',
                      color: fileExtension === 'PDF' ? '#ef4444' : fileExtension === 'XLSX' ? '#16a34a' : '#2563eb',
                      fontSize: '0.7rem',
                      fontWeight: 800
                    }}>
                      {fileExtension}
                    </div>

                    <span style={{
                      fontWeight: 600,
                      color: isHighlighted ? pinkThemeColor : 'var(--udemy-text)'
                    }}>
                      {displayName}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* View Preview Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResource(file);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: 'var(--udemy-text)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = pinkThemeColor;
                        e.currentTarget.style.color = pinkThemeColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.color = 'var(--udemy-text)';
                      }}
                    >
                      <Eye size={14} />
                      View
                    </button>

                    {/* Download Button */}
                    <a
                      href={file.url && file.url !== '#' ? file.url : `data:text/plain;charset=utf-8,${encodeURIComponent('Sample Resource Content for ' + file.name)}`}
                      download={file.name}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#f1f5f9',
                        color: 'var(--udemy-text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e2e8f0';
                        e.currentTarget.style.color = 'var(--udemy-text)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.color = 'var(--udemy-text-muted)';
                      }}
                    >
                      <Download size={14} />
                      Download
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Render Document Viewer Modal when a resource is selected */}
      {selectedResource && (
        <ResourceViewerModal
          file={selectedResource}
          onClose={() => setSelectedResource(null)}
          courseTitle={studyingCourse.title}
        />
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
