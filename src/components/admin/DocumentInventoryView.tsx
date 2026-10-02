import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import type { Course } from '../../services/db';
import { CourseCard } from '../courses/CourseCard';

interface DocumentInventoryViewProps {
  documentsOnly: Course[];
  docCategories: string[];
  handleStartEditCourse: (course: Course) => void;
  setActiveInnerTab: (tab: string) => void;
  setCourseToDelete: (item: { id: string; title: string; contentType?: string } | null) => void;
}

export const DocumentInventoryView: React.FC<DocumentInventoryViewProps> = ({
  documentsOnly,
  docCategories,
  handleStartEditCourse,
  setActiveInnerTab,
  setCourseToDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const q = (s: string) => s.toLowerCase();

  const filteredDocs = documentsOnly.filter(d => {
    const term = q(searchQuery);
    const matchesSearch = q(d.title).includes(term) || q(d.code).includes(term) || q(d.description).includes(term) || (!!d.documentContent && q(d.documentContent).includes(term));
    return matchesSearch && (categoryFilter === 'All' || d.category === categoryFilter);
  });

  return (
    <div className="as-stack">
      <div className="as-stats">
        <div className="as-card as-stat">
          <div className="as-stat-label">Documents</div>
          <div className="as-stat-value">{documentsOnly.length}</div>
        </div>
        <div className="as-card as-stat">
          <div className="as-stat-label">Issue a certificate</div>
          <div className="as-stat-value">{documentsOnly.filter(d => d.requiresCertification !== false).length}</div>
        </div>
        <div className="as-card as-stat">
          <div className="as-stat-label">Categories</div>
          <div className="as-stat-value">{new Set(documentsOnly.map(d => d.category)).size}</div>
        </div>
      </div>

      <div className="as-card as-toolbar">
        <div className="as-search">
          <Search size={15} />
          <input
            type="text"
            className="as-input"
            placeholder="Search by title, code, or content"
            aria-label="Search by title, code, or content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="as-chips">
          {docCategories.map(opt => (
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
        {filteredDocs.map(doc => (
          <CourseCard
            key={doc.id}
            course={doc}
            variant="admin"
            onEditClick={() => { handleStartEditCourse(doc); setActiveInnerTab('creator'); }}
            onDeleteClick={() => setCourseToDelete({ id: doc.id, title: doc.title, contentType: 'document' })}
          />
        ))}
        {filteredDocs.length === 0 && (
          <div className="as-empty">
            <div style={{ marginBottom: '0.5rem' }}><FileText size={32} /></div>
            <h3>No documents found</h3>
            <p>Try a different search, or create a new document.</p>
            <button type="button" className="as-btn as-btn--secondary" onClick={() => { setSearchQuery(''); setCategoryFilter('All'); }}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
