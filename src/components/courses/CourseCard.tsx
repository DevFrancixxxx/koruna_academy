import React from 'react';
import { Edit, ChevronRight } from 'lucide-react';
import type { Course } from '../../services/db';

export const getCourseImage = (course: Partial<Course> | null | undefined): string => {
  if (!course) return '/course_card_default.png';
  if ((course as any).imageUrl) return (course as any).imageUrl;
  const cat = (course.category || '').toLowerCase();
  if (cat.includes('mortgage')) return '/course_card_mortgage.png';
  if (cat.includes('lending')) return '/course_card_lending.png';
  if (cat.includes('ai') || cat.includes('tech') || cat.includes('digital')) return '/course_card_tech.png';
  return '/course_card_default.png';
};

interface CourseCardProps {
  course: Course;
  variant: 'employee' | 'trainer' | 'admin' | 'simple' | 'catalogue';
  percent?: number;
  isOverdue?: boolean;
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
  isOverdue = false,
  applicationId = null,
  onActionClick,
  onEditClick,
  onDeleteClick
}) => {
  if (variant === 'employee') {
    return (
      <div className="koruna-assigned-course-card">
        <div className="koruna-card-thumb-wrap" style={{ overflow: 'hidden', borderRadius: '12px 12px 0 0', position: 'relative', height: '140px' }}>
          <img
            src={getCourseImage(course)}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
          />
          <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '6px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700 }}>
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
        <button className="btn-assigned-course-action" onClick={onActionClick}>
          {percent === 0 ? 'Start' : 'Continue'}
        </button>
      </div>
    );
  }

  if (variant === 'trainer') {
    return (
      <div className="koruna-assigned-course-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="koruna-card-thumb-wrap" style={{ overflow: 'hidden', borderRadius: '12px 12px 0 0', position: 'relative', height: '140px' }}>
          <img
            src={getCourseImage(course)}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
          />
          <div style={{ position: 'absolute', bottom: '8px', left: '12px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '6px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700 }}>
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
        <div className="koruna-card-thumb-wrap" style={{ overflow: 'hidden', borderRadius: '8px', position: 'relative', height: '90px' }}>
          <img
            src={getCourseImage(course)}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
          />
          <div style={{ position: 'absolute', bottom: '6px', left: '8px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '2px 6px', borderRadius: '4px', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700 }}>
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
    // 1. Level badge overlay text (UPPERCASE)
    const levelText = course.level.toUpperCase();

    // 2. Category badge mapping
    const cat = course.category.toLowerCase();
    let catBg = '#f4f4f5';
    let catColor = '#71717a';
    if (cat.includes('lending')) {
      catBg = '#e8f5e9';
      catColor = '#15803d';
    } else if (cat.includes('mortgage')) {
      catBg = '#f3e8ff';
      catColor = '#7e22ce';
    } else if (cat.includes('operations')) {
      catBg = '#fdf2f8';
      catColor = '#aa1555';
    } else if (cat.includes('ai') || cat.includes('tech')) {
      catBg = '#e0f2fe';
      catColor = '#0369a1';
    }
    const catText = cat === 'ai' ? 'AI' : course.category.charAt(0).toUpperCase() + course.category.slice(1).toLowerCase();

    // 3. Status badge mapping
    let statusText = 'Not Started';
    let statusBg = '#f4f4f5';
    let statusColor = '#71717a';
    if (percent === 100) {
      statusText = 'Completed';
      statusBg = '#e8f5e9';
      statusColor = '#2e7d32';
    } else if (isOverdue) {
      statusText = 'Overdue';
      statusBg = '#fee2e2';
      statusColor = '#dc2626';
    } else if (percent > 0) {
      statusText = 'In Progress';
      statusBg = '#fef3c7';
      statusColor = '#b45309';
    }

    // 4. Progress bar class selection
    const isCompleted = percent === 100;
    const progressFillClass = isCompleted ? 'completed' : 'active';
    const percentTextClass = isCompleted ? 'completed' : 'active';

    // 5. Action Button state mapping
    const isSolidButton = percent > 0 && percent < 100 && !isOverdue;
    let buttonText = 'Start';
    if (percent === 100) {
      buttonText = 'Review';
    } else if (percent > 0) {
      buttonText = 'Continue';
    }

    return (
      <div className="koruna-catalogue-card">
        <div className="koruna-catalogue-thumb-wrap" style={{ overflow: 'hidden', position: 'relative', height: '140px' }}>
          <img
            src={getCourseImage(course)}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
          />
          <span className="koruna-catalogue-level-badge">{levelText}</span>
        </div>
        
        <div className="koruna-catalogue-badges-row">
          <span className="koruna-catalogue-badge" style={{ backgroundColor: catBg, color: catColor }}>
            {catText}
          </span>
          <span className="koruna-catalogue-badge" style={{ backgroundColor: statusBg, color: statusColor }}>
            {statusText}
          </span>
        </div>

        <h3 className="koruna-catalogue-title" title={course.title}>
          {course.title}
        </h3>

        <div className="koruna-catalogue-progress-row">
          <div className="koruna-catalogue-progress-track">
            <div 
              className={`koruna-catalogue-progress-fill ${progressFillClass}`} 
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className={`koruna-catalogue-progress-percent ${percentTextClass}`}>
            {percent}%
          </span>
        </div>

        <button 
          className={isSolidButton ? 'btn-catalogue-action-solid' : 'btn-catalogue-action-outline'} 
          onClick={onActionClick}
        >
          {buttonText}
        </button>
      </div>
    );
  }

  // variant === 'simple'
  return (
    <div className="koruna-assigned-course-card" style={{ cursor: 'pointer' }} onClick={onActionClick}>
      <div style={{ height: '140px', overflow: 'hidden', borderRadius: '8px', position: 'relative' }}>
        <img
          src={getCourseImage(course)}
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/course_card_default.png'; }}
        />
        <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
          {course.code}
        </span>
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

