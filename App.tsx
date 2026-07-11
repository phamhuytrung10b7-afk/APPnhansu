/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from 'react';
import { GlobalStats, Department, MonthlyStat, AgeGroup, Alert, Evaluation } from './types';
import { KpiCards } from './KpiCards';
import { GaugeChart } from './GaugeChart';
import { DepartmentTable } from './DepartmentTable';
import { PersonnelAlerts, GeneralEvaluation } from './SidePanels';
import { PersonnelStructureChart, AgeStructureChart, TurnoverTrendChart } from './Charts';
import { Users, Settings as SettingsIcon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DataEntry } from './DataEntry';
import * as XLSX from 'xlsx';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const MOCK_STATS: GlobalStats = {
  month: "Tháng 06 năm 2026",
  updatedAt: "30/06/2026",
  totalBudget: 165,
  totalCurrent: 149,
  totalHiring: 16,
  totalNewHires: 21,
  totalResignations: 8,
  totalTurnover: 1.38
};

const MOCK_DEPARTMENTS: Department[] = [
  { name: "GT Bình Dương", budget: 33, current: 30, hiring: 3, newHires: 3, resignations: 1, turnoverRate: 3.33, status: ' ổn định' },
  { name: "Lắp ráp", budget: 82, current: 75, hiring: 7, newHires: 12, resignations: 4, turnoverRate: 5.33, status: 'theo dõi' },
  { name: "Cơ khí", budget: 42, current: 38, hiring: 4, newHires: 5, resignations: 2, turnoverRate: 5.26, status: 'theo dõi' },
  { name: "Tổng hợp", budget: 8, current: 6, hiring: 2, newHires: 1, resignations: 1, turnoverRate: 16.67, status: 'cảnh báo' },
];

const MOCK_MONTHLY: MonthlyStat[] = [
  { month: "T01/2026", rate: 1.12 },
  { month: "T02/2026", rate: 1.45 },
  { month: "T03/2026", rate: 1.21 },
  { month: "T04/2026", rate: 1.68 },
  { month: "T05/2026", rate: 1.63 },
  { month: "T06/2026", rate: 1.38 },
];

const MOCK_AGE: AgeGroup[] = [
  { id: '1', label: '≤ 25 tuổi', value: 39, percentage: '26,2%' },
  { id: '2', label: '26 - 35 tuổi', value: 59, percentage: '39,6%' },
  { id: '3', label: '36 - 45 tuổi', value: 40, percentage: '26,8%' },
  { id: '4', label: '> 45 tuổi', value: 11, percentage: '7,4%' },
];

const MOCK_ALERTS: Alert[] = [
  { id: '1', department: 'Bộ phận TỔNG HỢP', message: 'Tỷ lệ nghỉ việc 16,67%, vượt ngưỡng cảnh báo (≥ 5%).', type: 'danger' },
  { id: '2', department: 'Bộ phận LẮP RÁP', message: 'Còn thiếu 07 nhân sự so với định biên.', type: 'warning' },
  { id: '3', department: 'Bộ phận GT BÌNH DƯƠNG', message: 'Nhân sự ổn định.', type: 'success' },
];

const MOCK_EVALS: Evaluation[] = [
  { id: '1', text: "Nhân sự hiện hữu đạt 90,3% so với định biên." },
  { id: '2', text: "Tuyển mới 21 nhân sự trong tháng 06." },
  { id: '3', text: "Có 08 nhân sự nghỉ việc trong tháng 06." },
  { id: '4', text: "Tỷ lệ nghỉ việc toàn công ty 1,38%, trong ngưỡng kiểm soát." },
  { id: '5', text: "Cần ưu tiên tuyển bổ sung cho bộ phận LẮP RÁP." }
];

