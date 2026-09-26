import React from 'react';
import {
  Edit,
  ChevronRight,
  BookOpen,
  Home,
  Landmark,
  Sparkles,
  Layers,
  ShieldCheck,
  FileText
} from 'lucide-react';
import type { Course } from '../../services/db';

export const getCourseBannerStyle = (course?: Partial<Course> | null) => {
  const bg = course?.imgBg || '#e0f2fe';

  if (bg === '#fdf2f8' || bg.includes('a31555')) {
    return {
      gradient: 'linear-gradient(135deg, #a31555 0%, #7a0f40 100%)',
      accentColor: '#fbcfe8',
      textColor: '#ffffff',
      chipBg: 'rgba(255, 255, 255, 0.2)',
      chipColor: '#ffffff'
    };
  }
  if (bg === '#ecfdf5' || bg === '#dcfce7' || bg.includes('059669')) {
    return {
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      accentColor: '#a7f3d0',
      textColor: '#ffffff',
      chipBg: 'rgba(255, 255, 255, 0.2)',
      chipColor: '#ffffff'
    };
  }
  if (bg === '#fffbe6' || bg === '#fee2e2' || bg === '#fef3c7' || bg.includes('d97706')) {
    return {
      gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
      accentColor: '#fde68a',
      textColor: '#ffffff',
      chipBg: 'rgba(255, 255, 255, 0.2)',
      chipColor: '#ffffff'
    };
  }
  if (bg === '#f1f5f9' || bg.includes('334155') || bg.includes('0f172a')) {
    return {
      gradient: 'linear-gradient(135deg, #334155 0%, #0f172a 100%)',
      accentColor: '#cbd5e1',
      textColor: '#ffffff',
      chipBg: 'rgba(255, 255, 255, 0.2)',
      chipColor: '#ffffff'
    };
  }
  if (bg === '#fae8ff' || bg.includes('7e22ce')) {
    return {
      gradient: 'linear-gradient(135deg, #7e22ce 0%, #581c87 100%)',
      accentColor: '#e9d5ff',
      textColor: '#ffffff',
      chipBg: 'rgba(255, 255, 255, 0.2)',
      chipColor: '#ffffff'
    };
  }
  if (bg.startsWith('linear-gradient')) {
    return {
      gradient: bg,
      accentColor: '#ffffff',
      textColor: '#ffffff',
      chipBg: 'rgba(255, 255, 255, 0.2)',
      chipColor: '#ffffff'
    };
  }

  // Default Ocean Blue gradient
  return {
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    accentColor: '#bae6fd',
    textColor: '#ffffff',
    chipBg: 'rgba(255, 255, 255, 0.2)',
    chipColor: '#ffffff'
  };
};

export const getCategoryIcon = (category?: string, contentType?: string) => {
  if (contentType === 'document') return FileText;
  const cat = (category || '').toLowerCase();
  if (cat.includes('mortgage')) return Home;
  if (cat.includes('lending')) return Landmark;
  if (cat.includes('ai') || cat.includes('tech') || cat.includes('digital')) return Sparkles;
  if (cat.includes('operation') || cat.includes('process')) return Layers;
  if (cat.includes('compliance') || cat.includes('security') || cat.includes('policy')) return ShieldCheck;
  return BookOpen;
};

export const getCourseImage = (course: Partial<Course> | null | undefined): string => {
  if (!course) return '/course_card_default.png';
  if ((course as any).imageUrl) return (course as any).imageUrl;
  const cat = (course.category || '').toLowerCase();
  if (cat.includes('mortgage')) return '/course_card_mortgage.png';
  if (cat.includes('lending')) return '/course_card_lending.png';
  if (cat.includes('ai') || cat.includes('tech') || cat.includes('digital')) return '/course_card_tech.png';
  return '/course_card_default.png';
};

