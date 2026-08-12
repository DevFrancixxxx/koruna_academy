import React from 'react';
import { Brain, Award, AlertTriangle, RotateCcw, BookOpen } from 'lucide-react';
import type { Course, SystemSettings } from '../../../services/db';

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
  setActiveLessonIdx
}) => {
  const quiz = studyingCourse.quiz;
  const passingThreshold = settings.quizPassingThreshold;

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
        <Brain size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <p>No assessment quiz is currently configured for this course.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--koruna-border-color)',
      borderRadius: '16px',
      padding: '2.5rem',
      boxShadow: 'var(--koruna-card-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      {/* Header section */}
      <div style={{
        borderBottom: '1px solid var(--koruna-border-color)',
        paddingBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--koruna-text-dark)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-heading)'
          }}>
            <Brain style={{ color: 'var(--koruna-primary)' }} />
            Final Course Evaluation
          </h3>
          <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Answer all questions below to verify your curriculum compliance.
          </p>
        </div>

        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          background: 'var(--koruna-primary-light, #fef2f2)',
          color: 'var(--koruna-primary)',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px'
        }}>
          Passing Score: {passingThreshold}% Required
        </span>
      </div>

      {!quizSubmitted ? (
        /* ACTIVE QUIZ FORM */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {quiz.map((q, qIdx) => (
            <div key={qIdx} style={{
              padding: '1.5rem',
              border: '1px solid var(--koruna-border-color)',
              borderRadius: '12px',
              backgroundColor: '#fafbfc'
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--koruna-text-dark)',
                marginBottom: '1rem',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <span style={{ color: 'var(--koruna-primary)' }}>Q{qIdx + 1}.</span>
                <span>{q.question}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = quizAnswers[qIdx] === optIdx;

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleQuizAnswer(qIdx, optIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid var(--koruna-primary)' : '1px solid var(--koruna-border-color)',
                        background: isSelected ? 'var(--koruna-primary-light, #fef2f2)' : '#ffffff',
                        color: 'var(--koruna-text-dark)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(164, 53, 240, 0.08)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--koruna-primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--koruna-border-color)';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {/* Radio Circle */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid var(--koruna-primary)' : '2px solid var(--koruna-border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#ffffff',
                        flexShrink: 0
                      }}>
                        {isSelected && (
                          <div style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--koruna-primary)'
                          }} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500 }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            className="btn-koruna-solid"
            onClick={handleQuizSubmit}
            disabled={Object.keys(quizAnswers).length < quiz.length}
            style={{
              width: 'fit-content',
              alignSelf: 'flex-end',
              height: '48px',
              padding: '0 2.5rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.95rem',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            Submit Assessment
          </button>
        </div>
      ) : (
        /* QUIZ GRADED RESULTS STATE */
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          borderRadius: '16px',
          background: quizPassed ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          border: quizPassed ? '1px solid #bbf7d0' : '1px solid #fecdd3',
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
            boxShadow: 'var(--shadow-md)'
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
                : `Your evaluation score of ${quizScore}% did not meet the required threshold of ${passingThreshold}%.`
              }
            </p>
          </div>

          {/* Large Score indicator */}
          <div style={{
            fontSize: '3.5rem',
            fontWeight: 900,
            color: quizPassed ? '#15803d' : '#b91c1c',
            fontFamily: 'monospace'
          }}>
            {quizScore}%
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button
              className="btn-koruna-outline"
              onClick={() => {
                setQuizAnswers({});
                setQuizSubmitted(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderColor: quizPassed ? '#15803d' : '#b91c1c',
                color: quizPassed ? '#15803d' : '#b91c1c',
                height: '42px',
                padding: '0 1.25rem',
                background: '#ffffff',
                borderRadius: '8px'
              }}
            >
              <RotateCcw size={16} />
              <span>Re-Take Quiz</span>
            </button>

            <button
              className="btn-koruna-solid"
              onClick={() => setActiveLessonIdx(0)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: quizPassed ? '#16a34a' : '#ef4444',
                borderColor: quizPassed ? '#16a34a' : '#ef4444',
                height: '42px',
                padding: '0 1.25rem',
                borderRadius: '8px'
              }}
            >
              <BookOpen size={16} />
              <span>Review Lessons</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
