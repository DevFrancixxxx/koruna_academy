import React from 'react';
import type { UserSessionData } from '../../services/auth';
import { UnderDevelopment } from '../UnderDevelopment';

export const RecognitionRewardsView: React.FC<{ userSession: UserSessionData }> = () => {
  return <UnderDevelopment title="Recognition & Rewards" description="Points, achievements, badges, and rewards store are currently under development." />;
};
