import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFill: (minScore: number, maxScore: number) => void;
}

export const AutoFillAttributesModal: React.FC<Props> = ({ isOpen, onClose, onFill }) => {
  const [minScore, setMinScore] = useState<number>(1);
  const [maxScore, setMaxScore] = useState<number>(3);

  if (!isOpen) return null;

  const handleFill = () => {
    onFill(minScore, maxScore);
    onClose();
  };

  const scores = [0, 1, 2, 3];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">กรอกคะแนนอัตโนมัติ (สุ่ม)</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            เลือกคะแนนต่ำสุดและสูงสุดที่ต้องการ (0-3) ระบบจะทำการสุ่มคะแนนไปยังตัวชี้วัดต่างๆ ให้อัตโนมัติ
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนต่ำสุด</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
              >
                {scores.map(s => (
                  <option key={`min-${s}`} value={s} disabled={s > maxScore}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนสูงสุด</label>
              <select
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                value={maxScore}
                onChange={(e) => setMaxScore(parseInt(e.target.value))}
              >
                {scores.map(s => (
                  <option key={`max-${s}`} value={s} disabled={s < minScore}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-medium transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleFill}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors shadow-md flex items-center gap-2"
          >
            <Sparkles size={18} />
            สุ่มคะแนน
          </button>
        </div>
      </div>
    </div>
  );
};
