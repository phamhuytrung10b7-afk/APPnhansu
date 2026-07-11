import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgF00-q1fAXgWV97inCTGDArnb6pkldIo",
  authDomain: "gen-lang-client-0004125405.firebaseapp.com",
  projectId: "gen-lang-client-0004125405",
  storageBucket: "gen-lang-client-0004125405.firebasestorage.app",
  messagingSenderId: "189434766099",
  appId: "1:189434766099:web:3f495e1ed58f38e58770e6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-hrdashboardsyste-1f704629-8e88-4566-b084-d79f7dc1a51d");

const data = [
  {
    monthId: 1,
    stats: {
      month: "Tháng 01 năm 2026", updatedAt: "31/01/2026",
      totalBudget: 85, totalCurrent: 77, totalHiring: 8,
      totalNewHires: 9, totalResignations: 14, totalTurnover: 5.00,
      femaleRate: 33.8, avgAge: 30.9, avgTenure: 1.4
    },
    departments: [
      { id: "c1", name: "Cơ khí", budget: 25, current: 22, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "g1", name: "GT Bình Dương", budget: 20, current: 17, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "l1", name: "Lắp ráp", budget: 35, current: 33, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "t1", name: "Tổng hợp", budget: 5, current: 5, hiring: 0, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" }
    ],
    ages: [
      { id: "a1", label: "<=25 tuổi", value: 17, percentage: "22.1%" },
      { id: "a2", label: "26-35 tuổi", value: 36, percentage: "46.8%" },
      { id: "a3", label: "36-45 tuổi", value: 21, percentage: "27.3%" },
      { id: "a4", label: ">45 tuổi", value: 3, percentage: "3.9%" }
    ]
  },
  {
    monthId: 2,
    stats: {
      month: "Tháng 02 năm 2026", updatedAt: "28/02/2026",
      totalBudget: 95, totalCurrent: 84, totalHiring: 11,
      totalNewHires: 12, totalResignations: 24, totalTurnover: 8.33,
      femaleRate: 31.0, avgAge: 30.9, avgTenure: 1.3
    },
    departments: [
      { id: "c1", name: "Cơ khí", budget: 26, current: 23, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "g1", name: "GT Bình Dương", budget: 22, current: 20, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "l1", name: "Lắp ráp", budget: 40, current: 36, hiring: 4, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "t1", name: "Tổng hợp", budget: 7, current: 5, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" }
    ],
    ages: [
      { id: "a1", label: "<=25 tuổi", value: 19, percentage: "22.6%" },
      { id: "a2", label: "26-35 tuổi", value: 38, percentage: "45.2%" },
      { id: "a3", label: "36-45 tuổi", value: 23, percentage: "27.4%" },
      { id: "a4", label: ">45 tuổi", value: 4, percentage: "4.8%" }
    ]
  },
  {
    monthId: 3,
    stats: {
      month: "Tháng 03 năm 2026", updatedAt: "31/03/2026",
      totalBudget: 110, totalCurrent: 99, totalHiring: 11,
      totalNewHires: 35, totalResignations: 12, totalTurnover: 3.23,
      femaleRate: 29.3, avgAge: 30.9, avgTenure: 1.1
    },
    departments: [
      { id: "c1", name: "Cơ khí", budget: 28, current: 25, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "g1", name: "GT Bình Dương", budget: 22, current: 20, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "l1", name: "Lắp ráp", budget: 53, current: 49, hiring: 4, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "t1", name: "Tổng hợp", budget: 7, current: 5, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" }
    ],
    ages: [
      { id: "a1", label: "<=25 tuổi", value: 28, percentage: "28.3%" },
      { id: "a2", label: "26-35 tuổi", value: 43, percentage: "43.4%" },
      { id: "a3", label: "36-45 tuổi", value: 24, percentage: "24.2%" },
      { id: "a4", label: ">45 tuổi", value: 4, percentage: "4.0%" }
    ]
  },
  {
    monthId: 4,
    stats: {
      month: "Tháng 04 năm 2026", updatedAt: "30/04/2026",
      totalBudget: 125, totalCurrent: 114, totalHiring: 11,
      totalNewHires: 23, totalResignations: 13, totalTurnover: 3.02,
      femaleRate: 28.1, avgAge: 30.9, avgTenure: 1.1
    },
    departments: [
      { id: "c1", name: "Cơ khí", budget: 29, current: 26, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "g1", name: "GT Bình Dương", budget: 26, current: 24, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "l1", name: "Lắp ráp", budget: 63, current: 59, hiring: 4, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "t1", name: "Tổng hợp", budget: 7, current: 5, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" }
    ],
    ages: [
      { id: "a1", label: "<=25 tuổi", value: 34, percentage: "29.8%" },
      { id: "a2", label: "26-35 tuổi", value: 49, percentage: "43.0%" },
      { id: "a3", label: "36-45 tuổi", value: 26, percentage: "22.8%" },
      { id: "a4", label: ">45 tuổi", value: 5, percentage: "4.4%" }
    ]
  },
  {
    monthId: 5,
    stats: {
      month: "Tháng 05 năm 2026", updatedAt: "31/05/2026",
      totalBudget: 150, totalCurrent: 137, totalHiring: 13,
      totalNewHires: 28, totalResignations: 22, totalTurnover: 4.37,
      femaleRate: 25.5, avgAge: 30.9, avgTenure: 1.0
    },
    departments: [
      { id: "c1", name: "Cơ khí", budget: 38, current: 35, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "g1", name: "GT Bình Dương", budget: 30, current: 27, hiring: 3, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "l1", name: "Lắp ráp", budget: 74, current: 69, hiring: 5, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" },
      { id: "t1", name: "Tổng hợp", budget: 8, current: 6, hiring: 2, newHires: 0, resignations: 0, turnoverRate: 0, status: " ổn định" }
    ],
    ages: [
      { id: "a1", label: "<=25 tuổi", value: 37, percentage: "27.0%" },
      { id: "a2", label: "26-35 tuổi", value: 55, percentage: "40.1%" },
      { id: "a3", label: "36-45 tuổi", value: 36, percentage: "26.3%" },
      { id: "a4", label: ">45 tuổi", value: 9, percentage: "6.6%" }
    ]
  },
  {
    monthId: 6,
    stats: {
      month: "Tháng 06 năm 2026", updatedAt: "30/06/2026",
      totalBudget: 165, totalCurrent: 149, totalHiring: 16,
      totalNewHires: 21, totalResignations: 9, totalTurnover: 1.56,
      femaleRate: 24.8, avgAge: 30.9, avgTenure: 1.0
    },
    departments: [
      { id: "c1", name: "Cơ khí", budget: 42, current: 38, hiring: 4, newHires: 5, resignations: 2, turnoverRate: 5.26, status: "theo dõi" },
      { id: "g1", name: "GT Bình Dương", budget: 33, current: 30, hiring: 3, newHires: 3, resignations: 1, turnoverRate: 3.33, status: " ổn định" },
      { id: "l1", name: "Lắp ráp", budget: 82, current: 75, hiring: 7, newHires: 12, resignations: 4, turnoverRate: 5.33, status: "theo dõi" },
      { id: "t1", name: "Tổng hợp", budget: 8, current: 6, hiring: 2, newHires: 1, resignations: 1, turnoverRate: 16.67, status: "cảnh báo" }
    ],
    ages: [
      { id: "a1", label: "<=25 tuổi", value: 39, percentage: "26.2%" },
      { id: "a2", label: "26-35 tuổi", value: 59, percentage: "39.6%" },
      { id: "a3", label: "36-45 tuổi", value: 40, percentage: "26.8%" },
      { id: "a4", label: ">45 tuổi", value: 11, percentage: "7.4%" }
    ]
  }
];

async function seed() {
  console.log("Seeding started...");
  for (const report of data) {
    const docRef = doc(db, 'monthly_reports', `2026_${String(report.monthId).padStart(2, '0')}`);
    await setDoc(docRef, report);
    console.log(`Saved report for month ${report.monthId}`);
  }
  
  // also seed monthly stats for trend charts
  for (const report of data) {
    const statData = {
      month: `T${String(report.monthId).padStart(2, '0')}/2026`,
      rate: report.stats.totalTurnover
    };
    await setDoc(doc(db, 'monthly_stats', `2026_${String(report.monthId).padStart(2, '0')}`), statData);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(console.error);
