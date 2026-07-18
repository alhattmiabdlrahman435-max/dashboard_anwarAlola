import { useContext } from 'react';
import ClassesContext from './ClassesContext';

export function useClasses() {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassesProvider');
  }
  return context;
}
