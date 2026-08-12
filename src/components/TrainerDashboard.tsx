import React from 'react';
import { BookOpen, Zap } from 'lucide-react';
import type { Course } from '../services/db';
import { CourseCard } from './courses/CourseCard';

interface TrainerDashboardProps {
  courses: Course[];
  handleStartStudy: (course: Course) => void;
  handleStartEditCourse: (course: Course) => void;
  setEditingCourseId: (id: string | null) => void;
  setCourseForm: React.Dispatch<React.SetStateAction<any>>;
  setCourseLessons: React.Dispatch<React.SetStateAction<any[]>>;
  setCourseQuiz: React.Dispatch<React.SetStateAction<any[]>>;
  setAssignedUserEmails: React.Dispatch<React.SetStateAction<string[]>>;
  onTabChange: (tab: string) => void;
  setActiveInnerTab: (tab: string) => void;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({
  courses,
  handleStartStudy,
  handleStartEditCourse,
  setEditingCourseId,
  setCourseForm,
  setCourseLessons,
  setCourseQuiz,
  setAssignedUserEmails,
  onTabChange,
  setActiveInnerTab
}) => {
  return (
    <div className="koruna-subview-wrapper" style={{ padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="koruna-section-title" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>All Courses</h2>
          <p style={{ color: 'var(--koruna-text-muted)', fontSize: '0.85rem' }}>
            Overview of all enterprise learning tracks, lessons, and quiz configurations.
          </p>
        </div>
        <button
          className="btn-koruna-solid"
          style={{ height: '40px', padding: '0 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          onClick={() => {
            setEditingCourseId(null);
            setCourseForm({ title: '', category: 'Mortgage', code: '', level: 'Beginner', description: '', imgBg: '#e0f2fe' });
            setCourseLessons([{ title: 'Lesson 1: Introduction', content: 'Enter lesson text here.' }]);
            setCourseQuiz([{ question: 'What is the correct answer?', options: ['Option A', 'Option B', 'Option C', 'Option D'], correctAnswer: 0 }]);
            setAssignedUserEmails([]);
            onTabChange('admin_suite');
            setActiveInnerTab('creator');
          }}
        >
          + Create New Course
        </button>
      </div>

      {/* TRAINER METRICS ROW */}
      <div className="koruna-metrics-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="koruna-metric-card koruna-metric-card-primary">
          <div className="koruna-metric-title-large">{courses.length}</div>
          <div className="koruna-metric-label-small">Total Created Courses</div>
        </div>

        <div className="koruna-metric-card koruna-metric-card-white">
          <div className="koruna-metric-card-white-left course-card">
            <BookOpen size={20} />
          </div>
          <div className="koruna-metric-card-white-right">
            <div className="koruna-metric-title-medium">
              {courses.reduce((sum, c) => sum + c.lessons.length, 0)}
            </div>
            <div className="koruna-metric-label-small">Configured Lessons</div>
          </div>
        </div>

        <div className="koruna-metric-card koruna-metric-card-white">
          <div className="koruna-metric-card-white-left xp-card">
            <Zap size={20} />
          </div>
          <div className="koruna-metric-card-white-right">
            <div className="koruna-metric-title-medium">
              {new Set(courses.map(c => c.category)).size}
            </div>
            <div className="koruna-metric-label-small">Learning Specialties</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            variant="trainer"
            onActionClick={() => handleStartStudy(course)}
            onEditClick={() => handleStartEditCourse(course)}
          />
        ))}
      </div>
    </div>
  );
};
