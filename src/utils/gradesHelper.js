export const calculateMonthTotal = (monthObj) => {
  if (!monthObj) return 0;
  return (monthObj.homework || 0) + (monthObj.attendance || 0) + (monthObj.behavior || 0) + (monthObj.oral || 0) + (monthObj.written || 0);
};

export const getSubjectPeriodGrade = (studentId, subject, term, period, getStudentDetailedGrades) => {
  const data = getStudentDetailedGrades(studentId, subject, term);
  if (period === 'm1' || period === 'm2' || period === 'm3') {
    const monthObj = data[period] || {};
    return (monthObj.homework || 0) + (monthObj.attendance || 0) + (monthObj.behavior || 0) + (monthObj.oral || 0) + (monthObj.written || 0);
  } else if (period === 'termTotal') {
    const m1_tot = calculateMonthTotal(data.m1);
    const m2_tot = calculateMonthTotal(data.m2);
    const m3_tot = calculateMonthTotal(data.m3);
    const avg = parseFloat(((m1_tot + m2_tot + m3_tot) / 15).toFixed(2));
    return parseFloat((avg + (data.finalExam || 0)).toFixed(2));
  } else if (period === 'yearlyTotal') {
    const d1 = getStudentDetailedGrades(studentId, subject, 'term1');
    const t1_tot = calculateMonthTotal(d1.m1) + calculateMonthTotal(d1.m2) + calculateMonthTotal(d1.m3);
    const t1_avg = parseFloat((t1_tot / 15).toFixed(2));
    const t1_final = t1_avg + d1.finalExam;
    
    const d2 = getStudentDetailedGrades(studentId, subject, 'term2');
    const t2_tot = calculateMonthTotal(d2.m1) + calculateMonthTotal(d2.m2) + calculateMonthTotal(d2.m3);
    const t2_avg = parseFloat((t2_tot / 15).toFixed(2));
    const t2_final = t2_avg + d2.finalExam;

    return Math.round(t1_final + t2_final);
  }
  return 0;
};

export const calculateStudentClassRowTotal = (mathVal, scienceVal, arabicVal, englishVal, period) => {
  const sum = mathVal + scienceVal + arabicVal + englishVal;
  if (period === 'm1' || period === 'm2' || period === 'm3') {
    const percentage = parseFloat((sum / 4).toFixed(2));
    return { val: percentage, text: `${percentage}% (${sum} / 400)` };
  } else if (period === 'termTotal') {
    const percentage = parseFloat((sum / 2).toFixed(2));
    return { val: percentage, text: `${percentage}% (${sum} / 200)` };
  } else if (period === 'yearlyTotal') {
    const percentage = parseFloat((sum / 4).toFixed(2));
    return { val: percentage, text: `${percentage}% (${sum} / 400)` };
  }
  return { val: 0, text: '0' };
};
