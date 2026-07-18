import { useContext } from 'react';
import TeachersContext from './TeachersContext';

export const useTeachers = () => {
  const context = useContext(TeachersContext);
  if (!context) {
    throw new Error('useTeachers must be used within a TeachersProvider');
  }
  return context;
};
