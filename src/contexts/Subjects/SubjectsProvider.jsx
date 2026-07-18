import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SubjectsContext } from './SubjectsContext';
import { useAuth } from '../Auth/useAuth';
import { subjectsService } from '../../services/subjects/subjects.service';

export default function SubjectsProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(true);

  const fetchRequestRef = useRef(0);

  const fetchSubjects = useCallback((...args) => {
    const force = args.find(a => typeof a === 'boolean') || false;
    const tokenArg = args.find(a => typeof a === 'string');
    const activeToken = tokenArg || localStorage.getItem("auth_token");
    if (!activeToken) return;

    if (!force && !isStale && subjects.length > 0) {
      return;
    }

    const reqId = ++fetchRequestRef.current;
    setLoading(true);
    subjectsService.getSubjects()
      .then((data) => {
        // Guard: ignore response if user has logged out
        if (!localStorage.getItem('auth_token')) return;
        if (reqId !== fetchRequestRef.current) return;
        if (data.success) {
          const mapped = data.subjects.map((sub) => ({
            id: `sub-${sub.id}`,
            name: sub.name_ar,
            nameEn: sub.name_en,
          }));
          setSubjects(mapped);
          setIsStale(false);
        }
      })
      .catch((err) => {
        if (reqId === fetchRequestRef.current) {
          console.error("Error fetching subjects:", err);
        }
      })
      .finally(() => {
        if (reqId === fetchRequestRef.current) {
          setLoading(false);
        }
      });
  }, [isStale, subjects.length]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSubjects([]);
      setIsStale(true);
    }
  }, [isAuthenticated]);

  const subjectsContextValue = useMemo(() => ({
    subjects,
    setSubjects,
    loading,
    fetchSubjects,
  }), [subjects, loading, fetchSubjects]);

  return (
    <SubjectsContext.Provider value={subjectsContextValue}>
      {children}
    </SubjectsContext.Provider>
  );
}
