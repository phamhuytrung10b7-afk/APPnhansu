import React from 'react';
import { Users, UserPlus, UserMinus, Search, PieChart, Activity } from 'lucide-react';
import { GlobalStats } from './types';

interface KpiCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  icon: React.ElementType;
  color: string;
  iconColor: string;
}

const KpiCard = ({ label, value, subLabel, icon: Icon, color, iconColor }: KpiCardProps) => (
  <div className={`flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md`}>
    <div className={`p-2 rounded-full ${color} mb-2`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-3xl font-bold text-gray-800">{value}</span>
    {subLabel && <span className="text-[10px] text-gray-400 mt-1">{subLabel}</span>}
  </div>
);

export const KpiCards = ({ stats, selectedMonth }: { stats: GlobalStats, selectedMonth: number }) => {
  const monthStr = String(selectedMonth).padStart(2, '0');
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard 
        label="ĐỊNH BIÊN" 
        value={stats.totalBudget} 
        subLabel="người" 
        icon={Users} 
        color="bg-blue-50" 
        iconColor="text-blue-600" 
      />
      <KpiCard 
        label="HIỆN HỮU" 
        value={stats.totalCurrent} 
        subLabel="người" 
        icon={Users} 
        color="bg-green-50" 
        iconColor="text-green-600" 
      />
      <KpiCard 
        label="CẦN TUYỂN" 
        value={stats.totalHiring} 
        subLabel="người" 
        icon={Search} 
        color="bg-orange-50" 
        iconColor="text-orange-600" 
      />
      <KpiCard 
        label="TUYỂN MỚI" 
        value={stats.totalNewHires} 
        subLabel={`người (Tháng ${monthStr})`} 
        icon={UserPlus} 
        color="bg-purple-50" 
        iconColor="text-purple-600" 
      />
      <KpiCard 
        label="NGHỈ VIỆC" 
        value={stats.totalResignations} 
        subLabel={`người (Tháng ${monthStr})`} 
        icon={UserMinus} 
        color="bg-red-50" 
        iconColor="text-red-600" 
      />
      <KpiCard 
        label="TỶ LỆ NGHỈ VIỆC" 
        value={`${stats.totalTurnover}%`} 
        subLabel="toàn công ty" 
        icon={Activity} 
        color="bg-cyan-50" 
        iconColor="text-cyan-600" 
      />
    </div>
  );
};
