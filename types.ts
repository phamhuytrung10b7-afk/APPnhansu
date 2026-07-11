export interface Department {
  id?: string;
  name: string;
  budget: number;
  current: number;
  hiring: number;
  newHires: number;
  resignations: number;
  turnoverRate: number;
  status: ' ổn định' | 'theo dõi' | 'cảnh báo';
}

export interface MonthlyStat {
  month: string;
  rate: number;
}

export interface GlobalStats {
  month: string;
  updatedAt: string;
  totalBudget: number;
  totalCurrent: number;
  totalHiring: number;
  totalNewHires: number;
  totalResignations: number;
  totalTurnover: number;
  femaleRate?: number;
  avgAge?: number;
  avgTenure?: number;
}

export interface AgeGroup {
  id?: string;
  label: string;
  value: number;
  percentage: string;
}

export interface Alert {
  id?: string;
  department: string;
  message: string;
  type: 'danger' | 'warning' | 'success';
}

export interface Evaluation {
  id?: string;
  text: string;
}
