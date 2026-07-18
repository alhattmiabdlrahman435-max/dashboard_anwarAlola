import { useContext } from 'react';
import { StudentsContext } from './StudentsContext';

export const useStudents = () => {
  const context = useContext(StudentsContext);
  if (!context) {
    throw new Error('useStudents must be used within a StudentsProvider');
  }
  return context;
};
