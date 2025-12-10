import React from "react";
import Bas from "./bas.jsx"; // ใช้ bas เดิมของคุณมาสร้าง 2 ฝั่ง

import "./style.css"; // ถ้า bas ใช้ไฟล์นี้อยู่แล้ว

function BattleField() {
  return (
    <div className="battle-wrapper">
      {/* ฝั่งซ้าย = Player 1 */}
      <div className="player-column left-player">
        <h2 className="player-title">🧙 Player 1</h2>
        <Bas playerId="P1" />
      </div>

      {/* ฝั่งขวา = Player 2 */}
      <div className="player-column right-player">
        <h2 className="player-title">🧝 Player 2</h2>
        <Bas playerId="P2" />
      </div>
    </div>
  );
}

export default BattleField;
