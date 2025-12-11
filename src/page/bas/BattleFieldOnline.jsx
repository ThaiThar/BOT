// src/page/BattleFieldOnline.jsx
import React, { useRef } from "react";
import Draggable from "react-draggable"; // ✅ Import Draggable
import Bas from "./bas.jsx"; 
import "./style.css"; 
import { useBasState } from "./hooks/useBasState";

// Import Dice
import Dice from "./ui/Dice.jsx"; 

function BattleFieldOnline({ socket, roomId, myRole, enemyRole }) {
  const finalEnemyRole = enemyRole || (myRole === "P1" ? "P2" : "P1");

  // Ref สำหรับ Draggable (จำเป็นสำหรับ React 18/19 เพื่อกัน Warning)
  const nodeRef = useRef(null);

  const gameState = useBasState({ 
    socket, 
    roomId, 
    myRole, 
    enemyRole: finalEnemyRole, 
    isEnemy: false 
  });

  if (!myRole) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white", backgroundColor: "#222" }}>
        <h2>⏳ กำลังเชื่อมต่อข้อมูล...</h2>
      </div>
    );
  }

  return (
    <div
      className="battle-wrapper"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
         
        backgroundColor: "#1a1a1a",
        position: "relative" 
      }}
    >
      
      {/* 🎲 DICE ZONE (ลากได้อิสระ) */}
      <Draggable 
        nodeRef={nodeRef} 
        bounds="parent" // ห้ามลากออกนอกจอ
        // เริ่มต้นที่กลางจอ (คำนวณคร่าวๆ)
        defaultPosition={{x: (window.innerWidth / 2) - 50, y: (window.innerHeight / 2) - 50}}
      >
        <div 
          ref={nodeRef}
          style={{
            position: "absolute",
            zIndex: 9999, 
            cursor: "move",
            width: "100px",
            height: "100px",

            
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // ใส่ background ใสๆ เวลา debug จะได้เห็นกรอบ (ตอนนี้ปิดไว้)
            // background: "rgba(255,255,255,0.1)", 
            // borderRadius: "50%"
          }}
        >
          {/* ครอบอีกชั้นเพื่อดัก Event: ลากได้ แต่ถ้าคลิกสั้นๆ คือทอย */}
          <div 
            onMouseDown={(e) => {
               // ป้องกัน event ทะลุไปโดนกระดานข้างหลัง
               e.stopPropagation(); 
            }}
          > 
            <Dice 
              value={gameState.diceState.value} 
              rollId={gameState.diceState.rollId} 
              onClick={gameState.rollDice} 
              rollingTime={1000}
            />
          </div>
        </div>
      </Draggable>


      {/* ░░░░░░░░ Enemy Board (ด้านบน) ░░░░░░░░ */}
      <div
        className="enemy-side"
        style={{
          flex: 1,
          transform: "rotate(180deg)",
          borderBottom: "2px solid #ff4444",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
                  }}
      >
        <Bas
          gameState={gameState}
          playerId={finalEnemyRole}
          isEnemy={true}
        />
      </div>

      {/* ░░░░░░░░ My Board (ด้านล่าง) ░░░░░░░░ */}
      <div 
        className="my-side" 
        style={{ 
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderTop: "2px solid #4444ff",
          position: "relative",
                  }}
      >
        <Bas
          gameState={gameState}
          playerId={myRole}
          isEnemy={false}
        />
      </div>
    </div>
  );
}

export default BattleFieldOnline;