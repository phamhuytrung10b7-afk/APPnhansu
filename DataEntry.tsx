import React, { useState, useRef } from 'react';
import { GlobalStats, Department, MonthlyStat, AgeGroup, Alert, Evaluation } from './types';
import { Save, Plus, Trash2, ArrowLeft, RefreshCw, LayoutDashboard, Users, BarChart3, AlertTriangle, Settings, ChevronRight, UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import { processExcelData } from './excelProcessor';

interface DataEntryProps {
  onBack: () => void;
  initialStats: GlobalStats;
  initialDepartments: Department[];
  initialMonthlyStats: MonthlyStat[];
  initialAgeGroups: AgeGroup[];
  initialAlerts: Alert[];
  initialEvaluations: Evaluation[];
}

type TabType = 'overview' | 'departments' | 'trends' | 'age' | 'alerts';

export const DataEntry = ({ 
  onBack, 
  initialStats, 
  initialDepartments, 
  initialMonthlyStats,
  initialAgeGroups,
  initialAlerts,
  initialEvaluations
}: DataEntryProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<GlobalStats>(initialStats);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>(initialMonthlyStats);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(initialAgeGroups);
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // raw: false ensures dates are parsed as formatted strings if they aren't parsed as native excel dates
        const data = XLSX.utils.sheet_to_json(ws, { raw: false }); 
        
        // Extract month/year from stats.month (e.g. "Tháng 06 năm 2026")
        let month = 6;
        let year = 2026;
        const match = stats.month.match(/Tháng (\d+) năm (\d+)/i);
        if (match) {
          month = parseInt(match[1], 10);
          year = parseInt(match[2], 10);
        }

        const processed = processExcelData(data, year, month);
        
        setStats(processed.stats);
        setDepartments(processed.departments);
        setAgeGroups(processed.ages);
        
        showMessage('Đã nhập dữ liệu từ Excel. Vui lòng nhấn "Lưu thay đổi".');
      } catch (error) {
        console.error("Lỗi khi đọc file Excel", error);
        showMessage('Lỗi khi đọc file Excel');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateLocalStorage = (updater: (data: any) => any) => {
    try {
      const raw = localStorage.getItem('hr_dashboard_data');
      let data = raw ? JSON.parse(raw) : {};
      data = updater(data);
      localStorage.setItem('hr_dashboard_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error updating local storage', error);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const monthStr = String(selectedMonth).padStart(2, '0');
      const docId = `2026_${monthStr}`;
      
      updateLocalStorage((data) => {
        data.reports = data.reports || {};
        data.reports[docId] = {
          stats,
          departments,
          ages: ageGroups
        };
        // Update global fields if needed
        data.stats = stats;
        data.departments = departments;
        data.ageGroups = ageGroups;
        return data;
      });

      showMessage('Đã lưu toàn bộ dữ liệu thành công!');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobalStats = async () => {
    setSaving(true);
    try {
      updateLocalStorage((data) => {
        data.stats = stats;
        return data;
      });
      showMessage('Đã lưu thông số chung thành công!');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi lưu thông số chung');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDepartment = async (dept: Department) => {
    setSaving(true);
    try {
      const id = dept.id || `dept_${Date.now()}`;
      const newDept = { ...dept, id };
      updateLocalStorage((data) => {
        data.departments = data.departments || [];
        const index = data.departments.findIndex((d: any) => d.id === id);
        if (index > -1) data.departments[index] = newDept;
        else data.departments.push(newDept);
        return data;
      });
      showMessage(`Đã lưu bộ phận ${dept.name} thành công!`);
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi lưu bộ phận');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bộ phận này?')) return;
    setSaving(true);
    try {
      updateLocalStorage((data) => {
        data.departments = (data.departments || []).filter((d: any) => d.id !== id);
        return data;
      });
      setDepartments(departments.filter(d => d.id !== id));
      showMessage('Đã xóa bộ phận thành công!');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi xóa bộ phận');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAgeGroup = async (group: AgeGroup) => {
    setSaving(true);
    try {
      const id = group.id || `age_${Date.now()}`;
      const newGroup = { ...group, id };
      updateLocalStorage((data) => {
        data.ageGroups = data.ageGroups || [];
        const index = data.ageGroups.findIndex((d: any) => d.id === id);
        if (index > -1) data.ageGroups[index] = newGroup;
        else data.ageGroups.push(newGroup);
        return data;
      });
      showMessage(`Đã lưu ${group.label}`);
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi lưu độ tuổi');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAgeGroup = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm này?')) return;
    setSaving(true);
    try {
      updateLocalStorage((data) => {
        data.ageGroups = (data.ageGroups || []).filter((d: any) => d.id !== id);
        return data;
      });
      setAgeGroups(ageGroups.filter(d => d.id !== id));
      showMessage('Đã xóa nhóm tuổi');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAlert = async (alert: Alert) => {
    setSaving(true);
    try {
      const id = alert.id || `alert_${Date.now()}`;
      const newAlert = { ...alert, id };
      updateLocalStorage((data) => {
        data.alerts = data.alerts || [];
        const index = data.alerts.findIndex((d: any) => d.id === id);
        if (index > -1) data.alerts[index] = newAlert;
        else data.alerts.push(newAlert);
        return data;
      });
      showMessage('Đã lưu cảnh báo');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi lưu cảnh báo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    setSaving(true);
    try {
      updateLocalStorage((data) => {
        data.alerts = (data.alerts || []).filter((d: any) => d.id !== id);
        return data;
      });
      setAlerts(alerts.filter(d => d.id !== id));
      showMessage('Đã xóa cảnh báo');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    setSaving(true);
    try {
      const id = evaluation.id || `eval_${Date.now()}`;
      const newEval = { ...evaluation, id };
      updateLocalStorage((data) => {
        data.evaluations = data.evaluations || [];
        const index = data.evaluations.findIndex((d: any) => d.id === id);
        if (index > -1) data.evaluations[index] = newEval;
        else data.evaluations.push(newEval);
        return data;
      });
      showMessage('Đã lưu đánh giá');
    } catch (error) {
      console.error(error);
      showMessage('Lỗi khi lưu đánh giá');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvaluation = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
    setSaving(true);
    try {
      updateLocalStorage((data) => {
        data.evaluations = (data.evaluations || []).filter((d: any) => d.id !== id);
        return data;
      });
      setEvaluations(evaluations.filter(d => d.id !== id));
      showMessage('Đã xóa đánh giá');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'overview', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { id: 'departments', label: 'Dữ liệu Bộ phận', icon: Users },
    { id: 'trends', label: 'Xu hướng nghỉ việc', icon: BarChart3 },
    { id: 'age', label: 'Cơ cấu độ tuổi', icon: Settings },
    { id: 'alerts', label: 'Cảnh báo & Đánh giá', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-[#003366] text-white flex-shrink-0">
        <div className="p-4 border-b border-blue-800">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} /> Quay lại Dashboard
          </button>
          <h2 className="font-bold uppercase tracking-wider">Trang Nhập Liệu</h2>
        </div>
        <nav className="p-2 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black text-[#003366] uppercase flex items-center gap-2">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-4">
              {message && (
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm animate-pulse">
                  {message}
                </div>
              )}
              {activeTab === 'overview' && (
                <>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  >
                    <UploadCloud size={16} /> Nhập từ Excel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng định biên</label>
                  <input type="number" value={stats.totalBudget} onChange={(e) => setStats({...stats, totalBudget: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng hiện hữu</label>
                  <input type="number" value={stats.totalCurrent} onChange={(e) => setStats({...stats, totalCurrent: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng cần tuyển</label>
                  <input type="number" value={stats.totalHiring} onChange={(e) => setStats({...stats, totalHiring: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng tuyển mới (Tháng)</label>
                  <input type="number" value={stats.totalNewHires} onChange={(e) => setStats({...stats, totalNewHires: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tổng nghỉ việc (Tháng)</label>
                  <input type="number" value={stats.totalResignations} onChange={(e) => setStats({...stats, totalResignations: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tỷ lệ nghỉ việc (%)</label>
                  <input type="number" step="0.01" value={stats.totalTurnover} onChange={(e) => setStats({...stats, totalTurnover: Number(e.target.value)})} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                <button 
                  onClick={handleSaveAll} 
                  disabled={saving} 
                  className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} /> Lưu toàn bộ dữ liệu (Excel)
                </button>
                <button 
                  onClick={handleSaveGlobalStats} 
                  disabled={saving} 
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={18} /> Lưu thông số chung
                </button>
              </div>
            </div>
          )}

          {/* TAB: DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
              <div className="flex justify-end">
                <button onClick={() => setDepartments([...departments, { name: 'Bộ phận mới', budget: 0, current: 0, hiring: 0, newHires: 0, resignations: 0, turnoverRate: 0, status: ' ổn định' }])} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors text-sm">
                  <Plus size={16} /> Thêm bộ phận
                </button>
              </div>
              
              <div className="space-y-6">
                {departments.map((dept, index) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 space-y-4 shadow-sm relative">
                    <div className="flex items-center justify-between">
                      <input 
                        type="text" 
                        value={dept.name} 
                        onChange={(e) => {
                          const newDepts = [...departments];
                          newDepts[index].name = e.target.value;
                          setDepartments(newDepts);
                        }}
                        className="text-lg font-bold text-[#003366] bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none w-1/2 md:w-1/3"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveDepartment(dept)} className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded" title="Lưu">
                          <Save size={16} />
                        </button>
                        {dept.id && (
                          <button onClick={() => handleDeleteDepartment(dept.id!)} className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded" title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {['budget', 'current', 'hiring', 'newHires', 'resignations'].map(field => (
                        <div key={field}>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                            {field === 'budget' ? 'Định biên' : field === 'current' ? 'Hiện hữu' : field === 'hiring' ? 'Cần tuyển' : field === 'newHires' ? 'Tuyển mới' : 'Nghỉ việc'}
                          </label>
                          <input 
                            type="number" 
                            value={(dept as any)[field]} 
                            onChange={(e) => {
                              const newDepts = [...departments];
                              (newDepts[index] as any)[field] = Number(e.target.value);
                              if (field === 'current' || field === 'resignations') {
                                const c = field === 'current' ? Number(e.target.value) : newDepts[index].current;
                                const r = field === 'resignations' ? Number(e.target.value) : newDepts[index].resignations;
                                if (c > 0) newDepts[index].turnoverRate = Number(((r / c) * 100).toFixed(2));
                              }
                              setDepartments(newDepts);
                            }}
                            className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tỷ lệ (%)</label>
                        <input type="number" step="0.01" value={dept.turnoverRate} readOnly className="w-full p-2 border border-gray-100 rounded text-sm bg-gray-100 text-gray-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Trạng thái</label>
                        <select 
                          value={dept.status} 
                          onChange={(e) => {
                            const newDepts = [...departments];
                            newDepts[index].status = e.target.value as any;
                            setDepartments(newDepts);
                          }}
                          className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value=" ổn định">Ổn định</option>
                          <option value="theo dõi">Theo dõi</option>
                          <option value="cảnh báo">Cảnh báo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TRENDS */}
          {activeTab === 'trends' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <div className="mb-6">
                <p className="text-sm text-gray-500">Nhập tỷ lệ nghỉ việc cho các tháng trong biểu đồ xu hướng 6 tháng gần nhất.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 flex flex-col gap-3 relative">
                    <input 
                      type="text" 
                      value={stat.month} 
                      onChange={(e) => {
                        const newStats = [...monthlyStats];
                        newStats[index].month = e.target.value;
                        setMonthlyStats(newStats);
                      }}
                      className="text-sm font-bold text-gray-700 uppercase bg-transparent border-b border-gray-300 outline-none pb-1"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.01"
                        value={stat.rate} 
                        onChange={(e) => {
                          const newStats = [...monthlyStats];
                          newStats[index].rate = Number(e.target.value);
                          setMonthlyStats(newStats);
                        }}
                        className="text-2xl font-black text-blue-600 bg-transparent outline-none w-full"
                      />
                      <span className="text-gray-400 font-bold">%</span>
                    </div>
                    <button 
                       onClick={() => {
                         try {
                           updateLocalStorage((data) => {
                             data.monthlyStats = data.monthlyStats || [];
                             const idx = data.monthlyStats.findIndex((s: any) => s.month === stat.month);
                             if (idx > -1) data.monthlyStats[idx] = stat;
                             else data.monthlyStats.push(stat);
                             return data;
                           });
                           showMessage(`Đã cập nhật ${stat.month}`);
                         } catch(e) {
                           showMessage('Lỗi lưu tháng');
                         }
                       }}
                       className="mt-2 text-xs font-bold text-white bg-blue-600 rounded py-2 hover:bg-blue-700 uppercase transition-colors"
                    >
                      Lưu tháng này
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AGE */}
          {activeTab === 'age' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               <div className="flex justify-end mb-6">
                <button onClick={() => setAgeGroups([...ageGroups, { label: 'Độ tuổi', value: 0, percentage: '0%' }])} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors text-sm">
                  <Plus size={16} /> Thêm nhóm tuổi
                </button>
              </div>
              <div className="space-y-4">
                {ageGroups.map((group, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-4 items-center p-4 border border-gray-100 rounded-lg bg-gray-50">
                     <div className="flex-1 w-full">
                       <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Độ tuổi</label>
                       <input type="text" value={group.label} onChange={(e) => {
                         const n = [...ageGroups]; n[index].label = e.target.value; setAgeGroups(n);
                       }} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" placeholder="VD: ≤ 25 tuổi" />
                     </div>
                     <div className="flex-1 w-full">
                       <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Số lượng</label>
                       <input type="number" value={group.value} onChange={(e) => {
                         const n = [...ageGroups]; n[index].value = Number(e.target.value); setAgeGroups(n);
                       }} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" />
                     </div>
                     <div className="flex-1 w-full">
                       <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tỷ lệ (String)</label>
                       <input type="text" value={group.percentage} onChange={(e) => {
                         const n = [...ageGroups]; n[index].percentage = e.target.value; setAgeGroups(n);
                       }} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" placeholder="VD: 26,2%" />
                     </div>
                     <div className="flex gap-2 mt-4 md:mt-0 items-end">
                        <button onClick={() => handleSaveAgeGroup(group)} className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded mt-4" title="Lưu">
                          <Save size={16} />
                        </button>
                        {group.id && (
                          <button onClick={() => handleDeleteAgeGroup(group.id!)} className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded mt-4" title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ALERTS */}
          {activeTab === 'alerts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ALERTS SECTION */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="font-bold text-[#003366] uppercase">Cảnh báo nhân sự</h3>
                  <button onClick={() => setAlerts([...alerts, { department: 'Bộ phận', message: '', type: 'danger' }])} className="text-green-600 hover:bg-green-50 p-2 rounded">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 space-y-3">
                      <div className="flex gap-4">
                        <input type="text" value={alert.department} onChange={(e) => {
                          const n = [...alerts]; n[index].department = e.target.value; setAlerts(n);
                        }} className="flex-1 p-2 border border-gray-300 rounded text-sm font-bold text-gray-700 outline-none" placeholder="Tên bộ phận" />
                        <select value={alert.type} onChange={(e) => {
                          const n = [...alerts]; n[index].type = e.target.value as any; setAlerts(n);
                        }} className="w-28 p-2 border border-gray-300 rounded text-sm outline-none bg-white">
                          <option value="danger">Đỏ (Nguy)</option>
                          <option value="warning">Vàng (Lưu ý)</option>
                          <option value="success">Xanh (Tốt)</option>
                        </select>
                      </div>
                      <textarea value={alert.message} onChange={(e) => {
                          const n = [...alerts]; n[index].message = e.target.value; setAlerts(n);
                        }} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" placeholder="Nội dung cảnh báo" rows={2} />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSaveAlert(alert)} className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded hover:bg-blue-200">Lưu</button>
                        {alert.id && <button onClick={() => handleDeleteAlert(alert.id!)} className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded hover:bg-red-200">Xóa</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EVALUATIONS SECTION */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <h3 className="font-bold text-[#003366] uppercase">Đánh giá chung</h3>
                  <button onClick={() => setEvaluations([...evaluations, { text: '' }])} className="text-green-600 hover:bg-green-50 p-2 rounded">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  {evaluations.map((ev, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-lg bg-gray-50 space-y-3">
                      <textarea value={ev.text} onChange={(e) => {
                          const n = [...evaluations]; n[index].text = e.target.value; setEvaluations(n);
                        }} className="w-full p-2 border border-gray-300 rounded text-sm outline-none" placeholder="Nội dung đánh giá" rows={3} />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleSaveEvaluation(ev)} className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1.5 rounded hover:bg-blue-200">Lưu</button>
                        {ev.id && <button onClick={() => handleDeleteEvaluation(ev.id!)} className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded hover:bg-red-200">Xóa</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
