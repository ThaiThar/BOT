// src/components/Bas/ui/BattleClash.jsx
import React, { useEffect, useState } from "react";
import "./BattleClash.css";

export default function BattleClash({ isOpen, attackerImg, defenderImg, onAnimationComplete }) {
  const [isShattering, setIsShattering] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // รีเซ็ตสถานะแตก
      setIsShattering(false);

      // จังหวะชน (ประมาณ 0.9 วินาทีหลังจากเริ่มอนิเมชั่น)
      const impactTimer = setTimeout(() => {
        setIsShattering(true);
      }, 900);

      // จังหวะจบ (2.5 วินาที ปิดหน้านี้)
      const closeTimer = setTimeout(() => {
        onAnimationComplete();
      }, 2500);

      return () => {
        clearTimeout(impactTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isOpen, onAnimationComplete]);

  if (!isOpen) return null;

  return (
    <div className="battle-overlay">
      <div className="vs-text">BATTLE!</div>
      
      <div className="arena">
        {/* ฝั่งโจมตี (เรา) */}
        <div 
          className="battle-card attacker" 
          style={{ backgroundImage: `url(${attackerImg})` }}
        ></div>

        {/* จุดระเบิดตรงกลาง */}
        <div className="impact-flash"></div>

        {/* ฝั่งป้องกัน (ศัตรู) - จะแตกเมื่อ isShattering = true */}
        <div 
          className={`battle-card defender ${isShattering ? "shattered" : ""}`} 
          style={{ backgroundImage: `url(${defenderImg})` }}
        ></div>
      </div>
    </div>
  );
}