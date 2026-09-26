import React from 'react';
import type { UserSessionData } from '../../services/auth';
import { UnderDevelopment } from '../UnderDevelopment';

export const KorunaFeedView: React.FC<{ userSession: UserSessionData }> = () => {
  return <UnderDevelopment title="Koruna Feed" description="Social posts, announcements, and team discussions are currently under development." />;
};
