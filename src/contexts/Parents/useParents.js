import { useContext } from 'react';
import { ParentsContext } from './ParentsContext';

export function useParents() {
  const context = useContext(ParentsContext);
  if (!context) {
    throw new Error('useParents must be used within a ParentsProvider');
  }
  return context;
}
