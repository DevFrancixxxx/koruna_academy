import React from 'react';
import type { SystemSettings } from '../../services/db';

interface PlatformSettingsViewProps {
  settings: SystemSettings;
  handleSaveSettings: (newSettings: Partial<SystemSettings>) => void | Promise<void>;
}

export const PlatformSettingsView: React.FC<PlatformSettingsViewProps> = ({
  settings,
  handleSaveSettings,
}) => {
  return (
    <div className="as-card">
      <label className="as-setting">
        <div>
          <div className="as-setting-name">Dark navigation sidebar</div>
          <div className="as-card-desc">Use a dark background for the left menu.</div>
        </div>
        <input
          type="checkbox"
          className="as-check"
          checked={settings.darkSidebar}
          onChange={(e) => handleSaveSettings({ darkSidebar: e.target.checked })}
        />
      </label>

      <div className="as-setting">
        <div>
          <label htmlFor="quiz-threshold" className="as-setting-name">Quiz passing score</label>
          <div className="as-card-desc">Minimum percentage needed to pass (50–100).</div>
        </div>
        <input
          id="quiz-threshold"
          type="number"
          min={50}
          max={100}
          className="as-input"
          style={{ width: 90 }}
          value={settings.quizPassingThreshold}
          onChange={(e) => handleSaveSettings({ quizPassingThreshold: parseInt(e.target.value) || 70 })}
        />
      </div>

      <label className="as-setting">
        <div>
          <div className="as-setting-name">Auto-enroll new employees</div>
          <div className="as-card-desc">Add new employees to compliance modules automatically.</div>
        </div>
        <input
          type="checkbox"
          className="as-check"
          checked={settings.autoEnrollNewUsers}
          onChange={(e) => handleSaveSettings({ autoEnrollNewUsers: e.target.checked })}
        />
      </label>

      <label className="as-setting">
        <div>
          <div className="as-setting-name">Email reminders</div>
          <div className="as-card-desc">Remind employees about overdue compliance training.</div>
        </div>
        <input
          type="checkbox"
          className="as-check"
          checked={settings.emailReminders}
          onChange={(e) => handleSaveSettings({ emailReminders: e.target.checked })}
        />
      </label>
    </div>
  );
};
