import React from "react";
import Bas from "./bas.jsx";
import "./style.css";

function BattleFieldOnline({ socket, roomId, myRole }) {
  const enemyRole = myRole === "P1" ? "P2" : "P1";

  if (!myRole) return <div>กำลังรอระบุตัวตน...</div>;

  return (
    <div
      className="battle-wrapper"
      style={{ flexDirection: "column", height: "100vh" }}
    >
      {/* ░░░░░░░░ Enemy Board (ด้านบน) ░░░░░░░░ */}
      <div
        className="enemy-side"
        style={{
          transform: "rotate(180deg)",
          borderBottom: "2px solid red",
          paddingBottom: "10px",
        }}
      >
        <Bas
          playerId={enemyRole}      // ศัตรู
          socket={socket}
          roomId={roomId}
          isEnemy={true}            // ❌ เดิมเป็น false → แก้เป็น true
          myRole={myRole}
          enemyRole={enemyRole}
        />
      </div>

      {/* ░░░░░░░░ My Board (ด้านล่าง) ░░░░░░░░ */}
      <div className="my-side" style={{ paddingTop: "10px" }}>
        <Bas
          playerId={myRole}         // ผู้เล่นเรา
          socket={socket}
          roomId={roomId}
          isEnemy={false}           // ❌ เดิมเป็น true → แก้เป็น false
          myRole={myRole}
          enemyRole={enemyRole}
        />
      </div>
    </div>
  );
}

export default BattleFieldOnline;
