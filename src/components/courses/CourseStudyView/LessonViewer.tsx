import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, ChevronLeft, ChevronRight, FileText, Eye, Download, ExternalLink, CheckCircle } from 'lucide-react';
import type { Course, UserProgress } from '../../../services/db';
import { ResourceViewerModal, type ResourceFile } from './ResourceViewerModal';
import { parseVideoUrl } from '../../../lib/videoUtils';
import { KorunaLogoSvg } from '../../KorunaLogo';
import { LoadingModal } from '../../LoadingModal';

interface LessonViewerProps {
  studyingCourse: Course;
  activeLessonIdx: number;
  setActiveLessonIdx: React.Dispatch<React.SetStateAction<number>>;
  userProgress: UserProgress[];
  handleMarkLessonComplete: (lessonId: string) => Promise<void>;
  handleMarkCourseComplete?: (courseId?: string) => Promise<void>;
  setStudyingCourse?: (course: Course | null) => void;
  onDone?: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  studyingCourse,
  activeLessonIdx,
  setActiveLessonIdx,
  userProgress,
  handleMarkLessonComplete,
  handleMarkCourseComplete,
  setStudyingCourse,
  onDone
}) => {
  const [selectedResource, setSelectedResource] = useState<ResourceFile | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [isProcessingNext, setIsProcessingNext] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const lesson = studyingCourse.lessons[activeLessonIdx];
  const currentProgress = userProgress.find(p => p.courseId === studyingCourse.id);
  const isCompleted = currentProgress?.completedLessons.includes(lesson.id) ?? false;

  const [watchedProgress, setWatchedProgress] = useState<number>(() => isCompleted ? 100 : 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Parse estimated total duration in seconds from lesson.duration string (e.g. "10m" -> 600s)
  const totalSeconds = React.useMemo(() => {
    if (!lesson?.duration) return 300;
    const match = lesson.duration.match(/(\d+)/);
    if (match) {
      const val = parseInt(match[1], 10);
      return val > 0 ? val * 60 : 300;
    }
    return 300;
  }, [lesson?.duration]);

  // Sync state when lesson changes or completion status changes
  useEffect(() => {
    setIsVideoLoading(true);
    setIsPlaying(false);
    if (isCompleted) {
      setWatchedProgress(100);
    } else {
      setWatchedProgress(0);
    }
  }, [lesson?.id, isCompleted]);

  // Listen for YouTube iframe postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (data && typeof data === 'object') {
          if (data.event === 'infoDelivery' && data.info) {
            const { currentTime, duration, playerState } = data.info;
            if (typeof currentTime === 'number' && typeof duration === 'number' && duration > 0) {
              const pct = Math.min(100, Math.max(0, Math.round((currentTime / duration) * 100)));
              setWatchedProgress(prev => Math.max(prev, pct));
              if (pct >= 95 && !isCompleted) {
                handleMarkLessonComplete(lesson.id);
              }
            }
            if (playerState === 1) setIsPlaying(true);
            else if (playerState === 2 || playerState === 0) setIsPlaying(false);
            if (playerState === 0) {
              setWatchedProgress(100);
              handleMarkLessonComplete(lesson.id);
            }
          } else if (data.event === 'onStateChange') {
            if (data.info === 1) setIsPlaying(true);
            if (data.info === 2) setIsPlaying(false);
            if (data.info === 0) {
              setIsPlaying(false);
              setWatchedProgress(100);
              handleMarkLessonComplete(lesson.id);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [lesson?.id, isCompleted, handleMarkLessonComplete]);

  const pinkThemeColor = '#a82c5d';
  const parsedVideo = parseVideoUrl(lesson.videoUrl);

  // Playback timer for iframe streams (Google Drive / external embeds)
  useEffect(() => {
    if (!parsedVideo || parsedVideo.type === 'direct') return;
    if (isCompleted || !isPlaying) return;

    const interval = setInterval(() => {
      setWatchedProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (!isCompleted) handleMarkLessonComplete(lesson.id);
          return 100;
        }
        const step = (1 / totalSeconds) * 100;
        const next = Math.min(100, prev + step);
        if (next >= 95 && !isCompleted) {
          handleMarkLessonComplete(lesson.id);
        }
        return parseFloat(next.toFixed(1));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [parsedVideo, isPlaying, isCompleted, totalSeconds, lesson?.id, handleMarkLessonComplete]);

  // Interactive seeking / setting progress when clicking the progress bar
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(100, Math.max(0, Math.round((clickX / rect.width) * 100)));
    setWatchedProgress(percentage);

    // If HTML5 direct video is loaded
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = (percentage / 100) * videoRef.current.duration;
    }

    // If YouTube iframe is loaded
    if (iframeRef.current && parsedVideo?.type === 'youtube' && iframeRef.current.contentWindow) {
      const targetSeconds = (percentage / 100) * (totalSeconds || 300);
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [targetSeconds, true]
          }),
          '*'
        );
      } catch {}
    }

    if (percentage >= 95 && !isCompleted) {
      handleMarkLessonComplete(lesson.id);
    }
  };

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

  const hasQuiz = Boolean(studyingCourse.quiz && studyingCourse.quiz.length > 0);
  const isLastLesson = activeLessonIdx === studyingCourse.lessons.length - 1;

  const handleNextClick = async () => {
    if (isProcessingNext) return;

    setIsProcessingNext(true);
    if (isLastLesson && !hasQuiz) {
      try {
        if (!isCompleted) {
          await handleMarkLessonComplete(lesson.id);
        }
        if (handleMarkCourseComplete) {
          await handleMarkCourseComplete(studyingCourse.id);
        }
        await new Promise(resolve => setTimeout(resolve, 600));
        if (onDone) {
          onDone();
        } else if (setStudyingCourse) {
          setStudyingCourse(null);
        }
      } catch (err) {
        console.error('Error finishing course:', err);
      } finally {
        setIsProcessingNext(false);
      }
    } else {
      try {
        if (!isCompleted) {
          await handleMarkLessonComplete(lesson.id);
        }
        setActiveLessonIdx(prev => prev + 1);
      } catch (err) {
        console.error('Error moving to next lesson:', err);
      } finally {
        setIsProcessingNext(false);
      }
    }
  };

  const handlePreviousClick = () => {
    if (activeLessonIdx > 0) {
      setActiveLessonIdx(prev => prev - 1);
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      width: '100%'
    }}>
      {/* Loading Modal Overlay while saving lesson progress */}
      {isProcessingNext && (
        <LoadingModal
          variant="modal"
          message={(isLastLesson && !hasQuiz) ? 'Finalizing course & saving progress...' : 'Saving progress & loading next lesson...'}
        />
      )}
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
                ref={iframeRef}
                src={parsedVideo.embedUrl}
                title={lesson.title}
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => {
                  setIsVideoLoading(false);
                  setIsPlaying(true);
                }}
                style={{
                  width: '100%',
                  height: '420px',
                  display: 'block'
                }}
              />
            ) : (
              <video
                ref={videoRef}
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
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration && !isNaN(v.duration) && v.duration > 0) {
                    const pct = Math.min(100, Math.max(0, Math.round((v.currentTime / v.duration) * 100)));
                    setWatchedProgress(pct);
                    if (pct >= 95 && !isCompleted) {
                      handleMarkLessonComplete(lesson.id);
                    }
                  }
                }}
                onEnded={() => {
                  setWatchedProgress(100);
                  setIsPlaying(false);
                  handleMarkLessonComplete(lesson.id);
                }}
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

        {/* Dynamic Watched Progress Bar (Only displayed if video exists) */}
        {Boolean(parsedVideo) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--udemy-text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isCompleted ? '#10b981' : isPlaying ? '#ec4899' : '#94a3b8',
                  display: 'inline-block',
                  boxShadow: isPlaying ? '0 0 8px rgba(236, 72, 153, 0.7)' : 'none',
                  transition: 'all 0.3s ease'
                }} />
                {isCompleted ? 'Completed' : isPlaying ? 'Streaming / Watching...' : 'Paused / Ready'}
              </span>
              <span style={{ color: 'var(--udemy-text)', fontWeight: 700, fontSize: '0.85rem' }}>
                {Math.round(watchedProgress)}% watched
              </span>
            </div>

            <div
              onClick={handleProgressBarClick}
              title="Click anywhere on the progress bar to set watched progress"
              style={{
                display: 'flex',
                height: '8px',
                background: '#f1f5f9',
                borderRadius: '9999px',
                width: '100%',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, watchedProgress))}%`,
                  background: isCompleted ? '#10b981' : `linear-gradient(90deg, ${pinkThemeColor} 0%, #d946ef 100%)`,
                  borderRadius: '9999px',
                  transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  height: '100%'
                }}
              />
            </div>
          </div>
        )}
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
          disabled={activeLessonIdx === 0 || isProcessingNext}
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
            cursor: activeLessonIdx === 0 || isProcessingNext ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <button
          className="btn-koruna-solid"
          disabled={isProcessingNext}
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
            cursor: isProcessingNext ? 'wait' : 'pointer',
            opacity: isProcessingNext ? 0.7 : 1,
            background: (isLastLesson && !hasQuiz) ? '#10b981' : undefined,
            borderColor: (isLastLesson && !hasQuiz) ? '#10b981' : undefined
          }}
        >
          {isLastLesson ? (
            hasQuiz ? (
              <>
                Take Quiz
                <ChevronRight size={16} />
              </>
            ) : (
              <>
                Done
                <CheckCircle size={16} />
              </>
            )
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

    </div>
  );
};
