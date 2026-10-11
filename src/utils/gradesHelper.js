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
    let avg = 0;
    if (data.coursework !== undefined && data.coursework !== null && data.coursework !== '') {
      avg = parseFloat(data.coursework);
    } else {
      const m1_tot = calculateMonthTotal(data.m1);
      const m2_tot = calculateMonthTotal(data.m2);
      const m3_tot = calculateMonthTotal(data.m3);
      avg = parseFloat(((m1_tot + m2_tot + m3_tot) / 15).toFixed(2));
    }
    return parseFloat((avg + (data.finalExam || 0)).toFixed(2));
  } else if (period === 'yearlyTotal') {
    const d1 = getStudentDetailedGrades(studentId, subject, 'term1');
    let t1_avg = 0;
    if (d1 && d1.coursework !== undefined && d1.coursework !== null && d1.coursework !== '') {
      t1_avg = parseFloat(d1.coursework);
    } else if (d1) {
      const t1_tot = calculateMonthTotal(d1.m1) + calculateMonthTotal(d1.m2) + calculateMonthTotal(d1.m3);
      t1_avg = parseFloat((t1_tot / 15).toFixed(2));
    }
    const t1_final = t1_avg + ((d1 && d1.finalExam) || 0);
    
    const d2 = getStudentDetailedGrades(studentId, subject, 'term2');
    let t2_avg = 0;
    if (d2 && d2.coursework !== undefined && d2.coursework !== null && d2.coursework !== '') {
      t2_avg = parseFloat(d2.coursework);
    } else if (d2) {
      const t2_tot = calculateMonthTotal(d2.m1) + calculateMonthTotal(d2.m2) + calculateMonthTotal(d2.m3);
      t2_avg = parseFloat((t2_tot / 15).toFixed(2));
    }
    const t2_final = t2_avg + ((d2 && d2.finalExam) || 0);

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
