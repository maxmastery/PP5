import React, { useState, useEffect } from 'react';
import { curriculumData, Standard, Indicator, getAllSubjects, getGradeLevels } from '../data/curriculumData';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  subjectName: string;
  learningArea?: string;
  gradeLevel: string;
  onSelectIndicators: (standardCode: string, indicators: string[]) => void;
}

export const StandardIndicatorFilter: React.FC<Props> = ({ subjectName, learningArea, gradeLevel, onSelectIndicators }) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [isManualMode, setIsManualMode] = useState<boolean>(false);
  const [manualStandard, setManualStandard] = useState<string>('');
  const [manualIndicators, setManualIndicators] = useState<string[]>(['']);

  // Initialize subject and grade from props
  useEffect(() => {
    // Try to find a matching subject in our database that has M.3 data
    const allSubjects = getAllSubjects().filter(sub => getGradeLevels(sub).includes('ม.3'));
    
    let matchedSubject = allSubjects.find(s => subjectName.includes(s) || s.includes(subjectName));
    
    if (!matchedSubject && learningArea) {
      matchedSubject = allSubjects.find(s => learningArea.includes(s) || s.includes(learningArea));
    }
    
    // Fallback matching for common subjects
    if (!matchedSubject) {
      const searchStr = `${subjectName} ${learningArea || ''}`.toLowerCase();
      if (searchStr.includes('คณิต')) matchedSubject = 'คณิตศาสตร์';
      else if (searchStr.includes('วิทย์') || searchStr.includes('เทคโนโลยี')) matchedSubject = 'วิทยาศาสตร์และเทคโนโลยี';
      else if (searchStr.includes('ไทย')) matchedSubject = 'ภาษาไทย';
      else if (searchStr.includes('อังกฤษ') || searchStr.includes('ต่างประเทศ')) matchedSubject = 'ภาษาต่างประเทศ';
      else if (searchStr.includes('สังคม') || searchStr.includes('ประวัติ') || searchStr.includes('พระพุทธ')) matchedSubject = 'สังคมศึกษา ศาสนา และวัฒนธรรม';
      else if (searchStr.includes('สุข') || searchStr.includes('พละ')) matchedSubject = 'สุขศึกษาและพลศึกษา';
      else if (searchStr.includes('ศิลปะ') || searchStr.includes('ทัศนศิลป์') || searchStr.includes('ดนตรี') || searchStr.includes('นาฏศิลป์')) matchedSubject = 'ศิลปะ';
      else if (searchStr.includes('การงาน') || searchStr.includes('อาชีพ')) matchedSubject = 'การงานอาชีพ';
    }
    
    if (matchedSubject) {
      setSelectedSubject(matchedSubject);
      setSelectedGrade('ม.3');
      setIsManualMode(false);
    } else {
      // If no match, default to first available subject to prevent empty state
      if (allSubjects.length > 0) {
        setSelectedSubject(allSubjects[0]);
        setSelectedGrade('ม.3');
      }
      setIsManualMode(true); // Default to manual if their exact subject isn't found
    }
  }, [subjectName, learningArea, gradeLevel]);

  // Find the curriculum data for the currently selected subject and grade
  const curriculum = curriculumData.find(c => 
    c.subject === selectedSubject && c.gradeLevel === selectedGrade
  );

  const standards = curriculum?.standards || [];

  const handleStandardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stdCode = e.target.value;
    setSelectedStandard(stdCode);
    setSelectedIndicators([]); // Reset indicators when standard changes
  };

  const handleIndicatorToggle = (indCode: string) => {
    setSelectedIndicators(prev => {
      const newSelection = prev.includes(indCode)
        ? prev.filter(code => code !== indCode)
        : [...prev, indCode];
      return newSelection;
    });
  };

  const handleSelectAll = (standard: Standard) => {
    const allCodes = standard.indicators.map(ind => ind.code);
    setSelectedIndicators(allCodes);
  };

  const handleDeselectAll = () => {
    setSelectedIndicators([]);
  };

  const handleAddManualIndicator = () => {
    setManualIndicators(prev => [...prev, '']);
  };

  const handleRemoveManualIndicator = (index: number) => {
    setManualIndicators(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualIndicatorChange = (index: number, value: string) => {
    setManualIndicators(prev => {
      const newInds = [...prev];
      newInds[index] = value;
      return newInds;
    });
  };

  useEffect(() => {
    if (isManualMode) {
      const validIndicators = manualIndicators.filter(i => i.trim() !== '');
      if (manualStandard && validIndicators.length > 0) {
        onSelectIndicators(manualStandard, validIndicators);
      }
    } else {
      if (selectedStandard && selectedIndicators.length > 0) {
        onSelectIndicators(selectedStandard, selectedIndicators);
      }
    }
  }, [selectedStandard, selectedIndicators, isManualMode, manualStandard, manualIndicators, onSelectIndicators]);

  const currentStandard = standards.find(s => s.code === selectedStandard);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-5">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h3 className="font-bold text-gray-800">มาตรฐานการเรียนรู้และตัวชี้วัด</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">โหมดการกรอก:</span>
          <button
            onClick={() => setIsManualMode(false)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${!isManualMode ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            เลือกจากฐานข้อมูล
          </button>
          <button
            onClick={() => setIsManualMode(true)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${isManualMode ? 'bg-indigo-100 text-indigo-700 font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            กรอกเอง
          </button>
        </div>
      </div>
      
      {!isManualMode ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ระดับชั้น</label>
              <input 
                type="text"
                value="ม.3" 
                readOnly
                className="w-full border border-gray-300 rounded-md p-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
          </div>
          
          {curriculum ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">มาตรฐานการเรียนรู้</label>
                <select 
                  value={selectedStandard} 
                  onChange={handleStandardChange}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                >
                  <option value="">-- เลือกมาตรฐานการเรียนรู้ --</option>
                  {standards.map(std => (
                    <option key={std.code} value={std.code}>
                      {std.code} {std.description.substring(0, 80)}{std.description.length > 80 ? '...' : ''}
                    </option>
                  ))}
                </select>
                {currentStandard && (
                  <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100">{currentStandard.description}</p>
                )}
              </div>

              {currentStandard && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">ตัวชี้วัดที่ต้องการประเมิน</label>
                    <div className="space-x-3">
                      <button 
                        onClick={() => handleSelectAll(currentStandard)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        เลือกทั้งหมด
                      </button>
                      <button 
                        onClick={handleDeselectAll}
                        className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-white custom-scrollbar">
                    {currentStandard.indicators.map(ind => (
                      <label key={ind.code} className="flex items-start space-x-3 cursor-pointer p-2 hover:bg-indigo-50/50 rounded-md transition-colors border border-transparent hover:border-indigo-100">
                        <input 
                          type="checkbox" 
                          checked={selectedIndicators.includes(ind.code)}
                          onChange={() => handleIndicatorToggle(ind.code)}
                          className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          <span className="font-bold text-indigo-900">{ind.code}</span> {selectedSubject !== 'พื้นฐานอาชีพ' && ind.description}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm text-center">
              ไม่พบข้อมูลมาตรฐานการเรียนรู้สำหรับวิชาและระดับชั้นที่เลือก
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสมาตรฐานการเรียนรู้</label>
            <input 
              type="text" 
              value={manualStandard}
              onChange={(e) => setManualStandard(e.target.value)}
              placeholder="เช่น ค 1.1"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">รหัสตัวชี้วัด</label>
              <button 
                onClick={handleAddManualIndicator}
                className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Plus size={14} className="mr-1" /> เพิ่มตัวชี้วัด
              </button>
            </div>
            <div className="space-y-2">
              {manualIndicators.map((ind, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={ind}
                    onChange={(e) => handleManualIndicatorChange(idx, e.target.value)}
                    placeholder={`ตัวชี้วัดที่ ${idx + 1} เช่น ค 1.1 ป.1/1`}
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {manualIndicators.length > 1 && (
                    <button 
                      onClick={() => handleRemoveManualIndicator(idx)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
