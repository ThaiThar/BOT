// src/components/Bas/ui/Dice.jsx
import React, { useEffect, useRef } from "react";
import ReactDice from "react-dice-roll";

export default function Dice({ value, rollId, onClick }) {
  const diceRef = useRef(null);

  // 🔄 ENGINE: สั่งให้ลูกเต๋าหมุน
  useEffect(() => {
    // ป้องกันการทำงานตอนเริ่มโหลดครั้งแรก (ถ้า rollId เป็น 0 หรือค่าเริ่มต้น)
    if (!rollId) return;

    // ⏳ ใส่ Delay เล็กน้อย (50ms) เพื่อให้ Browser เตรียมตัวทัน 
    // ช่วยแก้ปัญหาลูกเต๋า "วาร์ป" หรือไม่ยอมหมุนได้ 100%
    const timer = setTimeout(() => {
      if (diceRef.current) {
        diceRef.current.rollDice(value);
      }
    }, 50);

    return () => clearTimeout(timer);

  }, [rollId]); // ❌ เอา value ออก! ให้ทำงานเมื่อ rollId (เวลา) เปลี่ยนเท่านั้น

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1000,
        cursor: "pointer",
        // เพิ่มเงาให้ดูลอยขึ้นและสมจริง
        filter: "drop-shadow(0px 8px 10px rgba(0,0,0,0.3))" 
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title="คลิกเพื่อทอย"
    >
      <div style={{ pointerEvents: 'none' }}>
        <ReactDice
          ref={diceRef}
          defaultValue={1} // ค่าเริ่มต้นตอนโหลดหน้าเว็บ
          size={80}
          faceBg="#ffffff"
          rollingTime={800} // ปรับเวลาหมุนให้กระชับขึ้น (800ms กำลังดี)
          sound={false}
          disableIndividual={true} // ปิดการกดที่ตัว Library เอง (สำคัญ)
          triggers={['Enter', 'a']}
        />
      </div>
    </div>
  );
}