export default function App() {
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(6); // Default to month 6 based on previous data
  
  const [stats, setStats] = useState<GlobalStats>(MOCK_STATS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>(MOCK_MONTHLY);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(MOCK_AGE);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(MOCK_EVALS);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const fetchData = async (monthIndex: number) => {
    setLoading(true);
    try {
      const monthStr = String(monthIndex).padStart(2, '0');
      const docId = `2026_${monthStr}`;
      
      const rawData = localStorage.getItem('hr_dashboard_data');
      if (rawData) {
        const parsedData = JSON.parse(rawData);
        
        // Since we previously used month-specific reports, we simulate it here
        // However, standard local storage just keeps global state. 
        // We'll map the current data.
        
        const reportData = parsedData.reports && parsedData.reports[docId] ? parsedData.reports[docId] : null;
        
        if (reportData) {
          setStats(reportData.stats || parsedData.stats || MOCK_STATS);
          setDepartments(reportData.departments || parsedData.departments || []);
          setAgeGroups(reportData.ages || parsedData.ageGroups || []);
        } else {
          setStats({
            ...(parsedData.stats || MOCK_STATS),
            month: `Tháng ${monthStr} năm 2026`
          });
          setDepartments(parsedData.departments || []);
          setAgeGroups(parsedData.ageGroups || []);
        }

        setMonthlyStats(parsedData.monthlyStats || MOCK_MONTHLY);
        setAlerts(parsedData.alerts || MOCK_ALERTS);
        setEvaluations(parsedData.evaluations || MOCK_EVALS);
      }
    } catch (error) {
      console.error("Error fetching data from local storage:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const handleExportExcel = async () => {
    if (!dashboardRef.current) return;
    setIsExportingPDF(true); // Using this to show a loading state for the buttons
    
    try {
      const workbook = new ExcelJS.Workbook();
      
      // 1. Dashboard Image Sheet
      const imgData = await htmlToImage.toPng(dashboardRef.current, { 
        backgroundColor: '#F0F4F8', 
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      
      const imageId = workbook.addImage({
        base64: imgData,
        extension: 'png',
      });
      
      const wsDashboard = workbook.addWorksheet('Dashboard', { views: [{ showGridLines: false }] });
      
      // Calculate dimensions in Excel units (roughly).
      // Excel row height ~15 points, column width ~8 characters.
      // We will place the image covering A1:U50 depending on aspect ratio.
      const width = dashboardRef.current.offsetWidth * 2;
      const height = dashboardRef.current.offsetHeight * 2;
      
      wsDashboard.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: width / 2.5, height: height / 2.5 }
      });

      // Helper function to add data sheets
      const addDataSheet = (name: string, data: any[][]) => {
        const ws = workbook.addWorksheet(name);
        ws.addRows(data);
        // Style header row
        ws.getRow(1).font = { bold: true };
      };

      // 2. Global Stats
      const globalStatsData = [
        ['Tháng', stats.month],
        ['Ngày cập nhật', stats.updatedAt],
        ['Tổng định biên', stats.totalBudget],
        ['Tổng hiện hữu', stats.totalCurrent],
        ['Tổng cần tuyển', stats.totalHiring],
        ['Tổng tuyển mới', stats.totalNewHires],
        ['Tổng nghỉ việc', stats.totalResignations],
        ['Tỷ lệ nghỉ việc (%)', stats.totalTurnover],
        ['Tỷ lệ nữ (%)', stats.femaleRate],
        ['Độ tuổi trung bình', stats.avgAge],
        ['TB thời gian gắn bó (năm)', stats.avgTenure]
      ];
      addDataSheet('Tổng quan', globalStatsData);

      // 3. Departments
      const deptData = [
        ['Bộ phận', 'Định biên', 'Hiện hữu', 'Cần tuyển', 'Tuyển mới', 'Nghỉ việc', 'Tỷ lệ nghỉ việc (%)', 'Trạng thái'],
        ...departments.map(d => [d.name, d.budget, d.current, d.hiring, d.newHires, d.resignations, d.turnoverRate, d.status])
      ];
      addDataSheet('Bộ phận', deptData);

      // 4. Trends
      const trendsData = [
        ['Tháng', 'Tỷ lệ nghỉ việc (%)'],
        ...monthlyStats.map(s => [s.month, s.rate])
      ];
      addDataSheet('Xu hướng', trendsData);

      // 5. Age Groups
      const ageData = [
        ['Độ tuổi', 'Số lượng', 'Tỷ lệ'],
        ...ageGroups.map(a => [a.label, a.value, a.percentage])
      ];
      addDataSheet('Độ tuổi', ageData);

      // 6. Alerts & Evals
      const alertData = [
        ['Cảnh báo nhân sự', '', ''],
        ['Bộ phận', 'Nội dung', 'Mức độ'],
        ...alerts.map(a => [a.department, a.message, a.type === 'danger' ? 'Đỏ' : a.type === 'warning' ? 'Vàng' : 'Xanh']),
        ['', '', ''],
        ['Đánh giá chung', '', ''],
        ['Nội dung', '', ''],
        ...evaluations.map(e => [e.text, '', ''])
      ];
      addDataSheet('Cảnh báo và Đánh giá', alertData);

      // Save
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `HR_OVERVIEW_DASHBOARD_Thang_${String(selectedMonth).padStart(2, '0')}_2026.xlsx`);

    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử bấm nút 'Open in new tab' (biểu tượng mở ở góc phải trên cùng bên ngoài thanh công cụ) và tải lại.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExportingPDF(true);
    try {
      const width = dashboardRef.current.offsetWidth * 2;
      const height = dashboardRef.current.offsetHeight * 2;
      
      const imgData = await htmlToImage.toPng(dashboardRef.current, { 
        backgroundColor: '#F0F4F8', 
        pixelRatio: 2,
        filter: (node) => {
          if (node instanceof HTMLElement) {
            return !node.hasAttribute('data-html2canvas-ignore');
          }
          return true;
        }
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (height * pdfWidth) / width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`HR_OVERVIEW_DASHBOARD_Thang_${String(selectedMonth).padStart(2, '0')}_2026.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử bấm nút 'Open in new tab' (biểu tượng mở ở góc phải trên cùng bên ngoài thanh công cụ) và tải lại.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (view === 'admin') {
    return (
      <DataEntry 
        onBack={() => {
          setView('dashboard');
          fetchData(selectedMonth); // Refresh data when coming back
        }}
        initialStats={stats}
        initialDepartments={departments}
        initialMonthlyStats={monthlyStats}
        initialAgeGroups={ageGroups}
        initialAlerts={alerts}
        initialEvaluations={evaluations}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] font-sans text-gray-900 p-4 md:p-6" ref={dashboardRef}>
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6 relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-[#003366] uppercase tracking-tighter">
                BÁO CÁO ĐIỀU HÀNH NHÂN SỰ
              </h1>
              <div className="flex items-center text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                THÁNG 
                <select 
                  className="mx-1 bg-transparent border border-gray-300 rounded px-2 py-0.5 text-[#003366] focus:outline-none focus:border-blue-600 cursor-pointer hover:bg-gray-50 transition-colors"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(Number(e.target.value));
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
                NĂM {new Date().getFullYear()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-400 uppercase">Ngày cập nhật: {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
            </div>
            {!isExportingPDF && (
              <div className="flex items-center gap-2" data-html2canvas-ignore>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                  className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-red-500 hover:text-red-600 hover:border-red-300 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  title="Xuất file PDF"
                >
                  <span className="font-bold text-sm">PDF</span>
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-green-600 hover:border-green-300 transition-all shadow-sm flex items-center justify-center gap-2"
                  title="Xuất file Excel"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setView('admin')}
                  className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm ml-2"
                  title="Quản lý dữ liệu"
                >
                  <SettingsIcon size={20} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key="dashboard-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Top Section: KPIs & Gauge */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3">
                <KpiCards stats={stats} selectedMonth={selectedMonth} />
              </div>
              <div className="lg:col-span-1">
                <GaugeChart 
                  percentage={Number(((stats.totalCurrent / stats.totalBudget) * 100).toFixed(1))}
                  numerator={stats.totalCurrent}
                  denominator={stats.totalBudget}
                />
              </div>
            </motion.section>

            {/* Middle Section: Table & Alerts */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3">
                <DepartmentTable departments={departments} selectedMonth={selectedMonth} />
              </div>
              <div className="lg:col-span-1">
                <PersonnelAlerts alerts={alerts} />
              </div>
            </motion.section>

            {/* Bottom Section: Charts & Evaluation */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-1">
                <PersonnelStructureChart departments={departments} />
              </div>
              <div className="lg:col-span-1">
                <AgeStructureChart ageData={ageGroups} />
              </div>
              <div className="lg:col-span-1">
                <TurnoverTrendChart stats={monthlyStats} />
              </div>
              <div className="lg:col-span-1">
                <GeneralEvaluation evaluations={evaluations} />
              </div>
            </motion.section>
          </motion.div>
        </AnimatePresence>

        {/* Footer info (optional) */}
        <footer className="pt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Hệ thống Quản trị Nhân sự Sunhouse • Bản quyền 2026
        </footer>
      </div>
    </div>
  );
}
