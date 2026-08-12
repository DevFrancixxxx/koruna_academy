import React from 'react';
import { Edit, ChevronRight } from 'lucide-react';
import type { Course } from '../../services/db';

interface CourseCardProps {
  course: Course;
  variant: 'employee' | 'trainer' | 'admin' | 'simple' | 'catalogue';
  percent?: number;
  applicationId?: number | null;
  onActionClick?: () => void;
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  isEnrolled?: boolean;
  isAssigned?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant,
  percent = 0,
  applicationId = null,
  onActionClick,
  onEditClick,
  onDeleteClick,
  isEnrolled = false,
  isAssigned = false
}) => {
  if (variant === 'employee') {
    return (
      <div className="koruna-assigned-course-card">
        <div className="koruna-card-thumb-wrap">
          <div className="koruna-thumbnail-placeholder" style={{ background: course.imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: 'var(--koruna-text-dark)' }}>
            {course.code}
          </div>
        </div>
        <div className="koruna-card-badges">
          <span className="koruna-badge-pill koruna-badge-outline-primary">{course.level}</span>
          <span className="koruna-badge-pill koruna-badge-lending">{course.category}</span>
          {applicationId ? (
            <span className="koruna-badge-pill koruna-badge-completed">App ID: {applicationId}</span>
          ) : null}
        </div>
        <h3 className="koruna-assigned-card-title">{course.title}</h3>
        <div className="koruna-assigned-card-progress">
          <div className="koruna-progress-bar-track">
            <div className="koruna-progress-bar-fill" style={{ width: `${percent}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--koruna-text-muted)' }}>Progress</span>
            <span>{percent}%</span>
          </div>
        </div>
        <button className="btn-koruna-solid" style={{ marginTop: 'auto' }} onClick={onActionClick}>
          {percent === 0 ? 'Start' : 'Continue'}
        </button>
      </div>
    );
  }

  if (variant === 'trainer') {
    return (
      <div className="koruna-assigned-course-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="koruna-card-thumb-wrap">
          <div className="koruna-thumbnail-placeholder" style={{ backgroundColor: course.imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: 'var(--koruna-text-dark)' }}>
            {course.code}
          </div>
        </div>
        <div className="koruna-card-badges">
          <span className="koruna-badge-pill koruna-badge-outline-primary">{course.level}</span>
          <span className="koruna-badge-pill koruna-badge-lending" style={{ textTransform: 'capitalize' }}>{course.category}</span>
        </div>
        <h3 className="koruna-assigned-card-title">{course.title}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--koruna-text-muted)', marginBottom: '0.75rem' }}>
          <span>Code: {course.code}</span>
          <span>⭐ {course.rating}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5rem', marginBottom: '1rem' }}>
          {course.description}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button className="btn-koruna-solid" style={{ flex: 1 }} onClick={onActionClick}>
            View Course
          </button>
          <button className="btn-koruna-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0.75rem' }} onClick={onEditClick}>
            <Edit size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className="koruna-assigned-course-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div className="koruna-card-thumb-wrap" style={{ height: '90px' }}>
          <div className="koruna-thumbnail-placeholder" style={{ backgroundColor: course.imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: 'var(--koruna-text-dark)' }}>
            {course.code}
          </div>
        </div>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.title}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--koruna-text-muted)', marginBottom: '0.75rem' }}>
          <span>Lessons: {course.lessons.length}</span>
          <span>Level: {course.level}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <button className="btn-koruna-outline" style={{ flex: 1, padding: '0.3rem', height: '32px', fontSize: '0.75rem' }} onClick={onEditClick} title="Edit Course">
            Edit
          </button>
          <button className="btn-koruna-outline" style={{ flex: 1, padding: '0.3rem', height: '32px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#ef4444' }} onClick={onDeleteClick} title="Delete Course">
            Delete
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'catalogue') {
    return (
      <div className="koruna-assigned-course-card">
        <div className="koruna-card-thumb-wrap">
          <div className="koruna-thumbnail-placeholder" style={{ backgroundColor: course.imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem', color: 'var(--koruna-text-dark)' }}>
            {course.code}
          </div>
        </div>
        <div className="koruna-card-badges">
          <span className="koruna-badge-pill koruna-badge-outline-primary">{course.level}</span>
          <span className="koruna-badge-pill koruna-badge-lending" style={{ textTransform: 'capitalize' }}>{course.category}</span>
          {isAssigned && (
            <span className="koruna-badge-pill" style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontWeight: 800 }}>
              Assigned
            </span>
          )}
        </div>
        <h3 className="koruna-assigned-card-title">{course.title}</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--koruna-text-muted)', marginBottom: '0.75rem' }}>
          <span>Code: {course.code}</span>
          <span>⭐ {course.rating}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--koruna-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5rem', marginBottom: '1rem' }}>
          {course.description}
        </p>
        <button className="btn-koruna-solid" style={{ marginTop: 'auto' }} onClick={onActionClick}>
          {isEnrolled ? 'Open Course' : 'Enroll & Study'}
        </button>
      </div>
    );
  }

  // variant === 'simple'
  return (
    <div className="koruna-assigned-course-card" style={{ cursor: 'pointer' }} onClick={onActionClick}>
      <div style={{ height: '140px', background: course.imgBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--koruna-text-dark)', fontSize: '1.1rem', padding: '1rem', textAlign: 'center', borderRadius: '8px', position: 'relative' }}>
        {course.code}
        {applicationId ? (
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', background: '#fae8ff', color: '#a21c5c', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
            App ID: {applicationId}
          </span>
        ) : null}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.75rem' }}>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--koruna-text-dark)', lineHeight: 1.35, marginBottom: '0.4rem' }}>
            {course.title}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--koruna-text-muted)' }}>
            Level: {course.level} • {course.lessons.length} Topics
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700, color: '#b4690e', marginTop: '0.25rem' }}>
          <span>⭐ {course.rating}</span>
        </div>
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--koruna-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--koruna-primary)' }}>
          <span>Study Now</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};
