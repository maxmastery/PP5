import React, { useEffect } from 'react';
import { AppData } from '../types';

interface Props {
  data: AppData['generalInfo'];
  appData: AppData;
  onChange: (data: AppData['generalInfo']) => void;
}

const TEACHERS = [
  'นางภัทราวดี พิณะเวศน์',
  'นางสาวพรนิภา สว่างศรี',
  'นางประนอมจิตร หอมบุญ',
  'นายศักรินทร์ สวัสดิ์เอื้อ',
  'นายวสันต์ วอแพง',
  'นายทนงเดช วงษ์ประจันต์',
  'นายธนิท ธนพัตนิรัชกุล',
  'ว่าที่ร้อยตรีหญิงอารียา แสงดี',
  'นายชินวัตร แก้วกาหนัน',
  'นายธนัชกร มูลมี'
];

const LEARNING_AREAS = [
  'ภาษาไทย',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และเทคโนโลยี',
  'สังคมศึกษา ศาสนา และวัฒนธรรม',
  'สุขศึกษาและพลศึกษา',
  'ศิลปะ',
  'ภาษาต่างประเทศ',
  'การงานอาชีพ'
];

const SUBJECTS_MAP: Record<string, string[]> = {
  'ภาษาไทย': ['ภาษาไทยพื้นฐาน', 'ภาษาไทยเพิ่มเติม'],
  'คณิตศาสตร์': ['คณิตศาสตร์พื้นฐาน', 'คณิตศาสตร์เพิ่มเติม'],
  'วิทยาศาสตร์และเทคโนโลยี': ['วิทยาศาสตร์พื้นฐาน', 'วิทยาการคำนวณ', 'การออกแบบและเทคโนโลยี', 'สวนพฤกษศาสตร์'],
  'สังคมศึกษา ศาสนา และวัฒนธรรม': ['สังคมศึกษา', 'ประวัติศาสตร์', 'หน้าที่พลเมือง'],
  'สุขศึกษาและพลศึกษา': ['สุขศึกษา', 'พลศึกษา'],
  'ศิลปะ': ['ทัศนศิลป์', 'ดนตรี', 'นาฏศิลป์'],
  'ภาษาต่างประเทศ': ['ภาษาอังกฤษพื้นฐาน', 'ภาษาอังกฤษเพิ่มเติม'],
  'การงานอาชีพ': ['การงานอาชีพ', 'พื้นฐานอาชีพ']
};

