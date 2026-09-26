import React from 'react';
import type { UserSessionData } from '../../services/auth';
import { UnderDevelopment } from '../UnderDevelopment';

export const MyCareerView: React.FC<{ userSession: UserSessionData; onNavigateTab: (tab: string) => void }> = () => {
  return <UnderDevelopment title="My Career" description="Career growth matrix, skills tracking, and personal goals are currently under development." />;
};
