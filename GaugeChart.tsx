import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  percentage: number;
  numerator: number;
  denominator: number;
}

export const GaugeChart = ({ percentage, numerator, denominator }: GaugeChartProps) => {
  const data = [
    { value: percentage },
    { value: 100 - percentage },
  ];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full">
      <h3 className="text-[10px] font-bold text-[#003366] text-center mb-2 uppercase tracking-wider">TỶ LỆ ĐÁP ỨNG ĐỊNH BIÊN</h3>
      <div className="relative w-full h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill="#3B82F6" />
              <Cell fill="#E2E8F0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pb-2">
          <div className="text-3xl font-extrabold text-[#003366]">{percentage.toString().replace('.', ',')}%</div>
          <div className="text-[11px] text-gray-500 font-medium">{numerator} / {denominator} người</div>
        </div>
      </div>
      <div className="flex justify-between w-full px-4 text-[10px] text-gray-400 font-bold mt-1">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
};
