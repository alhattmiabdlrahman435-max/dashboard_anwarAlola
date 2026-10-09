/**
 * سياسة الأوزان والحسابات الأكاديمية لشيت الكنترول النصفي
 * متطابقة 100% مع كشف رصد درجات الفصل الأول 2026 الرسمي للمدرسة:
 * م1 (أعمال الفصل) = 20 درجة
 * ن1 (اختبار النصفي) = 30 درجة
 * مج1 (مجموع المادة) = 50 درجة
 */

export const GRADING_POLICY = {
  courseworkMax: 20,       // أعمال الفصل الأول (م1)
  examMax: 30,             // اختبار نصف الفصل (ن1)
  subjectTotalMax: 50,     // مجموع المادة للفصل الأول (مج1)
  divisor: 15,             // معامل قسمة مجموع المحصلات الـ 3 (300 / 15 = 20)
};

/**
 * حساب أعمال الفصل م1 من المحصلات الشهرية الثلاث
 * @param {number} m1Tot - مجموع الشهر الأول (من 100)
 * @param {number} m2Tot - مجموع الشهر الثاني (من 100)
 * @param {number} m3Tot - مجموع الشهر الثالث (من 100)
 * @returns {number} درجة أعمال الفصل من 20
 */
export const calculateM1 = (m1Tot = 0, m2Tot = 0, m3Tot = 0) => {
  const sum = (Number(m1Tot) || 0) + (Number(m2Tot) || 0) + (Number(m3Tot) || 0);
  return parseFloat((sum / GRADING_POLICY.divisor).toFixed(2));
};

/**
 * حساب مجموع المادة مج1 من أعمال الفصل والاختبار
 * @param {number} m1Val - أعمال الفصل من 20
 * @param {number|null} n1Val - اختبار النصفي من 30
 * @returns {number} مجموع المادة من 50
 */
export const calculateMaj1 = (m1Val = 0, n1Val = null) => {
  const cVal = Number(m1Val) || 0;
  const eVal = n1Val !== null && n1Val !== undefined && n1Val !== '' ? Number(n1Val) : 0;
  return parseFloat((cVal + eVal).toFixed(2));
};

/**
 * حساب وتحديث ترتيب الطلاب مع معالجة حالات التساوي
 * @param {Array} studentsList 
 * @returns {Array} قائمة الطلاب مع خاصية rank
 */
export const calculateRankings = (studentsList = []) => {
  if (!Array.isArray(studentsList) || studentsList.length === 0) return [];

  // ترتيب تنازلي حسب المجموع الكلي
  const sorted = [...studentsList].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && (Number(sorted[i].total) || 0) < (Number(sorted[i - 1].total) || 0)) {
      currentRank = i + 1;
    }
    sorted[i] = {
      ...sorted[i],
      rank: currentRank
    };
  }

  return sorted;
};

/**
 * مسمى الترتيب بالعربية
 * @param {number} rank 
 * @returns {string}
 */
export const formatRankText = (rank) => {
  const rankNumber = Number(rank);
  const ranksMap = {
    1: 'الأول 🥇',
    2: 'الثاني 🥈',
    3: 'الثالث 🥉',
    4: 'الرابع',
    5: 'الخامس',
    6: 'السادس',
    7: 'السابع',
    8: 'الثامن',
    9: 'التاسع',
    10: 'العاشر',
  };
  return ranksMap[rankNumber] || `${rankNumber}`;
};
