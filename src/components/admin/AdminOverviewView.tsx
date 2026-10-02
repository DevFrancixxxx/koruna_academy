import React from 'react';
import type { Course, DatabaseUser } from '../../services/db';

interface AdminOverviewViewProps {
  users: DatabaseUser[];
  courses: Course[];
  totalHours: number;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  users,
  courses,
  totalHours,
}) => {
  return (
    <div className="as-stack">
      <div className="as-stats">
        <div className="as-card as-stat">
          <div className="as-stat-label">Users</div>
          <div className="as-stat-value">{users.length}</div>
        </div>
        <div className="as-card as-stat">
          <div className="as-stat-label">Courses and documents</div>
          <div className="as-stat-value">{courses.length}</div>
        </div>
        <div className="as-card as-stat">
          <div className="as-stat-label">Training hours</div>
          <div className="as-stat-value">{totalHours.toFixed(1)}h</div>
        </div>
      </div>

      <div className="as-two-col">
        <div className="as-card">
          <div className="as-card-head"><h3 className="as-card-title">Most popular courses</h3></div>
          <ul className="as-list">
            {[
              { title: 'Mortgage Basics', enrolled: 112 },
              { title: 'New Hire Orientation', enrolled: 97 },
              { title: 'Annual Compliance Refresher', enrolled: 82 },
              { title: 'Client Communication Essentials', enrolled: 80 },
              { title: 'AI Tools for Everyday Operations', enrolled: 53 }
            ].map(item => (
              <li key={item.title}>
                <span className="as-list-main">{item.title}</span>
                <span className="as-list-meta">{item.enrolled} enrolled</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="as-card">
          <div className="as-card-head"><h3 className="as-card-title">Recent activity</h3></div>
          <ul className="as-list">
            {[
              { text: <><strong>Jefrey Tatoy</strong> published Senior Mortgage VA Specialist</>, time: '3 hours ago' },
              { text: <><strong>42 employees</strong> completed Annual Compliance Refresher</>, time: 'Yesterday' },
              { text: <><strong>Lending Cluster</strong> was added to Mortgage Level 2</>, time: '2 days ago' },
              { text: <><strong>18 new users</strong> joined this week</>, time: '3 days ago' }
            ].map((a, i) => (
              <li key={i}>
                <span>{a.text}</span>
                <span className="as-list-meta">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
