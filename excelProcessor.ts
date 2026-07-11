import { endOfMonth, startOfMonth, parse, differenceInYears, differenceInMonths, isBefore, isAfter, isWithinInterval } from 'date-fns';
import { GlobalStats, Department, AgeGroup } from './types';

interface EmployeeData {
  name: string;
  gender: string;
  department: string;
  birthDate: Date | null;
  joinDate: Date | null;
  leaveDate: Date | null;
}

function parseExcelDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  // If it's a number (Excel serial date)
  if (typeof dateStr === 'number') {
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
  }

  // String format like "dd/mm/yyyy" or "dd/mm/yy"
  try {
    const parts = String(dateStr).split('/');
    if (parts.length === 3) {
      const year = Number(parts[2].length === 2 ? `20${parts[2]}` : parts[2]);
      return new Date(year, Number(parts[1]) - 1, Number(parts[0]));
    }
  } catch (e) {
    console.error("Error parsing date:", dateStr);
  }
  return null;
}

export function processExcelData(jsonData: any[], year: number, month: number) {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const employees: EmployeeData[] = jsonData.map(row => {
    // Try to find correct keys, as headers might vary slightly
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[]) => {
      const key = keys.find(k => possibleKeys.some(pk => k.toLowerCase().includes(pk)));
      return key ? row[key] : null;
    };

    return {
      name: getVal(['họ tên', 'name']) || 'Unknown',
      gender: getVal(['giới tính', 'gender']) || 'Nam',
      department: getVal(['phòng ban', 'department']) || 'Khác',
      birthDate: parseExcelDate(getVal(['ngày sinh', 'birth'])),
      joinDate: parseExcelDate(getVal(['ngày vào', 'join'])),
      leaveDate: parseExcelDate(getVal(['ngày nghỉ', 'leave'])),
    };
  }).filter(e => e.joinDate !== null);

  // 1. Filter for the specific month
  const currentEmployees = employees.filter(e => {
    if (!e.joinDate) return false;
    const joinedBeforeEnd = isBefore(e.joinDate, monthEnd) || e.joinDate.getTime() === monthEnd.getTime();
    const activeAtEnd = !e.leaveDate || isAfter(e.leaveDate, monthEnd);
    return joinedBeforeEnd && activeAtEnd;
  });

  const newHires = employees.filter(e => {
    if (!e.joinDate) return false;
    return isWithinInterval(e.joinDate, { start: monthStart, end: monthEnd });
  });

  const resignations = employees.filter(e => {
    if (!e.leaveDate) return false;
    return isWithinInterval(e.leaveDate, { start: monthStart, end: monthEnd });
  });

  // Calculate Global Stats
  const totalCurrent = currentEmployees.length;
  const totalNewHires = newHires.length;
  const totalResignations = resignations.length;
  const totalTurnover = totalCurrent > 0 ? Number(((totalResignations / totalCurrent) * 100).toFixed(2)) : 0;
  
  const females = currentEmployees.filter(e => e.gender.trim().toLowerCase() === 'nữ');
  const femaleRate = totalCurrent > 0 ? Number(((females.length / totalCurrent) * 100).toFixed(1)) : 0;

  let totalAge = 0;
  let totalTenureMonths = 0;
  
  const ageCounts = { '<=25': 0, '26-35': 0, '36-45': 0, '>45': 0 };
  const deptMap = new Map<string, any>();

  currentEmployees.forEach(e => {
    // Age
    if (e.birthDate) {
      const age = differenceInYears(monthEnd, e.birthDate);
      totalAge += age;
      if (age <= 25) ageCounts['<=25']++;
      else if (age <= 35) ageCounts['26-35']++;
      else if (age <= 45) ageCounts['36-45']++;
      else ageCounts['>45']++;
    }

    // Tenure
    if (e.joinDate) {
      const tenure = differenceInMonths(monthEnd, e.joinDate);
      totalTenureMonths += tenure;
    }

    // Department grouping
    const deptName = e.department.trim();
    if (!deptMap.has(deptName)) {
      deptMap.set(deptName, { current: 0, newHires: 0, resignations: 0 });
    }
    deptMap.get(deptName).current++;
  });

  // Add new hires to deptMap
  newHires.forEach(e => {
    const deptName = e.department.trim();
    if (!deptMap.has(deptName)) deptMap.set(deptName, { current: 0, newHires: 0, resignations: 0 });
    deptMap.get(deptName).newHires++;
  });

  // Add resignations to deptMap
  resignations.forEach(e => {
    const deptName = e.department.trim();
    if (!deptMap.has(deptName)) deptMap.set(deptName, { current: 0, newHires: 0, resignations: 0 });
    deptMap.get(deptName).resignations++;
  });

  const avgAge = totalCurrent > 0 ? Number((totalAge / totalCurrent).toFixed(1)) : 0;
  const avgTenure = totalCurrent > 0 ? Number(((totalTenureMonths / totalCurrent) / 12).toFixed(1)) : 0;

  // Format Departments
  const departments: Department[] = Array.from(deptMap.entries()).map(([name, data]) => {
    const deptCurrent = data.current;
    const deptResign = data.resignations;
    const turnover = deptCurrent > 0 ? Number(((deptResign / deptCurrent) * 100).toFixed(2)) : 0;
    
    // Estimate a budget for visuals
    const budget = deptCurrent + Math.floor(deptCurrent * 0.1) + (turnover > 5 ? 2 : 1); 
    const hiring = budget - deptCurrent;

    let status: ' ổn định' | 'theo dõi' | 'cảnh báo' = ' ổn định';
    if (turnover > 10) status = 'cảnh báo';
    else if (turnover > 5) status = 'theo dõi';

    return {
      name,
      budget,
      current: deptCurrent,
      hiring: hiring > 0 ? hiring : 0,
      newHires: data.newHires,
      resignations: deptResign,
      turnoverRate: turnover,
      status
    };
  });

  const totalBudget = departments.reduce((acc, curr) => acc + curr.budget, 0);

  // Format Ages
  const ages: AgeGroup[] = [
    { label: '<=25 tuổi', value: ageCounts['<=25'], percentage: totalCurrent > 0 ? `${((ageCounts['<=25'] / totalCurrent)*100).toFixed(1)}%` : '0%' },
    { label: '26-35 tuổi', value: ageCounts['26-35'], percentage: totalCurrent > 0 ? `${((ageCounts['26-35'] / totalCurrent)*100).toFixed(1)}%` : '0%' },
    { label: '36-45 tuổi', value: ageCounts['36-45'], percentage: totalCurrent > 0 ? `${((ageCounts['36-45'] / totalCurrent)*100).toFixed(1)}%` : '0%' },
    { label: '>45 tuổi', value: ageCounts['>45'], percentage: totalCurrent > 0 ? `${((ageCounts['>45'] / totalCurrent)*100).toFixed(1)}%` : '0%' },
  ];

  const stats: GlobalStats = {
    month: `Tháng ${String(month).padStart(2, '0')} năm ${year}`,
    updatedAt: new Date().toLocaleDateString('vi-VN'),
    totalBudget,
    totalCurrent,
    totalHiring: totalBudget - totalCurrent,
    totalNewHires,
    totalResignations,
    totalTurnover,
    femaleRate,
    avgAge,
    avgTenure
  };

  return { stats, departments, ages };
}
