import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import type { DatabaseUser, Department } from '../../services/db';
import type { UserRole } from '../../services/auth';

interface UserDirectoryViewProps {
  users: DatabaseUser[];
  departments: Department[];
  handleUpdateUserRole: (email: string, role: UserRole) => Promise<void>;
  handleUpdateUserDept: (email: string, department: string) => Promise<void>;
  handleDeleteUser: (email: string) => Promise<void>;
}

export const UserDirectoryView: React.FC<UserDirectoryViewProps> = ({
  users,
  departments,
  handleUpdateUserRole,
  handleUpdateUserDept,
  handleDeleteUser,
}) => {
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const q = (s: string) => s.toLowerCase();
  const filteredUsers = users.filter(u => {
    const term = q(userSearchQuery);
    return q(u.name).includes(term) || q(u.email).includes(term) || q(u.department || '').includes(term) || q(u.role).includes(term);
  });

  return (
    <div className="as-card">
      <div className="as-card-head">
        <h3 className="as-card-title">All users ({users.length})</h3>
        <div className="as-search">
          <Search size={15} />
          <input
            type="text"
            className="as-input"
            placeholder="Search by name, email, or role"
            aria-label="Search by name, email, or role"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="as-table-wrap">
        <table className="as-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th className="as-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.email}>
                <td>
                  <div className="as-cell-name">{u.name}</div>
                  <div className="as-cell-sub">{u.email}</div>
                </td>
                <td>
                  <select
                    className="as-select as-select--inline"
                    aria-label={`Role for ${u.name}`}
                    value={u.role}
                    onChange={(e) => handleUpdateUserRole(u.email, e.target.value as UserRole)}
                  >
                    <option value="employee">Employee</option>
                    <option value="trainer">Trainer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </td>
                <td>
                  <select
                    className="as-select as-select--inline"
                    aria-label={`Department for ${u.name}`}
                    value={u.department || ''}
                    onChange={(e) => handleUpdateUserDept(u.email, e.target.value)}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </td>
                <td className="as-right">
                  <button
                    type="button"
                    className="as-icon-btn as-icon-btn--danger"
                    onClick={() => handleDeleteUser(u.email)}
                    title="Delete user"
                    aria-label={`Delete ${u.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={4} className="as-center as-cell-sub" style={{ padding: '2rem' }}>No users match “{userSearchQuery}”.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
