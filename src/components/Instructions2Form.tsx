import React from 'react';

export const Instructions2Form: React.FC = () => {
  return (
    <div className="flex justify-center bg-gray-200 p-4 overflow-auto">
      <div className="bg-white p-10 shadow-lg" style={{ width: '1123px', minHeight: '794px', fontFamily: 'Sarabun' }}>
        <div className="text-base leading-relaxed">
          <p className="font-bold text-lg mb-2">การบันทึกการวัดและประเมินผล</p>
          <div className="pl-4 mb-4">
            <p>1) วิธีการกรอกคะแนน</p>
            <div className="pl-4">
              <p>1.1 สำหรับคะแนนวัดผลการเรียนรู้นักเรียนคนใดเมื่อทดสอบแล้วไม่ผ่านเกณฑ์ให้มีการสอนซ่อมเสริม</p>
              <p className="pl-6">ในจุดที่ไม่ผ่านเกณฑ์แล้วให้สอบแก้ตัว คะแนนเดิมที่ได้ใหม่ต้องไม่เกินครึ่งหนึ่งของคะแนนทั้งหมด</p>
              <p>1.2 ให้รวมคะแนนระหว่างภาคเรียนเข้าด้วยกันแล้วเขียนลงในช่องรวมคะแนนระหว่างเรียน</p>
              <p>1.3 เขียนคะแนนสอบปลายภาคเรียนลงในช่องรวมคะแนนสอบปลายภาค</p>
              <p>1.4 รวมคะแนนระหว่างเรียนและรวมคะแนนสอบปลายภาคแล้วนำมาเทียบกับเกณฑ์ที่กำหนดไว้</p>
              <p className="pl-6">เพื่อให้ระดับผลการเรียน</p>
              <p>1.5 นักเรียนที่มีเวลาเรียนไม่ครบ 80% ไม่มีสิทธิ์เข้าสอบปลายภาคให้ได้ "มส"</p>
              <p>1.6 นักเรียนที่มีเวลาเรียนครบ 80% แต่ไม่ได้เข้าสอบปลายภาคหรือผู้ที่ส่งงานไม่ครบให้ได้ผลการเรียนเป็น "ร"</p>
            </div>
            
            <p>2) การกรอกคะแนนผลการเรียนใช้หมึกสีน้ำเงินหรือสีดำ ยกเว้น "0" ,"ร" , " มส" , "มผ" ให้ใช้หมึกสีแดง</p>
            <p>3) หากมีการแก้ไขให้ใช้หมึกสีแดง ขีดฆ่าคำผิด และเขียนคำที่ถูกต้องพร้อมลงชื่อกำกับด้วยหมึกสีแดง</p>
            <p className="pl-4">และให้ใช้อักษรแสดงผลการเรียนที่มีเงื่อนไขในแต่ละรายวิชา ดังนี้</p>
            
            <div className="pl-8 mt-2">
              <div className="flex mb-1">
                <div className="w-16">ร</div>
                <div className="w-24">หมายถึง</div>
                <div>รอการตัดสิน หรือยังตัดสินไม่ได้เนื่องจาก</div>
              </div>
              <div className="flex mb-1">
                <div className="w-16"></div>
                <div className="w-24"></div>
                <div>1. ไม่ส่งงาน</div>
              </div>
              <div className="flex mb-1">
                <div className="w-16"></div>
                <div className="w-24"></div>
                <div>2. ไม่ผ่านการทดสอบตัวชี้วัด/ผลการเรียนรู้</div>
              </div>
              <div className="flex mb-1">
                <div className="w-16">มส</div>
                <div className="w-24">หมายถึง</div>
                <div>เข้าเรียนไม่ครบร้อยละ 80</div>
              </div>
              <div className="flex mb-1">
                <div className="w-16">ผ</div>
                <div className="w-24">หมายถึง</div>
                <div>ผ่านเกณฑ์การประเมิน</div>
              </div>
              <div className="flex mb-1">
                <div className="w-16">มผ</div>
                <div className="w-24">หมายถึง</div>
                <div>ไม่ผ่านเกณฑ์การประเมิน</div>
              </div>
            </div>

            <p className="font-bold mt-4 mb-2 pl-8">ระดับผลการเรียน</p>
            <div className="pl-8 w-2/3">
              <table className="w-full border-collapse border border-black text-center text-sm">
                <thead>
                  <tr>
                    <th className="border border-black py-1 font-normal w-1/3">ระดับผลการเรียน</th>
                    <th className="border border-black py-1 font-normal w-1/3">ความหมาย</th>
                    <th className="border border-black py-1 font-normal w-1/3">ช่วงคะแนนเป็นร้อยละ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black py-1">0</td>
                    <td className="border border-black py-1">ผลการเรียนต่ำกว่าเกณฑ์</td>
                    <td className="border border-black py-1">0 - 49</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">1</td>
                    <td className="border border-black py-1">ผลการเรียนขั้นต่ำ</td>
                    <td className="border border-black py-1">50 - 54</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">1.5</td>
                    <td className="border border-black py-1">ผลการเรียนพอใช้</td>
                    <td className="border border-black py-1">55 - 59</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">2</td>
                    <td className="border border-black py-1">ผลการเรียนน่าพอใจ</td>
                    <td className="border border-black py-1">60 - 64</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">2.5</td>
                    <td className="border border-black py-1">ผลการเรียนค่อนข้างดี</td>
                    <td className="border border-black py-1">65 - 69</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">3</td>
                    <td className="border border-black py-1">ผลการเรียนดี</td>
                    <td className="border border-black py-1">70 - 74</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">3.5</td>
                    <td className="border border-black py-1">ผลการเรียนดีมาก</td>
                    <td className="border border-black py-1">75 - 79</td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1">4</td>
                    <td className="border border-black py-1">ผลการเรียนดีเยี่ยม</td>
                    <td className="border border-black py-1">80 - 100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
