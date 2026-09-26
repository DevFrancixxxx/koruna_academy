import React from 'react';
import type { Course, UserProgress, RolePermissions } from '../../services/db';
import { UnderDevelopment } from '../UnderDevelopment';

export interface CourseCatalogViewProps {
  courses: Course[];
  userProgress: UserProgress[];
  userPerms?: RolePermissions['permissions'] | null;
  searchQuery?: string;
  onStartStudy: (course: Course) => void;
  onCreateNewCourse?: () => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = () => {
  return <UnderDevelopment title="Learn / Course Catalog" description="The course catalog and learning portal are currently under development." />;
};
