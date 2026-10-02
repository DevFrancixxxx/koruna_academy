import React from 'react';
import type { RolePermissions } from '../../services/db';
import type { UserRole } from '../../services/auth';

interface PermissionsMatrixViewProps {
  permissions: RolePermissions[];
  handlePermissionToggle: (role: UserRole, capability: keyof RolePermissions['permissions']) => void | Promise<void>;
}

const roleLabel: Record<string, string> = { employee: 'Employee', trainer: 'Trainer', admin: 'Administrator' };

export const PermissionsMatrixView: React.FC<PermissionsMatrixViewProps> = ({
  permissions,
  handlePermissionToggle,
}) => {
  return (
    <div className="as-card">
      <div className="as-table-wrap">
        <table className="as-table" style={{ minWidth: 520 }}>
          <thead>
            <tr>
              <th>Capability</th>
              <th className="as-center">Employee</th>
              <th className="as-center">Trainer</th>
              <th className="as-center">Administrator</th>
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'editCourses', label: 'Create and edit course content' },
              { key: 'assignCourses', label: 'Assign courses' },
              { key: 'manageUsers', label: 'Manage user accounts and roles' },
              { key: 'systemSettings', label: 'Change platform settings' }
            ].map(perm => (
              <tr key={perm.key}>
                <td className="as-cell-name">{perm.label}</td>
                {(['employee', 'trainer', 'admin'] as UserRole[]).map(role => (
                  <td key={role} className="as-center">
                    <input
                      type="checkbox"
                      className="as-check"
                      aria-label={`${perm.label} for ${roleLabel[role]}`}
                      checked={!!permissions.find(p => p.role === role)?.permissions[perm.key as keyof RolePermissions['permissions']]}
                      onChange={() => handlePermissionToggle(role, perm.key as any)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
