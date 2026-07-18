import { useContext } from 'react';
import { ReportsContext } from './ReportsContext';

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}