interface CourseBannerHeaderProps {
  course: Partial<Course>;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const CourseBannerHeader: React.FC<CourseBannerHeaderProps> = ({
  course,
  height = '140px',
  borderRadius = '12px 12px 0 0',
  className = '',
  style = {},
  children
}) => {
  const [imageError, setImageError] = React.useState(false);
  const hasCustomImage = Boolean(course?.imageUrl && course.imageUrl.trim().length > 0 && !imageError);
  const bannerStyle = getCourseBannerStyle(course);
  const CategoryIcon = getCategoryIcon(course?.category, course?.contentType);

  if (hasCustomImage) {
    return (
      <div
        className={`koruna-card-thumb-wrap ${className}`}
        style={{
          overflow: 'hidden',
          borderRadius,
          position: 'relative',
          height,
          background: '#0f172a',
          ...style
        }}
      >
        <img
          src={course.imageUrl}
          alt={course.title || 'Course Banner'}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={() => setImageError(true)}
        />
        {children}
      </div>
    );
  }

  // Functional CSS Banner (No image upload needed!)
  return (
    <div
      className={`koruna-card-thumb-wrap functional-course-banner ${className}`}
      style={{
        overflow: 'hidden',
        borderRadius,
        position: 'relative',
        height,
        background: bannerStyle.gradient,
        color: bannerStyle.textColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px',
        boxSizing: 'border-box',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Decorative background glow radial */}
      <div
        style={{
          position: 'absolute',
          top: '-25px',
          right: '-25px',
          width: '110px',
          height: '110px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.14)',
          pointerEvents: 'none'
        }}
      />

      {/* Large watermark background icon */}
      <CategoryIcon
        size={76}
        style={{
          position: 'absolute',
          right: '-10px',
          bottom: '-12px',
          opacity: 0.18,
          color: '#ffffff',
          pointerEvents: 'none',
          transform: 'rotate(-10deg)'
        }}
      />

      {/* Top Banner Chip Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: bannerStyle.chipBg,
            backdropFilter: 'blur(6px)',
            color: bannerStyle.chipColor,
            padding: '3px 9px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 700,
            border: '1px solid rgba(255, 255, 255, 0.25)',
            textTransform: 'capitalize'
          }}
        >
          <CategoryIcon size={12} />
          <span>{course?.category || 'General'}</span>
        </div>

        {course?.contentType === 'document' && (
          <span
            style={{
              background: '#ffffff',
              color: '#a31555',
              padding: '2px 7px',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Policy
          </span>
        )}
      </div>

      {/* Bottom overlay children (e.g. course code badge, level badge) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
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
        <CourseBannerHeader course={course} height="140px" borderRadius="12px 12px 0 0">
          {course.code && (
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '6px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
              {course.code}
            </div>
          )}
        </CourseBannerHeader>

        <div className="koruna-card-badges">
          {course.contentType === 'document' ? (
            <span className="koruna-badge-pill" style={{ background: '#fdf2f8', color: '#a31555', border: '1px solid #fbcfe8' }}>Document</span>
          ) : (
            <span className="koruna-badge-pill koruna-badge-outline-primary">{course.level}</span>
          )}
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
          {percent === 100
            ? (course.requiresCertification !== false ? 'View Certificate' : (course.contentType === 'document' ? 'Review Document' : 'Review Course'))
            : percent === 0
              ? (course.contentType === 'document' ? 'Read Document' : 'Start')
              : 'Continue'}
        </button>
      </div>
    );
  }

  if (variant === 'trainer') {
    return (
      <div className="koruna-assigned-course-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <CourseBannerHeader course={course} height="140px" borderRadius="12px 12px 0 0">
          {course.code && (
            <div style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', padding: '2px 8px', borderRadius: '6px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
              {course.code}
            </div>
          )}
        </CourseBannerHeader>

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
    const isDoc = course.contentType === 'document';
    return (
      <div
        className="koruna-assigned-course-card"
        style={{
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--koruna-border-color, #e2e8f0)',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: '1rem'
        }}
      >
        <CourseBannerHeader course={course} height="120px" borderRadius="12px 12px 0 0">
          {course.code && (
            <span style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
              {course.code}
            </span>
          )}
        </CourseBannerHeader>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.title}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            {isDoc ? (
              <span style={{ color: '#a31555', fontWeight: 600 }}>Policy / Acknowledgment</span>
            ) : (
              <>
                <span>{course.lessons?.length || 0} Lessons</span>
                <span style={{ color: '#6366f1', fontWeight: 700 }}>•</span>
                <span style={{ color: '#6366f1', fontWeight: 600 }}>{course.level}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', marginTop: 'auto' }}>
            <button
              type="button"
              style={{
                flex: 1,
                height: '36px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={onEditClick}
            >
              Edit
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                height: '36px',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#dc2626',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={onDeleteClick}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'catalogue') {
    const levelText = course.level.toUpperCase();

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

    const isCompleted = percent === 100;
    const progressFillClass = isCompleted ? 'completed' : 'active';
    const percentTextClass = isCompleted ? 'completed' : 'active';

    const isSolidButton = percent > 0 && percent < 100 && !isOverdue;
    let buttonText = 'Start';
    if (percent === 100) {
      buttonText = 'Review';
    } else if (percent > 0) {
      buttonText = 'Continue';
    }

    return (
      <div className="koruna-catalogue-card">
        <CourseBannerHeader course={course} height="140px" borderRadius="12px 12px 0 0" className="koruna-catalogue-thumb-wrap">
          <span className="koruna-catalogue-level-badge">{levelText}</span>
        </CourseBannerHeader>

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
      <CourseBannerHeader course={course} height="140px" borderRadius="8px">
        {course.code && (
          <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
            {course.code}
          </span>
        )}
        {applicationId ? (
          <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', background: '#fae8ff', color: '#a21c5c', padding: '0.2rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
            App ID: {applicationId}
          </span>
        ) : null}
      </CourseBannerHeader>
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