export const GeneralInfoForm: React.FC<Props> = ({ data, appData, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newData = { ...data, [name]: value };

    if (name === 'totalHours') {
      const hours = parseFloat(value) || 0;
      newData.hoursPerSemester = (hours * 20).toString();
    }

    if (name === 'learningArea') {
      newData.subjectName = SUBJECTS_MAP[value]?.[0] || '';
    }

    if (name === 'homeroomTeacher1' || name === 'homeroomTeacher2') {
      newData.homeroomTeachers = `1. ${newData.homeroomTeacher1} 2. ${newData.homeroomTeacher2}`;
    }

    // Auto update head of learning area
    if (name === 'learningArea' || name === 'subjectName') {
      const area = name === 'learningArea' ? value : newData.learningArea;
      const subject = name === 'subjectName' ? value : newData.subjectName;
      
      let head = '';
      switch (area) {
        case 'ภาษาไทย': head = 'นางสาวพรชิตา ภูแสงสั่น'; break;
        case 'คณิตศาสตร์': head = 'นางสาวราตรี ภูจอมแก้ว'; break;
        case 'วิทยาศาสตร์และเทคโนโลยี': 
          head = subject === 'สวนพฤกษศาสตร์' ? 'นางสาวพิรยา คำปัน' : 'นางสาววันวิสา พลหมอ'; 
          break;
        case 'สังคมศึกษา ศาสนา และวัฒนธรรม': head = 'นายบุญเลิศ อังคเนตร'; break;
        case 'สุขศึกษาและพลศึกษา': head = 'นายทนงเดช วงษ์ประจันต์'; break;
        case 'ศิลปะ': head = 'นายวสันต์ วอแพง'; break;
        case 'ภาษาต่างประเทศ': head = 'นางสาวพรนิภา สว่างศรี'; break;
        case 'การงานอาชีพ': head = 'นางสาวสุภาพร ญาณประเสริฐ'; break;
      }
      newData.headOfLearningArea = head;
    }

    onChange(newData);
  };

  const years = Array.from({ length: 10 }, (_, i) => (2565 + i).toString());

  const getAvg = (keys: string[], attrs: any) => {
    let sum = 0;
    let count = 0;
    keys.forEach(k => {
      if (attrs[k] !== undefined && attrs[k] !== '') {
        sum += Number(attrs[k]);
        count++;
      }
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };

  const summary = {
    totalStudents: appData.students.length,
    grades: {
      '4': 0, '3.5': 0, '3': 0, '2.5': 0, '2': 0, '1.5': 0, '1': 0, '0': 0,
      'ผ': 0, 'มผ': 0
    },
    analytical: {
      '3': 0, '2': 0, '1': 0, '0': 0
    },
    attributes: {
      '3': 0, '2': 0, '1': 0, '0': 0
    }
  };

  appData.students.forEach(student => {
    // 1. Grades
    const score = appData.scores[student.id] || {};
    let totalBetweenTerm = 0;
    if (appData.scoreConfig?.units) {
      appData.scoreConfig.units.forEach((u, uIdx) => {
        u.indicators.forEach((ind, iIdx) => {
          if (ind) {
            totalBetweenTerm += Number(score[`u${uIdx}_i${iIdx}`]) || 0;
          }
        });
      });
    } else {
      Object.keys(score).forEach(key => {
        if (key.startsWith('u') && key.includes('_i')) {
          totalBetweenTerm += Number(score[key]) || 0;
        }
      });
    }
    const midterm = Number(score.midterm) || 0;
    const final = Number(score.final) || 0;
    const totalScore = totalBetweenTerm + midterm + final;

    let grade = '0';
    if (totalScore >= 80) grade = '4';
    else if (totalScore >= 75) grade = '3.5';
    else if (totalScore >= 70) grade = '3';
    else if (totalScore >= 65) grade = '2.5';
    else if (totalScore >= 60) grade = '2';
    else if (totalScore >= 55) grade = '1.5';
    else if (totalScore >= 50) grade = '1';
    
    summary.grades[grade as keyof typeof summary.grades]++;
    
    if (totalScore >= 50) summary.grades['ผ']++;
    else summary.grades['มผ']++;

    // 2. Analytical
    const anal = appData.analytical[student.id] || {};
    const avgAnal = getAvg(['attr1', 'attr2', 'attr3', 'attr4', 'attr5', 'attr6', 'attr7'], anal);
    summary.analytical[avgAnal.toString() as keyof typeof summary.analytical]++;

    // 3. Attributes
    const attr = appData.attributes[student.id] || {};
    const avg1 = getAvg(['attr1_1', 'attr1_2', 'attr1_3', 'attr1_4'], attr);
    const avg2 = getAvg(['attr2_1', 'attr2_2'], attr);
    const avg3 = getAvg(['attr3_1', 'attr3_2'], attr);
    const avg4 = getAvg(['attr4_1', 'attr4_2'], attr);
    const avg5 = getAvg(['attr5_1', 'attr5_2'], attr);
    const avg6 = getAvg(['attr6_1', 'attr6_2'], attr);
    const avg7 = getAvg(['attr7_1', 'attr7_2', 'attr7_3'], attr);
    const avg8 = getAvg(['attr8_1', 'attr8_2'], attr);
    const totalAvgAttr = Math.round((avg1 + avg2 + avg3 + avg4 + avg5 + avg6 + avg7 + avg8) / 8);
    summary.attributes[totalAvgAttr.toString() as keyof typeof summary.attributes]++;
  });

  const getPercent = (count: number) => {
    if (summary.totalStudents === 0) return '0';
    return Math.round((count / summary.totalStudents) * 100).toString();
  };

  return (
    <div className="flex justify-center bg-gray-200 p-4 overflow-auto">
      <div className="bg-white p-8 shadow-lg relative text-sm" style={{ width: '794px', minHeight: '1123px', fontFamily: 'Sarabun' }}>
        <div className="absolute top-8 right-8 font-bold text-sm">ปพ. 5</div>
        
        <div className="flex justify-center mb-2">
          <img 
            src="https://lh3.googleusercontent.com/d/1q7khh5EObPknl-bCuZPJo7n4t2-iD_OC" 
            alt="School Logo" 
            className="h-24 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('via.placeholder.com')) {
                target.src = 'https://via.placeholder.com/100?text=Logo';
              }
            }}
          />
        </div>

        <div className="text-center font-bold text-sm">แบบบันทึกผลการเรียนรายวิชา</div>
        <div className="text-center font-bold text-sm">ตามหลักสูตรแกนกลางการศึกษาขั้นพื้นฐาน พุทธศักราช 2551</div>
        <div className="text-center font-bold text-sm">โรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</div>
        <div className="text-center font-bold text-sm mb-4">สำนักบริหารงานการศึกษาพิเศษ</div>

        <div className="flex justify-center items-center gap-2 mb-2">
          <span>ชั้นมัธยมศึกษาปีที่</span>
          <select name="gradeLevel" value={data.gradeLevel} onChange={handleChange} className="bg-yellow-excel border-b border-black w-20 text-center outline-none cursor-pointer">
            {['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'].flatMap(grade => 
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(room => `${grade}/${room}`)
            ).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <span>ภาคเรียนที่</span>
          <select name="semester" value={data.semester} onChange={handleChange} className="bg-yellow-excel border-b border-black w-16 text-center outline-none cursor-pointer">
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
          <span>ปีการศึกษา</span>
          <select name="academicYear" value={data.academicYear} onChange={handleChange} className="border-b border-black w-20 text-center outline-none cursor-pointer">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex justify-center items-center gap-2 mb-2 whitespace-nowrap">
          <div className="flex items-center gap-1">
            <span>รหัสวิชา</span>
            <input type="text" name="subjectCode" value={data.subjectCode} onChange={handleChange} className="bg-yellow-excel border-b border-black w-16 text-center outline-none" />
          </div>
          <div className="flex items-center gap-1">
            <span>รายวิชา</span>
            <select name="subjectName" value={data.subjectName} onChange={handleChange} className="bg-yellow-excel border-b border-black w-40 text-center outline-none cursor-pointer">
              {(SUBJECTS_MAP[data.learningArea] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span>กลุ่มสาระการเรียนรู้</span>
            <select name="learningArea" value={data.learningArea} onChange={handleChange} className="bg-yellow-excel border-b border-black w-56 text-center outline-none cursor-pointer">
              {LEARNING_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 mb-2">
          <span>รวมเวลาเรียน</span>
          <input type="number" name="totalHours" value={data.totalHours} onChange={handleChange} className="bg-yellow-excel border-b border-black w-12 text-center outline-none" />
          <span>ชั่วโมง/สัปดาห์</span>
          <input type="text" readOnly value={data.hoursPerSemester} className="border-b border-black w-12 text-center outline-none bg-gray-50" />
          <span>ชั่วโมง/ภาคเรียน</span>
        </div>

        <div className="flex justify-center items-center gap-2 mb-2">
          <span>ครูผู้สอน 1.</span>
          <select name="teacherName" value={data.teacherName} onChange={handleChange} className="bg-yellow-excel border-b border-black w-48 text-center outline-none cursor-pointer">
            {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span>2.</span>
          <select name="teacherName2" value={data.teacherName2 || ''} onChange={handleChange} className="bg-yellow-excel border-b border-black w-48 text-center outline-none cursor-pointer">
            <option value="">-- ไม่ระบุ --</option>
            {TEACHERS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex justify-center items-center gap-2 mb-4">
          <span>ครูประจำชั้น 1.</span>
          <select name="homeroomTeacher1" value={data.homeroomTeacher1} onChange={handleChange} className="border-b border-black w-48 text-center outline-none cursor-pointer">
            {TEACHERS.map(t => <option key={t} value={t} disabled={t === data.homeroomTeacher2}>{t}</option>)}
          </select>
          <span>2.</span>
          <select name="homeroomTeacher2" value={data.homeroomTeacher2} onChange={handleChange} className="border-b border-black w-48 text-center outline-none cursor-pointer">
            {TEACHERS.map(t => <option key={t} value={t} disabled={t === data.homeroomTeacher1}>{t}</option>)}
          </select>
        </div>

        {/* Summary Table */}
        <table className="excel-table mb-4 mx-auto w-[90%] [&_th]:text-[12px] [&_td]:text-[12px] [&_th]:p-1 [&_td]:p-1 [&_tr]:h-10">
          <thead>
            <tr>
              <th rowSpan={3} className="leading-tight">จำนวน<br/>นักเรียน<br/>ทั้งหมด</th>
              <th colSpan={15}>สรุปผลการเรียน</th>
            </tr>
            <tr>
              <th colSpan={8}>จำนวนนักเรียนที่ได้รับระดับผลการเรียน</th>
              <th colSpan={2}>สรุป</th>
              <th rowSpan={2}>รายงานการประเมิน</th>
              <th colSpan={4} className="text-[10px] leading-tight">จำนวนนักเรียนที่ได้รับระดับคุณภาพ</th>
            </tr>
            <tr>
              <th>4</th><th>3.5</th><th>3</th><th>2.5</th><th>2</th><th>1.5</th><th>1</th><th>0</th>
              <th>ผ</th><th>มผ</th>
              <th className="text-[10px] leading-tight">ดีเยี่ยม<br/>(3)</th><th className="text-[10px] leading-tight">ดี<br/>(2)</th><th className="text-[10px] leading-tight">ผ่าน<br/>(1)</th><th className="text-[10px] leading-tight">ไม่ผ่าน<br/>(0)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{summary.totalStudents}</td>
              <td>{summary.grades['4']}</td><td>{summary.grades['3.5']}</td><td>{summary.grades['3']}</td><td>{summary.grades['2.5']}</td><td>{summary.grades['2']}</td><td>{summary.grades['1.5']}</td><td>{summary.grades['1']}</td><td>{summary.grades['0']}</td>
              <td>{summary.grades['ผ']}</td><td>{summary.grades['มผ']}</td>
              <td className="whitespace-nowrap text-[10px]">การอ่านคิดวิเคราะห์และเขียน</td>
              <td>{summary.analytical['3']}</td><td>{summary.analytical['2']}</td><td>{summary.analytical['1']}</td><td>{summary.analytical['0']}</td>
            </tr>
            <tr>
              <td>%</td>
              <td>{getPercent(summary.grades['4'])}</td><td>{getPercent(summary.grades['3.5'])}</td><td>{getPercent(summary.grades['3'])}</td><td>{getPercent(summary.grades['2.5'])}</td><td>{getPercent(summary.grades['2'])}</td><td>{getPercent(summary.grades['1.5'])}</td><td>{getPercent(summary.grades['1'])}</td><td>{getPercent(summary.grades['0'])}</td>
              <td>{summary.grades['ผ']}</td><td>{summary.grades['มผ']}</td>
              <td className="whitespace-nowrap text-[10px]">คุณลักษณะอันพึงประสงค์</td>
              <td>{summary.attributes['3']}</td><td>{summary.attributes['2']}</td><td>{summary.attributes['1']}</td><td>{summary.attributes['0']}</td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div className="px-8 space-y-5">
          <div className="font-bold">การอนุมัติผลการเรียน</div>
          
          <div className="flex items-end justify-center">
            <div className="w-24 text-right pr-2">ลงชื่อ</div>
            <div className="w-56 border-b border-dotted border-black"></div>
            <div className="w-56 pl-2 text-left">ครูผู้สอน</div>
          </div>
          <div className="flex items-center justify-center -mt-4">
            <div className="w-24"></div>
            <div className="w-56 text-center">( {data.teacherName2 ? `1. ${data.teacherName}  2. ${data.teacherName2}` : data.teacherName} )</div>
            <div className="w-56"></div>
          </div>

          <div className="flex items-end justify-center">
            <div className="w-24 text-right pr-2">ลงชื่อ</div>
            <div className="w-56 border-b border-dotted border-black"></div>
            <div className="w-56 pl-2 text-left">หัวหน้ากลุ่มสาระการเรียนรู้</div>
          </div>
          <div className="flex items-center justify-center -mt-4">
            <div className="w-24"></div>
            <div className="w-56 text-center">( {data.headOfLearningArea} )</div>
            <div className="w-56"></div>
          </div>

          <div className="flex items-end justify-center">
            <div className="w-24 text-right pr-2">ลงชื่อ</div>
            <div className="w-56 border-b border-dotted border-black"></div>
            <div className="w-56 pl-2 text-left">หัวหน้างานวัดและประเมินผล</div>
          </div>
          <div className="flex items-center justify-center -mt-4">
            <div className="w-24"></div>
            <div className="w-56 text-center">( {data.headOfEvaluation} )</div>
            <div className="w-56"></div>
          </div>

          <div className="font-bold mt-6">เรียนเสนอเพื่อพิจารณา</div>
          
          <div className="flex items-end justify-center">
            <div className="w-24 text-right pr-2">ลงชื่อ</div>
            <div className="w-56 border-b border-dotted border-black"></div>
            <div className="w-56 pl-2 text-left">รองผู้อำนวยการฝ่ายวิชาการ</div>
          </div>
          <div className="flex items-center justify-center -mt-4">
            <div className="w-24"></div>
            <div className="w-56 text-center">( {data.deputyDirector} )</div>
            <div className="w-56"></div>
          </div>

          <div className="flex justify-center gap-12 my-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 cursor-pointer" /> 
              <span>อนุมัติ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 cursor-pointer" /> 
              <span>ไม่อนุมัติ</span>
            </label>
          </div>

          <div className="flex items-end justify-center">
            <div className="w-24 text-right pr-2">ลงชื่อ</div>
            <div className="w-56 border-b border-dotted border-black"></div>
            <div className="w-56"></div>
          </div>
          <div className="flex items-center justify-center -mt-4">
            <div className="w-24"></div>
            <div className="w-56 text-center">( {data.schoolDirector} )</div>
            <div className="w-56"></div>
          </div>
          <div className="flex items-center justify-center -mt-4">
            <div className="w-24"></div>
            <div className="w-56 text-center whitespace-nowrap">ผู้อำนวยการโรงเรียนกาฬสินธุ์ปัญญานุกูล จังหวัดกาฬสินธุ์</div>
            <div className="w-56"></div>
          </div>
          <div className="flex items-center justify-center -mt-2">
            <div className="w-24"></div>
            <div className="w-56 flex justify-center">
              <input 
                type="date" 
                name="approvalDate"
                value={data.approvalDate}
                onChange={handleChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm outline-none cursor-pointer text-center"
              />
            </div>
            <div className="w-56"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
