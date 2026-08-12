import React from 'react';
import { CourseSyllabus } from './CourseSyllabus';
import { LessonViewer } from './LessonViewer';
import { QuizViewer } from './QuizViewer';
import { PracticalTask } from './PracticalTask';
import { CourseDetailView } from './CourseDetailView';
import type { Course, UserProgress, SystemSettings, DatabaseUser } from '../../../services/db';
import type { UserSessionData } from '../../../services/auth';
import { dbService } from '../../../services/db';

interface CourseStudyViewProps {
  studyingCourse: Course;
  activeLessonIdx: number;
  setActiveLessonIdx: React.Dispatch<React.SetStateAction<number>>;
  quizAnswers: Record<number, number>;
  handleQuizAnswer: (questionIdx: number, optionIdx: number) => void;
  quizSubmitted: boolean;
  handleQuizSubmit: () => void;
  quizPassed: boolean;
  quizScore: number;
  setQuizAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  practicalText: string;
  setPracticalText: React.Dispatch<React.SetStateAction<string>>;
  handlePracticalSubmit: (e: React.FormEvent) => void;
  userProgress: UserProgress[];
  handleMarkLessonComplete: (lessonId: string) => Promise<void>;
  setStudyingCourse: (course: Course | null) => void;
  settings: SystemSettings;
  users: DatabaseUser[];
  teamProgress: Record<string, UserProgress[]>;
  userSession: UserSessionData;
  loadPlatformData: () => Promise<void>;
  showToast: (msg: string) => void;
}

export const CourseStudyView: React.FC<CourseStudyViewProps> = ({
  studyingCourse,
  activeLessonIdx,
  setActiveLessonIdx,
  quizAnswers,
  handleQuizAnswer,
  quizSubmitted,
  handleQuizSubmit,
  quizPassed,
  quizScore,
  setQuizAnswers,
  setQuizSubmitted,
  practicalText,
  setPracticalText,
  handlePracticalSubmit,
  userProgress,
  handleMarkLessonComplete,
  setStudyingCourse,
  settings,
  users,
  teamProgress,
  userSession,
  loadPlatformData,
  showToast
}) => {
  const canAssignCourses = React.useMemo(() => {
    return userSession.role === 'admin' || userSession.role === 'team_leader' || userSession.role === 'trainer';
  }, [userSession.role]);

  // If activeLessonIdx is -1, show the Course Detail page
  if (activeLessonIdx === -1) {
    return (
      <CourseDetailView
        studyingCourse={studyingCourse}
        userProgress={userProgress}
        setActiveLessonIdx={setActiveLessonIdx}
        setStudyingCourse={setStudyingCourse}
      />
    );
  }

  const isQuizTabActive = activeLessonIdx >= studyingCourse.lessons.length;

  return (
    <div className="koruna-subview-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Main Two-Column Classroom Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* LEFT COLUMN: Main viewport (Lesson or Quiz) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {!isQuizTabActive ? (
            <LessonViewer
              studyingCourse={studyingCourse}
              activeLessonIdx={activeLessonIdx}
              setActiveLessonIdx={setActiveLessonIdx}
              userProgress={userProgress}
              handleMarkLessonComplete={handleMarkLessonComplete}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <QuizViewer
                studyingCourse={studyingCourse}
                quizAnswers={quizAnswers}
                handleQuizAnswer={handleQuizAnswer}
                quizSubmitted={quizSubmitted}
                handleQuizSubmit={handleQuizSubmit}
                quizPassed={quizPassed}
                quizScore={quizScore}
                setQuizAnswers={setQuizAnswers}
                setQuizSubmitted={setQuizSubmitted}
                settings={settings}
                setActiveLessonIdx={setActiveLessonIdx}
              />

              {/* Renders practical tasks underneath the quiz for MORT-202 (c1 course) */}
              {studyingCourse.id === 'c1' && (
                <PracticalTask
                  studyingCourse={studyingCourse}
                  practicalText={practicalText}
                  setPracticalText={setPracticalText}
                  handlePracticalSubmit={handlePracticalSubmit}
                  userProgress={userProgress}
                />
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sidebar (Syllabus and Assign module) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CourseSyllabus
            studyingCourse={studyingCourse}
            activeLessonIdx={activeLessonIdx}
            setActiveLessonIdx={setActiveLessonIdx}
            userProgress={userProgress}
          />

          {canAssignCourses && (
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--udemy-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h4 style={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: 'var(--udemy-text)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>Administrative Assign</span>
              </h4>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--udemy-text-muted)',
                margin: 0,
                lineHeight: 1.4
              }}>
                Toggle assign status for employees to add this to their compliance learning pathways.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid var(--udemy-border)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                background: '#fafbfc'
              }}>
                {users.filter(u => u.role === 'employee').map(emp => {
                  const empProg = teamProgress[emp.email.toLowerCase()] || [];
                  const isAssigned = empProg.some(p => p.courseId === studyingCourse.id && p.dueDate);

                  return (
                    <label
                      key={emp.email}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: '0.25rem 0'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={async (e) => {
                          if (e.target.checked) {
                            await dbService.assignCourseToUser(studyingCourse.id, emp.email, userSession.name);
                            showToast(`Assigned course to ${emp.name}`);
                          } else {
                            await dbService.unassignCourseFromUser(studyingCourse.id, emp.email);
                            showToast(`Unassigned course from ${emp.name}`);
                          }
                          await loadPlatformData();
                        }}
                      />
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: '170px'
                        }}
                        title={emp.name}
                      >
                        {emp.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
