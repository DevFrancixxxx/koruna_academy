import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Course, DatabaseUser } from '../../services/db';

interface AdminAssignmentsViewProps {
  users: DatabaseUser[];
  courses: Course[];
  handleAssignCourse: (courseId: string, userEmail: string) => Promise<void>;
}

const roleLabel: Record<string, string> = { employee: 'Employee', trainer: 'Trainer', admin: 'Administrator' };

export const AdminAssignmentsView: React.FC<AdminAssignmentsViewProps> = ({
  users,
  courses,
  handleAssignCourse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const q = (s: string) => s.toLowerCase();
  const assignmentUsers = users.filter(u => q(u.name).includes(q(searchQuery)) || q(u.email).includes(q(searchQuery)));

  return (
    <div className="as-card">
      <div className="as-card-head">
        <div>
          <h3 className="as-card-title">Employees ({assignmentUsers.length})</h3>
          <p className="as-card-desc">Pick a course in the last column to enroll that person.</p>
        </div>
        <div className="as-search">
          <Search size={15} />
          <input
            type="text"
            className="as-input"
            placeholder="Search by name or email"
            aria-label="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="as-table-wrap">
        <table className="as-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Role</th>
              <th>Enroll in</th>
            </tr>
          </thead>
          <tbody>
            {assignmentUsers.map(user => (
              <tr key={user.email}>
                <td>
                  <div className="as-cell-name">{user.name}</div>
                  <div className="as-cell-sub">{user.email}</div>
                </td>
                <td><span className="as-badge">{user.department || 'General'}</span></td>
                <td><span className={`as-badge as-badge--${user.role}`}>{roleLabel[user.role] || user.role}</span></td>
                <td>
                  <select
                    className="as-select as-select--inline"
                    aria-label={`Enroll ${user.name} in a course`}
                    defaultValue=""
                    onChange={async (e) => {
                      const selectedCourseId = e.target.value;
                      if (selectedCourseId) {
                        await handleAssignCourse(selectedCourseId, user.email);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="">Select a course…</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code}: {c.title}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {assignmentUsers.length === 0 && (
              <tr><td colSpan={4} className="as-center as-cell-sub" style={{ padding: '2rem' }}>No employees match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
