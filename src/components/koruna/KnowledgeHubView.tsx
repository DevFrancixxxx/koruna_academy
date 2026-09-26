import React from 'react';
import type { UserSessionData } from '../../services/auth';
import { UnderDevelopment } from '../UnderDevelopment';

export const KnowledgeHubView: React.FC<{ userSession?: UserSessionData; searchQuery?: string }> = () => {
  return <UnderDevelopment title="Knowledge Hub" description="Company policies, handbooks, and operational guides are currently under development." />;
};
