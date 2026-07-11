import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, Evaluation } from './types';

export const PersonnelAlerts = ({ alerts }: { alerts: Alert[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 h-full">
      <div className="bg-[#CC3333] text-white py-3 px-4 flex items-center gap-2 font-bold uppercase text-sm">
        <AlertCircle size={18} />
        CẢNH BÁO NHÂN SỰ
      </div>
      <div className="p-4 space-y-4">
        {alerts.map((alert, idx) => (
          <div key={idx} className="flex gap-3">
            <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
              alert.type === 'danger' ? 'bg-red-500' :
              alert.type === 'warning' ? 'bg-yellow-400' : 'bg-green-500'
            }`} />
            <div className="text-xs">
              <span className="font-bold">{alert.department}</span>
              <p className="text-gray-600">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GeneralEvaluation = ({ evaluations }: { evaluations: Evaluation[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
      <div className="bg-[#2E7D32] text-white py-3 px-4 flex items-center gap-2 font-bold uppercase text-sm">
        <CheckCircle size={18} />
        ĐÁNH GIÁ CHUNG
      </div>
      <div className="p-4 space-y-3">
        {evaluations.map((evalItem, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="p-0.5 bg-green-100 rounded-full text-green-600 mt-0.5 flex-shrink-0">
              <CheckCircle size={14} />
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">{evalItem.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
