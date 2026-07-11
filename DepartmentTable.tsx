import { Department } from './types';
import { Truck, Wrench, Settings, Users } from 'lucide-react';

const getIcon = (name: string) => {
  if (name.includes('Bình Dương')) return Truck;
  if (name.includes('Lắp ráp')) return Wrench;
  if (name.includes('Cơ khí')) return Settings;
  return Users;
};

export const DepartmentTable = ({ departments, selectedMonth }: { departments: Department[], selectedMonth?: number }) => {
  const monthStr = selectedMonth ? String(selectedMonth).padStart(2, '0') : '06';
  
  const total = departments.reduce((acc, dept) => ({
    budget: acc.budget + dept.budget,
    current: acc.current + dept.current,
    hiring: acc.hiring + dept.hiring,
    newHires: acc.newHires + dept.newHires,
    resignations: acc.resignations + dept.resignations,
  }), { budget: 0, current: 0, hiring: 0, newHires: 0, resignations: 0 });

  const totalTurnover = total.current > 0 ? ((total.resignations / total.current) * 100).toFixed(2) : '0.00';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-[#003366] text-white py-3 px-4 text-center font-bold uppercase tracking-wider text-sm">
        TÌNH HÌNH NHÂN SỰ THEO BỘ PHẬN
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[#003366] font-bold border-b border-gray-200">
              <th className="px-4 py-3 border-r border-gray-200">BỘ PHẬN</th>
              <th className="px-4 py-3 border-r border-gray-200 text-center">ĐỊNH BIÊN</th>
              <th className="px-4 py-3 border-r border-gray-200 text-center">HIỆN HỮU</th>
              <th className="px-4 py-3 border-r border-gray-200 text-center">CẦN TUYỂN</th>
              <th className="px-4 py-3 border-r border-gray-200 text-center">TUYỂN MỚI<br/><span className="text-[10px] font-normal">(Tháng {monthStr})</span></th>
              <th className="px-4 py-3 border-r border-gray-200 text-center">NGHỈ VIỆC<br/><span className="text-[10px] font-normal">(Tháng {monthStr})</span></th>
              <th className="px-4 py-3 border-r border-gray-200 text-center">TỶ LỆ NGHỈ VIỆC<br/><span className="text-[10px] font-normal">(Tháng {monthStr})</span></th>
              <th className="px-4 py-3 text-center">CẢNH BÁO</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, idx) => {
              const Icon = getIcon(dept.name);
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors even:bg-slate-50/30">
                  <td className="px-4 py-3 border-r border-gray-200 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                        <Icon size={16} />
                      </div>
                      {dept.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-medium">{dept.budget}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-medium">{dept.current}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-medium">{dept.hiring}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-medium">{dept.newHires}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-medium">{dept.resignations}</td>
                  <td className="px-4 py-3 border-r border-gray-200 text-center font-medium">{dept.turnoverRate}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase ${
                      dept.status === 'cảnh báo' ? 'bg-red-500 text-white' : 
                      dept.status === 'theo dõi' ? 'bg-yellow-400 text-white' : 
                      'bg-green-500 text-white'
                    }`}>
                      {dept.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr className="bg-blue-50 font-bold text-[#003366]">
              <td className="px-4 py-3 border-r border-gray-200 uppercase">TỔNG CỘNG</td>
              <td className="px-4 py-3 border-r border-gray-200 text-center">{total.budget}</td>
              <td className="px-4 py-3 border-r border-gray-200 text-center">{total.current}</td>
              <td className="px-4 py-3 border-r border-gray-200 text-center">{total.hiring}</td>
              <td className="px-4 py-3 border-r border-gray-200 text-center">{total.newHires}</td>
              <td className="px-4 py-3 border-r border-gray-200 text-center">{total.resignations}</td>
              <td className="px-4 py-3 border-r border-gray-200 text-center">{totalTurnover}%</td>
              <td className="px-4 py-3 text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
