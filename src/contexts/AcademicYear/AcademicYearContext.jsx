import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../Auth/AuthContext';

export const AcademicYearContext = createContext(null);

const STORAGE_KEY = 'selected_academic_year_id';

export function AcademicYearProvider({ children }) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated ?? false;

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : null;
  });
  const [isLoadingYears, setIsLoadingYears] = useState(false);

  const fetchAcademicYears = useCallback(async () => {
    if (!isAuthenticated) {
      setAcademicYears([]);
      return;
    }

    setIsLoadingYears(true);
    try {
      const data = await api.get('/api/academic-years');
      const years = Array.isArray(data?.academic_years) ? data.academic_years : [];
      setAcademicYears(years);

      const current = years.find((y) => y.is_current) || years[0] || null;
      const savedId = localStorage.getItem(STORAGE_KEY);
      const savedExists = savedId && years.some((y) => Number(y.id) === Number(savedId));

      if (savedExists) {
        setSelectedYearId(Number(savedId));
      } else if (current) {
        localStorage.setItem(STORAGE_KEY, String(current.id));
        setSelectedYearId(Number(current.id));
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Failed to load academic years:', err);
      }
    } finally {
      setIsLoadingYears(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  const currentYear = useMemo(
    () => academicYears.find((y) => y.is_current) || academicYears[0] || null,
    [academicYears]
  );

  const selectedYear = useMemo(
    () => academicYears.find((y) => Number(y.id) === Number(selectedYearId)) || currentYear,
    [academicYears, selectedYearId, currentYear]
  );

  const isViewingArchive = useMemo(() => {
    if (!selectedYear || !currentYear) return false;
    return Number(selectedYear.id) !== Number(currentYear.id);
  }, [selectedYear, currentYear]);

  const switchAcademicYear = useCallback((yearId, { reload = true } = {}) => {
    const numericId = Number(yearId);
    if (!numericId || numericId === Number(selectedYearId)) return;

    localStorage.setItem(STORAGE_KEY, String(numericId));
    setSelectedYearId(numericId);

    if (reload) {
      window.location.reload();
    }
  }, [selectedYearId]);

  const createAcademicYear = useCallback(async (payload) => {
    const data = await api.post('/api/academic-years', payload);
    await fetchAcademicYears();
    return data;
  }, [fetchAcademicYears]);

  const setCurrentAcademicYear = useCallback(async (yearId) => {
    const data = await api.post(`/api/academic-years/${yearId}/set-current`, {});
    localStorage.setItem(STORAGE_KEY, String(yearId));
    setSelectedYearId(Number(yearId));
    await fetchAcademicYears();
    return data;
  }, [fetchAcademicYears]);

  const value = useMemo(() => ({
    academicYears,
    currentYear,
    selectedYear,
    selectedYearId: selectedYear?.id ?? selectedYearId,
    isViewingArchive,
    isLoadingYears,
    fetchAcademicYears,
    switchAcademicYear,
    createAcademicYear,
    setCurrentAcademicYear,
  }), [
    academicYears,
    currentYear,
    selectedYear,
    selectedYearId,
    isViewingArchive,
    isLoadingYears,
    fetchAcademicYears,
    switchAcademicYear,
    createAcademicYear,
    setCurrentAcademicYear,
  ]);

  return (
    <AcademicYearContext.Provider value={value}>
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const ctx = useContext(AcademicYearContext);
  if (!ctx) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return ctx;
}
