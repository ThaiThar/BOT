// src/components/Bas/ui/BattleClash.jsx
import React, { useEffect, useRef, useState } from "react";
import "./BattleClash.css";

import battleStartSound from "../../../assets/sounds/battle_start.wav";
import impactSound from "../../../assets/sounds/impact.wav";
import battleEndSound from "../../../assets/sounds/battle_end.wav";


export default function BattleClash({
  isOpen,
  attackerImg,
  defenderImg,
  onAnimationComplete,
}) {
  const [isShattering, setIsShattering] = useState(false);

  // ใช้ ref เพื่อควบคุมเสียง
  const startAudio = useRef(null);
  const impactAudio = useRef(null);
  const endAudio = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsShattering(false);

      // ▶️ เล่นเสียงเริ่มฉาก
      startAudio.current?.play();

      // 💥 จังหวะชน
      const impactTimer = setTimeout(() => {
        setIsShattering(true);
        impactAudio.current?.play();
      }, 900);

      // ⏹️ จบฉาก
      const closeTimer = setTimeout(() => {
        endAudio.current?.play();
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
      {/* เสียง (ไม่แสดง UI) */}
      <audio ref={startAudio} src={battleStartSound} preload="auto" />
      <audio ref={impactAudio} src={impactSound} preload="auto" />
      <audio ref={endAudio} src={battleEndSound} preload="auto" />

      <div className="vs-text">BATTLE!</div>

      <div className="arena">
        {/* ฝั่งโจมตี */}
        <div
          className="battle-card attacker"
          style={{ backgroundImage: `url(${attackerImg})` }}
        />

        {/* เอฟเฟกต์ชน */}
        <div className="impact-flash"></div>

        {/* ฝั่งป้องกัน */}
        <div
          className={`battle-card defender ${
            isShattering ? "shattered" : ""
          }`}
          style={{ backgroundImage: `url(${defenderImg})` }}
        />
      </div>
    </div>
  );
}
