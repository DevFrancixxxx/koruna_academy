import React, { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import type { Course } from '../../services/db';
import { CourseCard } from '../courses/CourseCard';

interface CourseInventoryViewProps {
  coursesOnly: Course[];
  categories: string[];
  handleStartEditCourse: (course: Course) => void;
  setActiveInnerTab: (tab: string) => void;
  setCourseToDelete: (item: { id: string; title: string; contentType?: string } | null) => void;
}

export const CourseInventoryView: React.FC<CourseInventoryViewProps> = ({
  coursesOnly,
  categories,
  handleStartEditCourse,
  setActiveInnerTab,
  setCourseToDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const q = (s: string) => s.toLowerCase();

  const filteredCourses = coursesOnly.filter(c => {
    const term = q(searchQuery);
    const matchesSearch = q(c.title).includes(term) || q(c.code).includes(term) || q(c.description).includes(term);
    return matchesSearch && (categoryFilter === 'All' || c.category === categoryFilter);
  });

  return (
    <div className="as-stack">
      <div className="as-stats">
        <div className="as-card as-stat">
          <div className="as-stat-label">Courses</div>
          <div className="as-stat-value">{coursesOnly.length}</div>
        </div>
        <div className="as-card as-stat">
          <div className="as-stat-label">Lessons</div>
          <div className="as-stat-value">{coursesOnly.reduce((sum, c) => sum + (c.lessons?.length || 0), 0)}</div>
        </div>
        <div className="as-card as-stat">
          <div className="as-stat-label">Categories</div>
          <div className="as-stat-value">{new Set(coursesOnly.map(c => c.category)).size}</div>
        </div>
      </div>

      <div className="as-card as-toolbar">
        <div className="as-search">
          <Search size={15} />
          <input
            type="text"
            className="as-input"
            placeholder="Search by title, code, or description"
            aria-label="Search by title, code, or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="as-chips">
          {categories.map(opt => (
            <button
              key={opt}
              type="button"
              className={`as-chip ${categoryFilter === opt ? 'is-active' : ''}`}
              onClick={() => setCategoryFilter(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="as-course-grid">
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            variant="admin"
            onEditClick={() => { handleStartEditCourse(course); setActiveInnerTab('creator'); }}
            onDeleteClick={() => setCourseToDelete({ id: course.id, title: course.title, contentType: course.contentType })}
          />
        ))}
        {filteredCourses.length === 0 && (
          <div className="as-empty">
            <div style={{ marginBottom: '0.5rem' }}><BookOpen size={32} /></div>
            <h3>No courses found</h3>
            <p>Try a different search, or create a new course.</p>
            <button type="button" className="as-btn as-btn--secondary" onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
