import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Award, AlertTriangle, RotateCcw, BookOpen, AlarmClock } from 'lucide-react';
import type { Course, SystemSettings } from '../../../services/db';
import type { UserSessionData } from '../../../services/auth';
import { CertificateView } from '../CertificateView';

interface QuizViewerProps {
  studyingCourse: Course;
  quizAnswers: Record<number, number>;
  handleQuizAnswer: (questionIdx: number, optionIdx: number) => void;
  quizSubmitted: boolean;
  handleQuizSubmit: () => void;
  quizPassed: boolean;
  quizScore: number;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  settings: SystemSettings;
  setActiveLessonIdx: React.Dispatch<React.SetStateAction<number>>;
  userSession?: UserSessionData;
  showToast?: (msg: string) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Total quiz duration in seconds — 30 s per question, minimum 5 minutes */
function getTimerSeconds(questionCount: number): number {
  return Math.max(questionCount * 30, 300);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const QuizViewer: React.FC<QuizViewerProps> = ({
  studyingCourse,
  quizAnswers,
  handleQuizAnswer,
  quizSubmitted,
  handleQuizSubmit,
  quizPassed,
  quizScore,
  setQuizAnswers,
  setQuizSubmitted,
  settings,
  setActiveLessonIdx,
  userSession,
  showToast,
}) => {
  const quiz = studyingCourse.quiz;
  const passingThreshold = settings.quizPassingThreshold;

  const [currentQ, setCurrentQ] = useState(0);
  const totalSeconds = getTimerSeconds(quiz?.length ?? 0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleQuizSubmit]);

  useEffect(() => {
    if (!quizSubmitted) {
      setTimeLeft(totalSeconds);
      startTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizSubmitted]);

  const timerUrgent = timeLeft < 60;

  const handleRetake = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setCurrentQ(0);
    setTimeLeft(totalSeconds);
    startTimer();
  };

  if (!quiz || quiz.length === 0) {
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--koruna-border-color)',
        borderRadius: '16px',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--koruna-text-muted)',
        boxShadow: 'var(--koruna-card-shadow)'
      }}>
        <p>No assessment quiz is currently configured for this course.</p>
      </div>
    );
  }

  const totalQuestions = quiz.length;
  const answeredCount = Object.keys(quizAnswers).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const q = quiz[currentQ];
  const selectedOpt = quizAnswers[currentQ] ?? -1;
  const moduleLabel = studyingCourse.title?.toUpperCase() ?? 'MODULE';

  /* ─── RESULTS VIEW ─── */
  if (quizSubmitted) {
    if (quizPassed) {
      return (
        <CertificateView
          course={studyingCourse}
          userSession={userSession || { name: 'Valued Learner', email: '', role: 'employee' }}
          onBack={() => setActiveLessonIdx(0)}
          showToast={showToast}
        />
      );
    }

    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--koruna-border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--koruna-card-shadow)'
      }}>
        <div style={{
          background: quizPassed
            ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
            : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
            {studyingCourse.title} — Quiz Results
          </span>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <div style={{
            background: quizPassed ? '#16a34a' : '#ef4444',
            color: '#ffffff',
            padding: '1.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}>
            {quizPassed ? <Award size={48} /> : <AlertTriangle size={48} />}
          </div>

          <div>
            <h4 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: quizPassed ? '#14532d' : '#9f1239',
              margin: 0
            }}>
              {quizPassed ? 'Compliance Standard Passed!' : 'Threshold Score Unmet'}
            </h4>
            <p style={{
              color: quizPassed ? '#15803d' : '#b91c1c',
              fontSize: '0.9rem',
              marginTop: '0.5rem',
              maxWidth: '440px',
              lineHeight: 1.5
            }}>
              {quizPassed
                ? `Well done! You successfully verified your understanding and passed with a score of ${quizScore}%.`
                : `Your evaluation score of ${quizScore}% did not meet the required threshold of ${passingThreshold}%.`}
            </p>
          </div>

          <div style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            color: quizPassed ? '#15803d' : '#b91c1c',
            fontFamily: 'monospace'
          }}>
            {quizScore}%
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              className="btn-koruna-outline"
              onClick={handleRetake}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                borderColor: quizPassed ? '#15803d' : '#b91c1c',
                color: quizPassed ? '#15803d' : '#b91c1c',
                height: '42px', padding: '0 1.25rem',
                background: '#ffffff', borderRadius: '8px'
              }}
            >
              <RotateCcw size={16} />
              <span>Re-Take Quiz</span>
            </button>
            <button
              className="btn-koruna-solid"
              onClick={() => setActiveLessonIdx(0)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: quizPassed ? '#16a34a' : '#ef4444',
                borderColor: quizPassed ? '#16a34a' : '#ef4444',
                height: '42px', padding: '0 1.25rem', borderRadius: '8px'
              }}
            >
              <BookOpen size={16} />
              <span>Review Lessons</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── ACTIVE QUIZ VIEW ─── */
  return (
    <div style={{
      background: '#f4f5f7',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      {/* ── Top Header Navigation ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2.5rem',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {/* Exit Quiz Button */}
        <button
          onClick={() => setActiveLessonIdx(0)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#4b5563',
            fontSize: '0.95rem',
            fontWeight: 600,
            padding: '0.4rem 0.25rem',
            borderRadius: '6px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#111827'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="11 17 6 12 11 7" />
            <line x1="18" x2="6" y1="12" y2="12" />
          </svg>
          <span>Exit Quiz</span>
        </button>

        {/* Countdown Timer Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 600,
          color: timerUrgent ? '#dc2626' : '#9d174d',
          background: timerUrgent ? '#fef2f2' : '#fce7f3',
          padding: '0.45rem 1.25rem',
          borderRadius: '9999px',
          transition: 'all 0.3s ease',
          animation: timerUrgent ? 'quiz-pulse 1s infinite' : 'none'
        }}>
          <AlarmClock size={18} style={{ strokeWidth: 2 }} />
          <span>{formatTime(timeLeft)} remaining</span>
        </div>
      </div>

      {/* ── Main Quiz Card Body ── */}
      <div style={{
        maxWidth: '920px',
        margin: '0 auto',
        padding: '2.5rem 2.5rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem'
      }}>
        {/* Progress bar section */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.6rem'
          }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
              Question {currentQ + 1} of {totalQuestions}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>
              {progressPct}% complete
            </span>
          </div>

          {/* Progress Bar Track */}
          <div style={{
            width: '100%',
            height: '6px',
            background: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progressPct}%`,
              height: '100%',
              background: '#b8235a',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Module Subtitle & Question */}
        <div>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#b8235a',
            margin: '0 0 0.75rem 0',
            textTransform: 'uppercase'
          }}>
            {q.moduleTitle ? `MODULE ${currentQ + 1} - ${q.moduleTitle.toUpperCase()}` : moduleLabel}
          </p>

          <h2 style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.5,
            margin: 0
          }}>
            {q.question}
          </h2>
        </div>

        {/* Answer Option Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {q.options.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            const label = OPTION_LABELS[optIdx] ?? String(optIdx + 1);

            return (
              <button
                key={optIdx}
                id={`quiz-q${currentQ}-opt${optIdx}`}
                onClick={() => handleQuizAnswer(currentQ, optIdx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.15rem 1.5rem',
                  borderRadius: '16px',
                  width: '100%',
                  border: isSelected ? '2px solid #b8235a' : '1px solid #e5e7eb',
                  background: '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 14px rgba(184,35,90,0.08)' : '0 1px 3px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {/* Option Letter Circle Badge */}
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  background: isSelected ? '#b8235a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#6b7280',
                  border: isSelected ? 'none' : '1px solid #e5e7eb',
                  transition: 'all 0.15s ease'
                }}>
                  {label}
                </div>

                <span style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Footer Navigation Buttons ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1.5rem'
        }}>
          <button
            id="quiz-prev-btn"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.6rem 1.4rem',
              borderRadius: '10px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: currentQ === 0 ? '#9ca3af' : '#374151',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: currentQ === 0 ? 0.6 : 1
            }}
            onMouseEnter={e => { if (currentQ !== 0) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; } }}
            onMouseLeave={e => { if (currentQ !== 0) { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; } }}
          >
            ← Previous
          </button>

          {currentQ < totalQuestions - 1 ? (
            <button
              id="quiz-next-btn"
              onClick={() => setCurrentQ(q => Math.min(totalQuestions - 1, q + 1))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.4rem',
                borderRadius: '10px',
                border: '1px solid #d1d5db',
                background: '#ffffff',
                color: '#374151',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
            >
              Next →
            </button>
          ) : (
            <button
              id="quiz-submit-btn"
              onClick={handleQuizSubmit}
              disabled={answeredCount < totalQuestions}
              title={answeredCount < totalQuestions ? `Please answer all ${totalQuestions} questions first` : undefined}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.6rem',
                borderRadius: '10px',
                border: 'none',
                background: '#b8235a',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                opacity: answeredCount < totalQuestions ? 0.5 : 1,
                cursor: answeredCount < totalQuestions ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(184,35,90,0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes quiz-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

