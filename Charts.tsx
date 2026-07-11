import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Department, MonthlyStat, AgeGroup } from './types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export const PersonnelStructureChart = ({ departments }: { departments: Department[] }) => {
  const data = departments.map(d => ({ name: d.name, value: d.current }));
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-xs font-bold text-[#003366] text-center mb-4 uppercase">CƠ CẤU NHÂN SỰ THEO BỘ PHẬN</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              layout="horizontal" 
              align="center" 
              verticalAlign="bottom" 
              wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center">
        <span className="inline-block bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-medium">
          Tổng số: {total} người
        </span>
      </div>
    </div>
  );
};

export const AgeStructureChart = ({ ageData }: { ageData: AgeGroup[] }) => {
  const total = ageData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-xs font-bold text-[#003366] text-center mb-4 uppercase">CƠ CẤU NHÂN SỰ THEO ĐỘ TUỔI</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={ageData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="label" 
              type="category" 
              tick={{ fontSize: 10, fill: '#003366', fontWeight: 500 }} 
              width={70}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20}>
              {ageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#3B82F6" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-center">
        <span className="inline-block bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-medium">
          Tổng số: {total} người
        </span>
      </div>
    </div>
  );
};

export const TurnoverTrendChart = ({ stats }: { stats: MonthlyStat[] }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <h3 className="text-xs font-bold text-[#003366] text-center mb-4 uppercase">XU HƯỚNG TỶ LỆ NGHỈ VIỆC 6 THÁNG GẦN NHẤT</h3>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              unit="%"
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="rate" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
              label={{ position: 'top', fontSize: 10, fill: '#003366', fontWeight: 'bold', formatter: (v: number) => `${v}%` }}
            />
            {/* Warning threshold line */}
            <Line 
              type="monotone" 
              dataKey={() => 3} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* <div className="absolute top-12 right-8 text-[10px] text-red-500 font-bold italic">
          Ngưỡng cảnh báo: 5%
        </div> */}
      </div>
      <div className="mt-2 text-center">
        <span className="inline-block bg-blue-900 text-white px-4 py-1 rounded-full text-xs font-medium">
          Tỷ lệ nghỉ việc toàn công ty
        </span>
      </div>
    </div>
  );
};
