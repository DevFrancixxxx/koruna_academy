import React from 'react';
import type { UserSessionData } from '../../services/auth';
import { UnderDevelopment } from '../UnderDevelopment';

export interface MyKorunaViewProps {
  userSession: UserSessionData;
  onNavigateTab: (tab: string) => void;
}

export const MyKorunaView: React.FC<MyKorunaViewProps> = () => {
  return <UnderDevelopment title="My Koruna" description="Your personal profile, learning history, documents, and rewards dashboard are currently under development." />;
};
