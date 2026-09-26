import React from 'react';
import type { UserSessionData } from '../../services/auth';
import { UnderDevelopment } from '../UnderDevelopment';

export const ClubsEngageView: React.FC<{ userSession: UserSessionData }> = () => {
  return <UnderDevelopment title="Clubs & Engagement" description="Employee interest clubs, team events, and wellness challenges are currently under development." />;
};
