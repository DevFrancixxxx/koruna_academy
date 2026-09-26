import React from 'react';
import type { Course, UserProgress } from '../../services/db';
import { UnderDevelopment } from '../UnderDevelopment';

export interface PathStep {
  id: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'in_progress' | 'not_started';
  courseId?: string;
}

export interface LearningPathViewProps {
  courses?: Course[];
  userProgress?: UserProgress[];
  onStartStudy?: (course: Course) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = () => {
  return <UnderDevelopment title="Learning Paths" description="Learning paths and onboarding roadmaps are currently under development." />;
};
