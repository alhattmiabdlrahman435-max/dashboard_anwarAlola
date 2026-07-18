import { useState, useEffect, useCallback, useMemo } from 'react';
import { SubjectsContext } from './SubjectsContext';
import { useAuth } from '../Auth/useAuth';
import { subjectsService } from '../../services/subjects/subjects.service';

export default function SubjectsProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = useCallback((token) => {
    const activeToken = token || localStorage.getItem("auth_token");
    if (!activeToken) return;

    setLoading(true);
    subjectsService.getSubjects()
      .then((data) => {
        if (data.success) {
          const mapped = data.subjects.map((sub) => ({
            id: `sub-${sub.id}`,
            name: sub.name_ar,
            nameEn: sub.name_en,
          }));
          setSubjects(mapped);
        }
      })
      .catch((err) => console.error("Error fetching subjects:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("auth_token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSubjects(token);
    }
  }, [isAuthenticated, fetchSubjects]);

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
